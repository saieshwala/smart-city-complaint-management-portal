import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ComplaintsService } from './complaints.service';
import {
  CreateComplaintDto,
  UpdateComplaintDto,
  VerifyResolutionDto,
} from './dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Complaints')
@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  // ---------------------------------------------------------------------------
  // Protected citizen endpoints
  // ---------------------------------------------------------------------------

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new complaint' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateComplaintDto,
  ) {
    return this.complaintsService.create(userId, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List current user's complaints" })
  async findAll(
    @CurrentUser('id') userId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.complaintsService.findAllByUser(userId, pagination);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get complaint detail by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.complaintsService.findById(id, userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a complaint (only in editable statuses)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateComplaintDto,
  ) {
    return this.complaintsService.update(id, userId, dto);
  }

  @Post(':id/submit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit a complaint for processing' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async submit(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.complaintsService.submit(id, userId);
  }

  @Post(':id/verify-resolution')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify or reject the resolution of a complaint' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async verifyResolution(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: VerifyResolutionDto,
  ) {
    return this.complaintsService.verifyResolution(id, userId, dto);
  }

  @Post(':id/reopen')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reopen a closed or resolved complaint' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async reopen(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @Body('reason') reason: string,
  ) {
    return this.complaintsService.reopen(id, userId, reason);
  }

  @Get(':id/history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get status history for a complaint' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async getHistory(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.complaintsService.getHistory(id, userId);
  }
}

// ---------------------------------------------------------------------------
// Public endpoints (no auth required)
// ---------------------------------------------------------------------------

@ApiTags('Public Complaints')
@Controller('public/complaints')
export class PublicComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Get()
  @ApiOperation({ summary: 'Get public complaints for map view' })
  async findPublicComplaints(@Query() pagination: PaginationDto) {
    return this.complaintsService.findPublicComplaints(pagination);
  }

  @Get(':publicId')
  @ApiOperation({ summary: 'Track a complaint by its public ID' })
  @ApiParam({ name: 'publicId', type: 'string' })
  async findByPublicId(@Param('publicId') publicId: string) {
    return this.complaintsService.findByPublicId(publicId);
  }
}
