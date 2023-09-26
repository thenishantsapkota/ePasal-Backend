import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { AddressDto } from './address.dto';

export class UpdateUserDto {
  @IsNotEmpty()
  @ApiProperty()
  first_name: string;

  @IsNotEmpty()
  @ApiProperty()
  last_name: string;

  @IsNotEmpty()
  @ApiProperty()
  phone: string;

  @IsOptional()
  @ApiProperty({ type: [AddressDto] })
  billingAddresses: AddressDto[];

  @IsOptional()
  @ApiProperty({ type: [AddressDto] })
  shippingAddresses: AddressDto[];
}
