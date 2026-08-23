import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

export interface CreateAuditLogInput {
  adminId?: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  complaintId?: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateAuditLogInput) {
    try {
      return await this.prisma.auditLog.create({
        data: {
          adminId: input.adminId || null,
          userId: input.userId || null,
          action: input.action,
          entityType: input.entityType,
          entityId: input.entityId || null,
          complaintId: input.complaintId || null,
          oldValues: input.oldValues || null,
          newValues: input.newValues || null,
          ipAddress: input.ipAddress || null,
          userAgent: input.userAgent || null,
        },
      });
    } catch (error) {
      this.logger.error('Failed to create audit log', error);
    }
  }

  async findAll(filters: {
    action?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    page: number;
    limit: number;
  }) {
    const where: any = {};

    if (filters.action) {
      where.action = filters.action;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
      if (filters.dateTo) {
        const to = new Date(filters.dateTo);
        to.setHours(23, 59, 59, 999);
        where.createdAt.lte = to;
      }
    }

    if (filters.search) {
      where.OR = [
        { action: { contains: filters.search, mode: 'insensitive' } },
        { entityType: { contains: filters.search, mode: 'insensitive' } },
        { admin: { name: { contains: filters.search, mode: 'insensitive' } } },
        { admin: { email: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    const skip = (filters.page - 1) * filters.limit;

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          admin: { select: { id: true, name: true, email: true } },
          user: { select: { id: true, name: true, email: true } },
          complaint: { select: { id: true, publicId: true, title: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: filters.limit,
      }),
      this.prisma.auditLog.count({ where }),
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
}
