import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AdminService } from './admin.service';
import { AnalyticsService } from './analytics.service';
import { AdminController } from './admin.controller';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AdminController],
  providers: [AdminService, AnalyticsService],
  exports: [AdminService],
})
export class AdminModule {}
