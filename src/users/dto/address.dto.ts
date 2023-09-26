import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class AddressDto {
  @IsNotEmpty()
  @ApiProperty()
  street: string;

  @IsNotEmpty()
  @ApiProperty()
  city: string;

  @IsNotEmpty()
  @ApiProperty()
  postal_code: string;
}
