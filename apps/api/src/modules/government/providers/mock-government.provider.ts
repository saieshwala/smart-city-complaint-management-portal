import { Injectable, Logger } from '@nestjs/common';
import {
  GovernmentProvider,
  SubmissionResult,
  StatusCheckResult,
} from './government-provider.interface';

@Injectable()
export class MockGovernmentProvider implements GovernmentProvider {
  private readonly logger = new Logger(MockGovernmentProvider.name);

  async submit(complaint: any, _config: any): Promise<SubmissionResult> {
    this.logger.log(
      `[MOCK] Submitting complaint ${complaint.publicId} to government portal`,
    );

    // Simulate a short processing delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const externalReference = `GOV-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    this.logger.log(
      `[MOCK] Complaint ${complaint.publicId} submitted successfully. External ref: ${externalReference}`,
    );

    return {
      success: true,
      externalReference,
    };
  }

  async checkStatus(
    externalReference: string,
    _config: any,
  ): Promise<StatusCheckResult> {
    this.logger.log(
      `[MOCK] Checking status for external reference: ${externalReference}`,
    );

    return {
      status: 'RECEIVED',
      details: 'Complaint has been received and is under review',
    };
  }
}
