import { Controller } from '@nestjs/common';
import { LoyaltiesService } from './loyalties.service';

@Controller('loyalties')
export class LoyaltiesController {
  constructor(private readonly loyaltiesService: LoyaltiesService) {}
}
