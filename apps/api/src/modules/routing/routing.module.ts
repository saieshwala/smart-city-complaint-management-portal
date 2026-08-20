import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { RoutingService } from './routing.service';
import { SlaService } from './sla.service';
import { RoutingController } from './routing.controller';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [RoutingController],
  providers: [RoutingService, SlaService],
  exports: [RoutingService, SlaService],
})
export class RoutingModule {}
