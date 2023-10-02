import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard, VerifiedGuard } from 'src/users/guard';
import { ProtectedRequest } from 'src/users/types/AuthRequest';
import { AddressesService } from './addresses.service';
import { AddressDto, UpdateAddressDto } from './dto';
import { Address } from './entities';

@Controller('addresses')
@ApiTags('Address')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @HttpCode(HttpStatus.OK)
  @Get('/shipping-addresses')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, VerifiedGuard)
  async getAllShippingAddresses(@Req() request: ProtectedRequest) {
    try {
      const shippingAddresses =
        await this.addressesService.getAllShippingAddresses(request.user);

      if (shippingAddresses.length === 0) {
        throw new NotFoundException('Shipping Addresses not found!');
      }

      return {
        status: 'success',
        data: shippingAddresses,
        message: 'Shipping addresses fetched successfully!',
      };
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  @HttpCode(HttpStatus.OK)
  @Get('/billing-addresses')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, VerifiedGuard)
  async getAllBillingAddresses(@Req() request: ProtectedRequest) {
    try {
      const billingAddresses =
        await this.addressesService.getAllBillingAddresses(request.user);

      if (billingAddresses.length === 0) {
        throw new NotFoundException('Billing addresses not found!');
      }

      return {
        status: 'success',
        data: billingAddresses,
        message: 'Billing addresses fetched successfully!',
      };
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('/shipping-addresses')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, VerifiedGuard)
  async createShippingAddresses(
    @Req() request: ProtectedRequest,
    @Body() addressDtos: AddressDto[],
  ) {
    try {
      const shippingAddresses: Address[] = [];
      for (const addressDto of addressDtos) {
        const shippingAddress =
          await this.addressesService.createShippingAddress(
            request.user,
            addressDto,
          );
        shippingAddresses.push(shippingAddress);
      }

      return {
        status: 'success',
        data: shippingAddresses,
        message: 'Shipping addresses created successfully!',
      };
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('/billing-addresses')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, VerifiedGuard)
  async createBillingAddresses(
    @Req() request: ProtectedRequest,
    @Body() addressDtos: AddressDto[],
  ) {
    try {
      const billingAddresses: Address[] = [];
      for (const addressDto of addressDtos) {
        const billingAddress = await this.addressesService.createBillingAddress(
          request.user,
          addressDto,
        );
        billingAddresses.push(billingAddress);
      }

      return {
        status: 'success',
        data: billingAddresses,
        message: 'Billing addresses created successfully!',
      };
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  @HttpCode(HttpStatus.OK)
  @Put('/shipping-address/:addressId')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, VerifiedGuard)
  async updateShippingAddress(
    @Req() request: ProtectedRequest,
    @Param('addressId') addressId: number,
    @Body() addressDto: UpdateAddressDto,
  ) {
    try {
      const updatedAddress = await this.addressesService.updateShippingAddress(
        request.user,
        addressId,
        addressDto,
      );

      if (!updatedAddress) {
        throw new NotFoundException(
          'Shipping address with specified ID not found!',
        );
      }

      return {
        status: 'success',
        data: updatedAddress,
        message: 'Shipping address updated successfully!',
      };
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  @HttpCode(HttpStatus.OK)
  @Put('/billing-address/:addressId')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, VerifiedGuard)
  async updateBillingAddress(
    @Req() request: ProtectedRequest,
    @Param('addressId') addressId: number,
    @Body() addressDto: UpdateAddressDto,
  ) {
    try {
      const updatedAddress = await this.addressesService.updateBillingAddress(
        request.user,
        addressId,
        addressDto,
      );

      if (!updatedAddress) {
        throw new NotFoundException(
          'Billing address with specified ID not found!',
        );
      }

      return {
        status: 'success',
        data: updatedAddress,
        message: 'Billing address updated successfully!',
      };
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  @HttpCode(HttpStatus.OK)
  @Delete('/shipping-address/:addressId')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, VerifiedGuard)
  async deleteShippingAddress(
    @Req() request: ProtectedRequest,
    @Param('addressId') addressId: number,
  ) {
    try {
      const shippingAddress = await this.addressesService.deleteShippingAddress(
        request.user,
        addressId,
      );

      if (!shippingAddress) {
        throw new NotFoundException(
          'Shipping address with specified ID not found!',
        );
      }

      return {
        status: 'success',
        data: shippingAddress,
        message: 'Shipping address deleted successfully!',
      };
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  @HttpCode(HttpStatus.OK)
  @Delete('/billing-address/:addressId')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, VerifiedGuard)
  async deleteBillingAddress(
    @Req() request: ProtectedRequest,
    @Param('addressId') addressId: number,
  ) {
    try {
      const billingAddress = await this.addressesService.deleteBillingAddress(
        request.user,
        addressId,
      );

      if (!billingAddress) {
        throw new NotFoundException(
          'Billing address with specified ID not found!',
        );
      }

      return {
        status: 'success',
        data: billingAddress,
        message: 'Billing address deleted successfully!',
      };
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }
}
