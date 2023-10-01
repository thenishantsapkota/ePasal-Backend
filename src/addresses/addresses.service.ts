import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/users/entities';
import { Repository } from 'typeorm';
import { AddressDto, UpdateAddressDto } from './dto';
import { Address } from './entities';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  async getAllShippingAddresses(user: Users): Promise<Address[]> {
    return await this.addressRepository.find({
      where: {
        shippingUser: user,
      },
    });
  }

  async getAllBillingAddresses(user: Users): Promise<Address[]> {
    return await this.addressRepository.find({
      where: {
        billingUser: user,
      },
    });
  }

  async createShippingAddress(
    user: Users,
    addressDto: AddressDto,
  ): Promise<Address> {
    const address = new Address();

    Object.assign(address, { ...addressDto, shippingUser: user });

    return await this.addressRepository.save(address);
  }

  async createBillingAddress(
    user: Users,
    addressDto: AddressDto,
  ): Promise<Address> {
    const address = new Address();
    Object.assign(address, { ...addressDto, billingUser: user });

    return await this.addressRepository.save(address);
  }

  async updateShippingAddress(
    user: Users,
    addressId: number,
    addressDto: UpdateAddressDto,
  ): Promise<false | Address> {
    const shippingAddress = await this.addressRepository.findOne({
      where: {
        id: addressId,
        shippingUser: user,
      },
    });

    if (!shippingAddress) {
      return false;
    }

    Object.assign(shippingAddress, addressDto);

    return await this.addressRepository.save(shippingAddress);
  }

  async updateBillingAddress(
    user: Users,
    addressId: number,
    addressDto: UpdateAddressDto,
  ): Promise<false | Address> {
    const billingAddress = await this.addressRepository.findOne({
      where: {
        id: addressId,
        billingUser: user,
      },
    });

    if (!billingAddress) {
      return false;
    }

    Object.assign(billingAddress, addressDto);

    return await this.addressRepository.save(billingAddress);
  }

  async deleteShippingAddress(
    user: Users,
    addressId: number,
  ): Promise<false | Address> {
    const shippingAddress = await this.addressRepository.findOne({
      where: {
        id: addressId,
        shippingUser: user,
      },
    });

    if (!shippingAddress) {
      return false;
    }

    return await this.addressRepository.remove(shippingAddress);
  }

  async deleteBillingAddress(
    user: Users,
    addressId: number,
  ): Promise<false | Address> {
    const billingAddress = await this.addressRepository.findOne({
      where: {
        id: addressId,
        billingUser: user,
      },
    });

    if (!billingAddress) {
      return false;
    }

    return await this.addressRepository.remove(billingAddress);
  }
}
