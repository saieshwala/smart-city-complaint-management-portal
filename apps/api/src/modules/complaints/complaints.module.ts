import { Module } from '@nestjs/common';
import { ComplaintsController, PublicComplaintsController } from './complaints.controller';
import { ComplaintsService } from './complaints.service';

@Module({
  controllers: [ComplaintsController, PublicComplaintsController],
  providers: [ComplaintsService],
  exports: [ComplaintsService],
})
export class ComplaintsModule {}
