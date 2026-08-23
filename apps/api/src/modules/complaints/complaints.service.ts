import {
  Injectable,
  Optional,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ComplaintStatus } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateComplaintDto, UpdateComplaintDto, VerifyResolutionDto } from './dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import {
  PaginatedResult,
  PaginationMeta,
} from '../common/interceptors/transform.interceptor';

/** Statuses that allow editing */
const EDITABLE_STATUSES: ComplaintStatus[] = [
  ComplaintStatus.DRAFT,
  ComplaintStatus.AWAITING_USER_CONFIRMATION,
  ComplaintStatus.READY_TO_SUBMIT,
];

@Injectable()
export class ComplaintsService {
  private readonly logger = new Logger(ComplaintsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Optional()
    @InjectQueue('complaint-submission')
    private readonly submissionQueue?: Queue,
  ) {}

  // ---------------------------------------------------------------------------
  // Public ID generation
  // ---------------------------------------------------------------------------

  /**
   * Generate a public ID in CIV-YYYY-NNNNNN format.
   * Uses a count of existing complaints to determine the sequence number.
   */
  private async generatePublicId(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `CIV-${year}-`;

    const count = await this.prisma.complaint.count({
      where: {
        publicId: { startsWith: prefix },
      },
    });

    const sequence = (count + 1).toString().padStart(6, '0');
    return `${prefix}${sequence}`;
  }

  // ---------------------------------------------------------------------------
  // Create
  // ---------------------------------------------------------------------------

  async create(userId: string, dto: CreateComplaintDto) {
    const publicId = await this.generatePublicId();

    return this.prisma.$transaction(async (tx) => {
      const complaint = await tx.complaint.create({
        data: {
          publicId,
          userId,
          title: dto.title,
          description: dto.description,
          categoryId: dto.categoryId,
          subcategoryId: dto.subcategoryId,
          latitude: dto.latitude,
          longitude: dto.longitude,
          address: dto.address,
          locationSource: dto.locationSource,
          ...(dto.severity ? { severity: dto.severity } : {}),
          reportedAt: new Date(dto.reportedAt),
          status: ComplaintStatus.DRAFT,
        },
        include: {
          category: true,
          subcategory: true,
          images: true,
        },
      });

      // Record initial status history
      await tx.complaintStatusHistory.create({
        data: {
          complaintId: complaint.id,
          oldStatus: null,
          newStatus: ComplaintStatus.DRAFT,
          changedByUserId: userId,
          reason: 'Complaint created',
        },
      });

      return complaint;
    });
  }

  // ---------------------------------------------------------------------------
  // Find all by user (paginated)
  // ---------------------------------------------------------------------------

