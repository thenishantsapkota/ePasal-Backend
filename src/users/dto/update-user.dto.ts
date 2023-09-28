import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @ApiProperty()
  first_name: string;

  @IsOptional()
  @ApiProperty()
  last_name: string;

  @IsOptional()
  @ApiProperty()
  phone: string;
}
