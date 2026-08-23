import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/prisma/prisma.module';
import { GovernmentService } from './government.service';
import { MockGovernmentProvider } from './providers/mock-government.provider';

@Module({
  imports: [PrismaModule],
  providers: [GovernmentService, MockGovernmentProvider],
  exports: [GovernmentService],
})
export class GovernmentModule {}
