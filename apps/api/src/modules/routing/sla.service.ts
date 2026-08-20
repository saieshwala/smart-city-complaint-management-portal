import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { ComplaintStatus } from '@prisma/client';

@Injectable()
export class SlaService {
  private readonly logger = new Logger(SlaService.name);

  constructor(private readonly prisma: PrismaService) {}

  async calculateDeadline(
    authorityId: string | null,
    categoryId: string | null,
    priority: string,
  ): Promise<Date> {
    const DEFAULT_HOURS = 72;

    if (!authorityId) {
      return new Date(Date.now() + DEFAULT_HOURS * 60 * 60 * 1000);
    }

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

  async getSlaRules(authorityId?: string) {
    return this.prisma.slaRule.findMany({
      where: authorityId ? { authorityId } : undefined,
      include: { authority: true, category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createSlaRule(data: {
    authorityId: string;
    categoryId?: string;
    priority?: any;
    resolutionHours: number;
    escalationHours?: number;
  }) {
    return this.prisma.slaRule.create({
      data: {
        authorityId: data.authorityId,
        categoryId: data.categoryId,
        priority: data.priority,
        resolutionHours: data.resolutionHours,
        escalationHours: data.escalationHours,
      },
      include: { authority: true, category: true },
    });
  }

  async updateSlaRule(
    id: string,
    data: Partial<{
      resolutionHours: number;
      escalationHours: number;
      isActive: boolean;
    }>,
  ) {
    const rule = await this.prisma.slaRule.findUnique({ where: { id } });
    if (!rule) throw new NotFoundException(`SLA rule ${id} not found`);

    return this.prisma.slaRule.update({
      where: { id },
      data,
      include: { authority: true, category: true },
    });
  }

  async checkSlaBreaches() {
    const now = new Date();

    const breached = await this.prisma.complaint.findMany({
      where: {
        expectedResolutionAt: { lt: now },
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
      include: {
        category: true,
        authority: true,
        department: true,
      },
      orderBy: { expectedResolutionAt: 'asc' },
    });

    this.logger.log(`Found ${breached.length} SLA-breached complaints`);
    return breached;
  }
}
