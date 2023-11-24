import { IsOptional } from 'class-validator';

export class QueryDto {
  @IsOptional()
  name: string;
}
