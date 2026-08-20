import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { MockGovernmentProvider } from './providers/mock-government.provider';
import { IntegrationStatus } from '@prisma/client';

@Injectable()
export class GovernmentService {
  private readonly logger = new Logger(GovernmentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mockProvider: MockGovernmentProvider,
  ) {}

  async submitComplaint(complaintId: string) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id: complaintId },
      include: {
        authority: { include: { integrationConfigs: true } },
        category: true,
        subcategory: true,
        images: true,
      },
    });

    if (!complaint) {
      throw new NotFoundException(`Complaint ${complaintId} not found`);
    }

    // Find integration config for the authority
    const integrationConfig = complaint.authority?.integrationConfigs?.find(
      (c) => c.isActive,
    );

    try {
      // Use mock provider for now (future: dispatch based on integration type)
      const result = await this.mockProvider.submit(
        complaint,
        integrationConfig?.config || {},
      );

      if (result.success) {
        await this.prisma.complaint.update({
          where: { id: complaintId },
          data: {
            externalReference: result.externalReference,
            integrationStatus: IntegrationStatus.SUCCESS,
            lastSubmissionAttempt: new Date(),
          },
        });

        this.logger.log(
          `Complaint ${complaint.publicId} submitted successfully. External ref: ${result.externalReference}`,
        );
      } else {
        await this.prisma.complaint.update({
          where: { id: complaintId },
          data: {
            integrationStatus: IntegrationStatus.FAILED,
            integrationError: result.error,
            lastSubmissionAttempt: new Date(),
            retryCount: { increment: 1 },
          },
        });

        this.logger.warn(
          `Complaint ${complaint.publicId} submission failed: ${result.error}`,
        );
      }

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      await this.prisma.complaint.update({
        where: { id: complaintId },
        data: {
          integrationStatus: IntegrationStatus.FAILED,
          integrationError: errorMessage,
          lastSubmissionAttempt: new Date(),
          retryCount: { increment: 1 },
        },
      });

      this.logger.error(
        `Complaint ${complaint.publicId} submission error: ${errorMessage}`,
      );
      throw error;
    }
  }

  async checkStatus(complaintId: string) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id: complaintId },
      include: {
        authority: { include: { integrationConfigs: true } },
      },
    });

    if (!complaint || !complaint.externalReference) {
      throw new NotFoundException(
        `Complaint ${complaintId} not found or has no external reference`,
      );
    }

    const integrationConfig = complaint.authority?.integrationConfigs?.find(
      (c) => c.isActive,
    );

    const result = await this.mockProvider.checkStatus(
      complaint.externalReference,
      integrationConfig?.config || {},
    );

    return result;
  }

  async syncStatus(complaintId: string) {
    const statusResult = await this.checkStatus(complaintId);

    await this.prisma.complaint.update({
      where: { id: complaintId },
      data: {
        externalStatus: statusResult.status,
      },
    });

    this.logger.log(
      `Synced external status for complaint ${complaintId}: ${statusResult.status}`,
    );

    return statusResult;
  }
}
