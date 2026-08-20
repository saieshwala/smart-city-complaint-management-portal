import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { ComplaintStatus } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getOverview(dateFrom?: string, dateTo?: string) {
    const where: any = {};
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const [total, resolved, pending] = await Promise.all([
      this.prisma.complaint.count({ where }),
      this.prisma.complaint.count({
        where: {
          ...where,
          status: { in: [ComplaintStatus.RESOLVED, ComplaintStatus.CLOSED] },
        },
      }),
      this.prisma.complaint.count({
        where: {
          ...where,
          status: {
            in: [
              ComplaintStatus.SUBMITTED,
              ComplaintStatus.RECEIVED,
              ComplaintStatus.UNDER_REVIEW,
              ComplaintStatus.ASSIGNED,
              ComplaintStatus.IN_PROGRESS,
            ],
          },
        },
      }),
    ]);

    // Avg resolution time (for resolved complaints with both submittedAt and resolvedAt)
    const resolvedComplaints = await this.prisma.complaint.findMany({
      where: {
        ...where,
        status: { in: [ComplaintStatus.RESOLVED, ComplaintStatus.CLOSED] },
        submittedAt: { not: null },
        resolvedAt: { not: null },
      },
      select: { submittedAt: true, resolvedAt: true },
      take: 1000,
    });

    let avgResolutionHours = 0;
    if (resolvedComplaints.length > 0) {
      const totalHours = resolvedComplaints.reduce((sum, c) => {
        const diff =
          (c.resolvedAt!.getTime() - c.submittedAt!.getTime()) / (1000 * 60 * 60);
        return sum + diff;
      }, 0);
      avgResolutionHours = Math.round(totalHours / resolvedComplaints.length);
    }

    return {
      total,
      resolved,
      pending,
      avgResolutionHours,
    };
  }

  async getByCategory(dateFrom?: string, dateTo?: string) {
    const where: any = { categoryId: { not: null } };
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const results = await this.prisma.complaint.groupBy({
      by: ['categoryId'],
      where,
      _count: true,
      orderBy: { _count: { categoryId: 'desc' } },
    });

    // Enrich with category names
    const categoryIds = results.map((r) => r.categoryId!);
    const categories = await this.prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true, slug: true },
    });

    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    return results.map((r) => ({
      categoryId: r.categoryId,
      categoryName: categoryMap.get(r.categoryId!)?.name || 'Unknown',
      categorySlug: categoryMap.get(r.categoryId!)?.slug || 'unknown',
      count: r._count,
    }));
  }

  async getByStatus() {
    const results = await this.prisma.complaint.groupBy({
      by: ['status'],
      _count: true,
    });

    return results.map((r) => ({
      status: r.status,
      count: r._count,
    }));
  }

  async getTrend(dateFrom?: string, dateTo?: string) {
    const from = dateFrom
      ? new Date(dateFrom)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const to = dateTo ? new Date(dateTo) : new Date();

    const complaints = await this.prisma.complaint.findMany({
      where: {
        createdAt: { gte: from, lte: to },
      },
      select: { createdAt: true, status: true },
      orderBy: { createdAt: 'asc' },
    });

    // Group by date
    const dailyMap = new Map<string, number>();
    complaints.forEach((c) => {
      const dateKey = c.createdAt.toISOString().split('T')[0];
      dailyMap.set(dateKey, (dailyMap.get(dateKey) || 0) + 1);
    });

    return Array.from(dailyMap.entries()).map(([date, count]) => ({
      date,
      count,
    }));
  }

  async getTopAreas() {
    const results = await this.prisma.complaint.groupBy({
      by: ['city', 'district', 'state'],
      _count: true,
      orderBy: { _count: { city: 'desc' } },
      take: 10,
      where: { city: { not: null } },
    });

    return results.map((r) => ({
      city: r.city,
      district: r.district,
      state: r.state,
      count: r._count,
    }));
  }
}
