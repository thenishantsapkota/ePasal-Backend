import { Module } from '@nestjs/common';
import { CrmService } from './crm.service';
import { CrmController } from './crm.controller';

@Module({
  controllers: [CrmController],
  providers: [CrmService],
})
export class CrmModule {}
