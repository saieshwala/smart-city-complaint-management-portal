import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AdminService } from './admin.service';
import { AnalyticsService } from './analytics.service';
import { AuditLogService } from './audit-log.service';
import {
  UpdateComplaintStatusDto,
  AssignComplaintDto,
  AddNoteDto,
} from './dto';

@Controller('admin')
@UseGuards(AdminAuthGuard)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly analyticsService: AnalyticsService,
    private readonly auditLogService: AuditLogService,
  ) {}

  // ---- Complaints ----

  @Get('complaints')
  async getComplaints(
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('authority') authority?: string,
    @Query('search') search?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getAllComplaints({
      status,
      category,
      authority,
      search,
      dateFrom,
      dateTo,
      page: parseInt(page || '1', 10),
      limit: parseInt(limit || '20', 10),
    });
  }

  @Get('complaints/:id')
  async getComplaint(@Param('id') id: string) {
    return this.adminService.getComplaintById(id);
  }

  @Patch('complaints/:id/status')
  async updateStatus(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body() dto: UpdateComplaintStatusDto,
  ) {
    return this.adminService.updateComplaintStatus(
      id,
      adminId,
      dto.status,
      dto.reason,
    );
  }

  @Patch('complaints/:id/assign')
  async assignComplaint(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body() dto: AssignComplaintDto,
  ) {
    return this.adminService.assignComplaint(id, dto.officerId, adminId);
  }

  @Post('complaints/:id/notes')
  async addNote(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body() dto: AddNoteDto,
  ) {
    return this.adminService.addNote(id, adminId, dto.note);
  }

  // ---- Departments ----

  @Get('departments')
  async getDepartments() {
    return this.adminService.getDepartments();
  }

  // ---- Officers ----

  @Get('officers')
  async getOfficers() {
    return this.adminService.getOfficers();
  }

  // ---- Audit Logs ----

  @Get('audit-logs')
  async getAuditLogs(
    @Query('action') action?: string,
    @Query('search') search?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.auditLogService.findAll({
      action,
      search,
      dateFrom,
      dateTo,
      page: parseInt(page || '1', 10),
      limit: parseInt(limit || '20', 10),
    });
  }

  // ---- Stats ----

  @Get('stats')
  async getStats() {
    return this.adminService.getStats();
  }

  // ---- Analytics ----

  @Get('analytics/overview')
  async getAnalyticsOverview(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.analyticsService.getOverview(dateFrom, dateTo);
  }

  @Get('analytics/by-category')
  async getByCategory(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.analyticsService.getByCategory(dateFrom, dateTo);
  }

  @Get('analytics/by-status')
  async getByStatus() {
    return this.analyticsService.getByStatus();
  }

  @Get('analytics/trend')
  async getTrend(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.analyticsService.getTrend(dateFrom, dateTo);
  }

  @Get('analytics/top-areas')
  async getTopAreas() {
    return this.analyticsService.getTopAreas();
  }
}
