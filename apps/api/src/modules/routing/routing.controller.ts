import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { RoutingService } from './routing.service';
import { SlaService } from './sla.service';

@Controller('routing')
@UseGuards(AdminAuthGuard)
export class RoutingController {
  constructor(
    private readonly routingService: RoutingService,
    private readonly slaService: SlaService,
  ) {}

  // ---- Routing Rules ----

  @Get('rules')
  async getRules(@Query('authorityId') authorityId?: string) {
    return this.routingService.getRoutingRules(authorityId);
  }

  @Post('rules')
  async createRule(
    @Body()
    body: {
      authorityId: string;
      categoryId: string;
      subcategoryId?: string;
      departmentId: string;
      priority?: string;
    },
  ) {
    return this.routingService.createRule(body);
  }

  @Put('rules/:id')
  async updateRule(
    @Param('id') id: string,
    @Body() body: { departmentId?: string; priority?: string; isActive?: boolean },
  ) {
    return this.routingService.updateRule(id, body);
  }

  @Delete('rules/:id')
  async deleteRule(@Param('id') id: string) {
    await this.routingService.deleteRule(id);
    return { deleted: true };
  }

  // ---- SLA Rules ----

  @Get('sla')
  async getSlaRules(@Query('authorityId') authorityId?: string) {
    return this.slaService.getSlaRules(authorityId);
  }

  @Post('sla')
  async createSlaRule(
    @Body()
    body: {
      authorityId: string;
      categoryId?: string;
      priority?: string;
      resolutionHours: number;
      escalationHours?: number;
    },
  ) {
    return this.slaService.createSlaRule(body);
  }

  @Put('sla/:id')
  async updateSlaRule(
    @Param('id') id: string,
    @Body() body: { resolutionHours?: number; escalationHours?: number; isActive?: boolean },
  ) {
    return this.slaService.updateSlaRule(id, body);
  }

  @Get('sla/breaches')
  async checkBreaches() {
    return this.slaService.checkSlaBreaches();
  }
}