  async findAllByUser(
    userId: string,
    pagination: PaginationDto,
  ): Promise<PaginatedResult<any>> {
    const [items, total] = await Promise.all([
      this.prisma.complaint.findMany({
        where: { userId },
        include: {
          images: true,
          category: true,
          subcategory: true,
        },
        orderBy: { createdAt: pagination.order },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      this.prisma.complaint.count({ where: { userId } }),
    ]);

    const totalPages = Math.ceil(total / pagination.limit);
    const meta: PaginationMeta = {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages,
      hasNextPage: pagination.page < totalPages,
      hasPreviousPage: pagination.page > 1,
    };

    return { items, meta };
  }

  // ---------------------------------------------------------------------------
  // Find by ID (with ownership check)
  // ---------------------------------------------------------------------------

  async findById(id: string, userId: string) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id },
      include: {
        images: true,
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
        category: true,
        subcategory: true,
        authority: true,
        department: true,
      },
    });

    if (!complaint) {
      throw new NotFoundException(`Complaint with ID "${id}" not found`);
    }

    if (complaint.userId !== userId) {
      throw new ForbiddenException('You do not have access to this complaint');
    }

    return complaint;
  }

  // ---------------------------------------------------------------------------
  // Update (only if editable status)
  // ---------------------------------------------------------------------------

  async update(id: string, userId: string, dto: UpdateComplaintDto) {
    const complaint = await this.findById(id, userId);

    if (!EDITABLE_STATUSES.includes(complaint.status)) {
      throw new BadRequestException(
        `Complaint cannot be updated in "${complaint.status}" status. ` +
          `Allowed statuses: ${EDITABLE_STATUSES.join(', ')}`,
      );
    }

    return this.prisma.complaint.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        categoryId: dto.categoryId,
        subcategoryId: dto.subcategoryId,
      },
      include: {
        category: true,
        subcategory: true,
        images: true,
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------

  async submit(id: string, userId: string) {
    const complaint = await this.findById(id, userId);

    if (
      complaint.status !== ComplaintStatus.DRAFT &&
      complaint.status !== ComplaintStatus.READY_TO_SUBMIT
    ) {
      throw new BadRequestException(
        `Complaint cannot be submitted in "${complaint.status}" status`,
      );
    }

    // Determine authority and department via routing rules
    const routing = await this.determineRouting(complaint);

    // Calculate SLA deadline (default 72 hours if no SLA rule found)
    const slaDeadline = await this.calculateSlaDeadline(
      routing.authorityId,
      complaint.categoryId,
      complaint.priority,
    );

    const updatedComplaint = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.complaint.update({
        where: { id },
        data: {
          status: ComplaintStatus.SUBMITTED,
          submittedAt: new Date(),
          authorityId: routing.authorityId,
          departmentId: routing.departmentId,
          expectedResolutionAt: slaDeadline,
        },
        include: {
          category: true,
          subcategory: true,
          images: true,
          authority: true,
          department: true,
        },
      });

      await tx.complaintStatusHistory.create({
        data: {
          complaintId: id,
          oldStatus: complaint.status,
          newStatus: ComplaintStatus.SUBMITTED,
          changedByUserId: userId,
          reason: 'Complaint submitted by citizen',
        },
      });

      return updated;
    });

    // Queue the submission job for async processing
    if (this.submissionQueue) {
      await this.submissionQueue.add('process-submission', {
        complaintId: id,
        publicId: updatedComplaint.publicId,
        authorityId: routing.authorityId,
        departmentId: routing.departmentId,
      });
      this.logger.log(
        `Complaint ${updatedComplaint.publicId} submitted and queued for processing`,
      );
    } else {
      this.logger.warn(
        `Complaint ${updatedComplaint.publicId} submitted but Redis queue is unavailable — skipping async processing`,
      );
    }

    return updatedComplaint;
  }

  // ---------------------------------------------------------------------------
  // Verify Resolution
  // ---------------------------------------------------------------------------

  async verifyResolution(id: string, userId: string, dto: VerifyResolutionDto) {
    const complaint = await this.findById(id, userId);

    if (complaint.status !== ComplaintStatus.RESOLVED) {
      throw new BadRequestException(
        'Resolution can only be verified when complaint status is RESOLVED',
      );
    }

    if (dto.verified) {
      // Citizen confirms resolution -- close the complaint
      return this.prisma.$transaction(async (tx) => {
        const updated = await tx.complaint.update({
          where: { id },
          data: {
            status: ComplaintStatus.CLOSED,
            citizenVerified: true,
            citizenVerificationNote: dto.note,
            closedAt: new Date(),
          },
          include: {
            category: true,
            subcategory: true,
            images: true,
          },
        });

        await tx.complaintStatusHistory.create({
          data: {
            complaintId: id,
            oldStatus: ComplaintStatus.RESOLVED,
            newStatus: ComplaintStatus.CLOSED,
            changedByUserId: userId,
            reason: dto.note || 'Citizen verified resolution',
          },
        });

        return updated;
      });
    } else {
      // Citizen rejects resolution -- reopen the complaint
      return this.prisma.$transaction(async (tx) => {
        const updated = await tx.complaint.update({
          where: { id },
          data: {
            status: ComplaintStatus.IN_PROGRESS,
            citizenVerified: false,
            citizenVerificationNote: dto.note,
            resolvedAt: null,
          },
          include: {
            category: true,
            subcategory: true,
            images: true,
          },
        });

        await tx.complaintStatusHistory.create({
          data: {
            complaintId: id,
            oldStatus: ComplaintStatus.RESOLVED,
            newStatus: ComplaintStatus.IN_PROGRESS,
            changedByUserId: userId,
            reason:
              dto.note || 'Citizen rejected resolution — complaint reopened',
          },
        });

        return updated;
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Reopen
  // ---------------------------------------------------------------------------

  async reopen(id: string, userId: string, reason: string) {
    const complaint = await this.findById(id, userId);

    if (
      complaint.status !== ComplaintStatus.CLOSED &&
      complaint.status !== ComplaintStatus.RESOLVED
    ) {
      throw new BadRequestException(
        `Complaint cannot be reopened in "${complaint.status}" status. ` +
          'Only CLOSED or RESOLVED complaints can be reopened.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.complaint.update({
        where: { id },
        data: {
          status: ComplaintStatus.IN_PROGRESS,
          resolvedAt: null,
          closedAt: null,
          citizenVerified: null,
          citizenVerificationNote: null,
        },
        include: {
          category: true,
          subcategory: true,
          images: true,
        },
      });

      await tx.complaintStatusHistory.create({
        data: {
          complaintId: id,
          oldStatus: complaint.status,
          newStatus: ComplaintStatus.IN_PROGRESS,
          changedByUserId: userId,
          reason: reason || 'Complaint reopened by citizen',
        },
      });

      return updated;
    });
  }

  // ---------------------------------------------------------------------------
  // Status History
  // ---------------------------------------------------------------------------

  async getHistory(id: string, userId: string) {
    // Verify ownership first
    await this.findById(id, userId);

    return this.prisma.complaintStatusHistory.findMany({
      where: { complaintId: id },
      orderBy: { createdAt: 'asc' },
    });
  }

  // ---------------------------------------------------------------------------
  // Public Complaints (map view, no PII)
  // ---------------------------------------------------------------------------

  async findPublicComplaints(
    pagination: PaginationDto,
  ): Promise<PaginatedResult<any>> {
    const where = { isPublic: true, status: { not: ComplaintStatus.DRAFT } };

    const [items, total] = await Promise.all([
      this.prisma.complaint.findMany({
        where,
        select: {
          id: true,
          publicId: true,
          title: true,
          status: true,
          priority: true,
          severity: true,
          latitude: true,
          longitude: true,
          address: true,
          city: true,
          district: true,
          state: true,
          category: { select: { id: true, name: true, slug: true, icon: true } },
          subcategory: { select: { id: true, name: true, slug: true } },
          createdAt: true,
          submittedAt: true,
          resolvedAt: true,
        },
        orderBy: { createdAt: pagination.order },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      this.prisma.complaint.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pagination.limit);
    const meta: PaginationMeta = {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages,
      hasNextPage: pagination.page < totalPages,
      hasPreviousPage: pagination.page > 1,
    };

    return { items, meta };
  }

  // ---------------------------------------------------------------------------
  // Find by Public ID (tracking, limited fields)
  // ---------------------------------------------------------------------------

  async findByPublicId(publicId: string) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { publicId },
      select: {
        id: true,
        publicId: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        severity: true,
        latitude: true,
        longitude: true,
        address: true,
        city: true,
        district: true,
        state: true,
        category: { select: { id: true, name: true, slug: true, icon: true } },
        subcategory: { select: { id: true, name: true, slug: true } },
        authority: { select: { id: true, name: true, type: true } },
        department: { select: { id: true, name: true } },
        statusHistory: {
          select: {
            id: true,
            oldStatus: true,
            newStatus: true,
            reason: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'asc' },
        },
        images: {
          select: {
            id: true,
            storageKey: true,
            thumbnailKey: true,
            isPrimary: true,
          },
        },
        createdAt: true,
        submittedAt: true,
        resolvedAt: true,
        closedAt: true,
        expectedResolutionAt: true,
      },
    });

    if (!complaint) {
      throw new NotFoundException(
        `Complaint with public ID "${publicId}" not found`,
      );
    }

    return complaint;
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * Determine authority and department for a complaint based on routing rules.
   * Falls back to null if no routing rule matches.
   */
  private async determineRouting(complaint: {
    categoryId: string | null;
    subcategoryId: string | null;
  }): Promise<{ authorityId: string | null; departmentId: string | null }> {
    if (!complaint.categoryId) {
      return { authorityId: null, departmentId: null };
    }

    // Try to find a matching routing rule (most specific first: with subcategory)
    const routingRule = await this.prisma.routingRule.findFirst({
      where: {
        categoryId: complaint.categoryId,
        subcategoryId: complaint.subcategoryId || undefined,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (routingRule) {
      return {
        authorityId: routingRule.authorityId,
        departmentId: routingRule.departmentId,
      };
    }

    // Fallback: try matching by category only (without subcategory)
    if (complaint.subcategoryId) {
      const fallbackRule = await this.prisma.routingRule.findFirst({
        where: {
          categoryId: complaint.categoryId,
          subcategoryId: null,
          isActive: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (fallbackRule) {
        return {
          authorityId: fallbackRule.authorityId,
          departmentId: fallbackRule.departmentId,
        };
      }
    }

    return { authorityId: null, departmentId: null };
  }

  /**
   * Calculate SLA deadline based on SLA rules.
   * Defaults to 72 hours from now if no specific rule is found.
   */
  private async calculateSlaDeadline(
    authorityId: string | null,
    categoryId: string | null,
    priority: string,
  ): Promise<Date> {
    const DEFAULT_HOURS = 72;

    if (!authorityId) {
      return new Date(Date.now() + DEFAULT_HOURS * 60 * 60 * 1000);
    }

    // Try to find the most specific SLA rule
    const slaRule = await this.prisma.slaRule.findFirst({
      where: {
        authorityId,
        categoryId: categoryId || undefined,
        priority: (priority as any) || undefined,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const hours = slaRule?.resolutionHours ?? DEFAULT_HOURS;
    return new Date(Date.now() + hours * 60 * 60 * 1000);
  }
}
