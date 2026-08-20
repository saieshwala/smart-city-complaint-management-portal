import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class RoutingService {
  private readonly logger = new Logger(RoutingService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findMatchingRule(categoryId: string, subcategoryId?: string | null) {
    // Try specific match first (with subcategory)
    if (subcategoryId) {
      const specificRule = await this.prisma.routingRule.findFirst({
        where: {
          categoryId,
          subcategoryId,
          isActive: true,
        },
        include: { authority: true, department: true, category: true, subcategory: true },
        orderBy: { createdAt: 'desc' },
      });
      if (specificRule) return specificRule;
    }

    // Fallback: category-only match
    const fallbackRule = await this.prisma.routingRule.findFirst({
      where: {
        categoryId,
        subcategoryId: null,
        isActive: true,
      },
      include: { authority: true, department: true, category: true, subcategory: true },
      orderBy: { createdAt: 'desc' },
    });

    return fallbackRule;
  }

  async getRoutingRules(authorityId?: string) {
    return this.prisma.routingRule.findMany({
      where: authorityId ? { authorityId } : undefined,
      include: {
        authority: true,
        department: true,
        category: true,
        subcategory: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createRule(data: {
    authorityId: string;
    categoryId: string;
    subcategoryId?: string;
    departmentId: string;
    priority?: any;
  }) {
    return this.prisma.routingRule.create({
      data: {
        authorityId: data.authorityId,
        categoryId: data.categoryId,
        subcategoryId: data.subcategoryId,
        departmentId: data.departmentId,
        priority: data.priority || 'MEDIUM',
      },
      include: { authority: true, department: true, category: true, subcategory: true },
    });
  }

  async updateRule(
    id: string,
    data: Partial<{
      departmentId: string;
      priority: any;
      isActive: boolean;
    }>,
  ) {
    const rule = await this.prisma.routingRule.findUnique({ where: { id } });
    if (!rule) throw new NotFoundException(`Routing rule ${id} not found`);

    return this.prisma.routingRule.update({
      where: { id },
      data,
      include: { authority: true, department: true, category: true, subcategory: true },
    });
  }

  async deleteRule(id: string) {
    const rule = await this.prisma.routingRule.findUnique({ where: { id } });
    if (!rule) throw new NotFoundException(`Routing rule ${id} not found`);

    return this.prisma.routingRule.delete({ where: { id } });
  }
}
