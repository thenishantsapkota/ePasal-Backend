import { Module } from '@nestjs/common';
import { LoyaltiesService } from './loyalties.service';
import { LoyaltiesController } from './loyalties.controller';

@Module({
  controllers: [LoyaltiesController],
  providers: [LoyaltiesService],
})
export class LoyaltiesModule {}
