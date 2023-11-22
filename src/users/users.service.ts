import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { CreateUserDto, UpdateUserDto } from './dto';
import { Otp, Users } from './entities';
import { RoleEnum } from './enums';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users) private readonly userRepository: Repository<Users>,
    @InjectRepository(Otp) private readonly otpRepository: Repository<Otp>,
  ) {}

  async createUser(userDto: CreateUserDto, role: RoleEnum) {
    const user = new Users();
    Object.assign(user, { ...userDto, role: role });
    await this.userRepository.save(user);

    delete user.password;

    return user;
  }

  async findOneUser(email: string) {
    return await this.userRepository.findOne({
      where: {
        email,
      },
      relations: ['shippingAddresses', 'billingAddresses'],
    });
  }

  async getUserPassword(email: string) {
    return await this.userRepository.findOne({
      where: {
        email,
      },
      select: {
        password: true,
      },
    });
  }

  async hashPassword(password: string) {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(password, salt);
  }

  async createOtp(email: string, otp: number) {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);

    const user = await this.findOneUser(email);

    const otpObj = new Otp();

    otpObj.expiresAt = expiresAt;
    otpObj.user = { id: user.id } as Users;
    otpObj.otp = otp;

    await this.otpRepository.save(otpObj);

    return otpObj;
  }

  async findOtpByUser(user: Users) {
    return await this.otpRepository.findOne({
      where: {
        user: user,
      },
    });
  }

  async deleteOtp(user: Users) {
    const otp = await this.findOtpByUser(user);
    if (otp) {
      await this.otpRepository.remove(otp);
      return true;
    }
    return false;
  }

  async verifyEmail(email: string) {
    const user = await this.findOneUser(email);
    if (user) {
      user.verified = true;
      const updatedUser = await this.userRepository.save(user);
      return updatedUser;
    }
  }

  async updateUser(email: string, userDto: UpdateUserDto) {
    const user = await this.findOneUser(email);

    Object.assign(user, userDto);

    const updatedUser = await this.userRepository.save(user);

    return updatedUser;
  }

  async updateProfilePicture(email: string, filename: string) {
    const user = await this.findOneUser(email);
    if (user) {
      user.profile_picture = filename;
      const updatedUser = await this.userRepository.save(user);
      return updatedUser;
    }
  }
}
