import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto';
import { Users } from './entities';
import { RoleEnum } from './enums';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users) private readonly userRepository: Repository<Users>,
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
}
