import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { GovernmentService } from './government.service';

@Processor('complaint-submission')
export class SubmissionProcessorService extends WorkerHost {
  private readonly logger = new Logger(SubmissionProcessorService.name);

  constructor(private readonly governmentService: GovernmentService) {
    super();
  }

  async process(job: Job<{ complaintId: string; publicId: string }>) {
    const { complaintId, publicId } = job.data;

    this.logger.log(
      `Processing submission for complaint ${publicId} (job ${job.id})`,
    );

    try {
      const result =
        await this.governmentService.submitComplaint(complaintId);

      this.logger.log(
        `Submission complete for ${publicId}: ${result.success ? 'SUCCESS' : 'FAILED'}`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Submission processing failed for ${publicId}: ${error instanceof Error ? error.message : error}`,
      );
      throw error;
    }
  }
}
