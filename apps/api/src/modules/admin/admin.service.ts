import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { ComplaintStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getAllComplaints(filters: {
    status?: string;
    category?: string;
    authority?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    page: number;
    limit: number;
  }) {
    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.category) {
      where.categoryId = filters.category;
    }
    if (filters.authority) {
      where.authorityId = filters.authority;
    }
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { publicId: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
    }

    const skip = (filters.page - 1) * filters.limit;

    const [items, total] = await Promise.all([
      this.prisma.complaint.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          category: true,
          subcategory: true,
          authority: true,
          department: true,
          assignedOfficer: { select: { id: true, name: true } },
          images: { select: { id: true, storageKey: true, isPrimary: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: filters.limit,
      }),
      this.prisma.complaint.count({ where }),
    ]);

    return {
      items,
      meta: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
      },
    };
  }

  async getComplaintById(id: string) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        category: true,
        subcategory: true,
        authority: true,
        department: true,
        assignedOfficer: { select: { id: true, name: true, email: true } },
        images: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
        adminNotes: {
          include: { admin: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
        },
        aiAnalyses: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    if (!complaint) {
      throw new NotFoundException(`Complaint ${id} not found`);
    }

    return complaint;
  }

  async updateComplaintStatus(
    id: string,
    adminId: string,
    newStatus: string,
    reason?: string,
  ) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id },
    });

    if (!complaint) {
      throw new NotFoundException(`Complaint ${id} not found`);
    }

    const validStatuses = Object.values(ComplaintStatus);
    if (!validStatuses.includes(newStatus as ComplaintStatus)) {
      throw new BadRequestException(`Invalid status: ${newStatus}`);
    }

    return this.prisma.$transaction(async (tx) => {
      const updateData: any = {
        status: newStatus as ComplaintStatus,
      };

      if (newStatus === ComplaintStatus.RESOLVED) {
        updateData.resolvedAt = new Date();
      }
      if (newStatus === ComplaintStatus.CLOSED) {
        updateData.closedAt = new Date();
      }
      if (newStatus === ComplaintStatus.RECEIVED) {
        updateData.receivedAt = new Date();
      }

      const updated = await tx.complaint.update({
        where: { id },
        data: updateData,
        include: {
          category: true,
          authority: true,
          department: true,
        },
      });

      await tx.complaintStatusHistory.create({
        data: {
          complaintId: id,
          oldStatus: complaint.status,
          newStatus: newStatus as ComplaintStatus,
          changedByAdminId: adminId,
          reason: reason || `Status changed to ${newStatus} by admin`,
        },
      });

      return updated;
    });
  }

  async assignComplaint(id: string, officerId: string, adminId: string) {
    const complaint = await this.prisma.complaint.findUnique({ where: { id } });
    if (!complaint) throw new NotFoundException(`Complaint ${id} not found`);

    const officer = await this.prisma.adminUser.findUnique({
      where: { id: officerId },
    });
    if (!officer) throw new NotFoundException(`Officer ${officerId} not found`);

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.complaint.update({
        where: { id },
        data: {
          assignedOfficerId: officerId,
          status: ComplaintStatus.ASSIGNED,
        },
        include: {
          assignedOfficer: { select: { id: true, name: true } },
        },
      });

      await tx.complaintStatusHistory.create({
        data: {
          complaintId: id,
          oldStatus: complaint.status,
          newStatus: ComplaintStatus.ASSIGNED,
          changedByAdminId: adminId,
          reason: `Assigned to ${officer.name}`,
        },
      });

      return updated;
    });
  }

  async addNote(complaintId: string, adminId: string, note: string) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id: complaintId },
    });
    if (!complaint) throw new NotFoundException(`Complaint ${complaintId} not found`);

    return this.prisma.adminNote.create({
      data: {
        complaintId,
        adminId,
        note,
      },
      include: {
        admin: { select: { id: true, name: true } },
      },
    });
  }

  async getStats() {
    const [total, byStatus, recentResolved] = await Promise.all([
      this.prisma.complaint.count(),
      this.prisma.complaint.groupBy({
        by: ['status'],
        _count: true,
      }),
      this.prisma.complaint.count({
        where: {
          status: ComplaintStatus.RESOLVED,
          resolvedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    const statusCounts: Record<string, number> = {};
    byStatus.forEach((s) => {
      statusCounts[s.status] = s._count;
    });

    return {
      total,
      byStatus: statusCounts,
      resolvedLast30Days: recentResolved,
      pending:
        (statusCounts['SUBMITTED'] || 0) +
        (statusCounts['RECEIVED'] || 0) +
        (statusCounts['UNDER_REVIEW'] || 0),
      inProgress:
        (statusCounts['ASSIGNED'] || 0) +
        (statusCounts['IN_PROGRESS'] || 0),
      resolved: statusCounts['RESOLVED'] || 0,
      closed: statusCounts['CLOSED'] || 0,
    };
  }
}
