import { PartialType } from '@nestjs/mapped-types';
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

  @IsNotEmpty()
  @ApiProperty()
  state: string;
}

export class UpdateAddressDto extends PartialType(AddressDto) {}
