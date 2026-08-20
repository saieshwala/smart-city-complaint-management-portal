import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/prisma/prisma.module';
import { GovernmentService } from './government.service';
import { MockGovernmentProvider } from './providers/mock-government.provider';
import { SubmissionProcessorService } from './submission-processor.service';

@Module({
  imports: [PrismaModule],
  providers: [GovernmentService, MockGovernmentProvider, SubmissionProcessorService],
  exports: [GovernmentService],
})
export class GovernmentModule {}
