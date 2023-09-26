import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiTags } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, LoginUserDto } from './dto';
import { RoleEnum } from './enums';
import { AuthGuard } from './guard';
import { ProtectedRequest } from './types/AuthRequest';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('/login')
  async signIn(@Body() userDto: LoginUserDto) {
    try {
      const user = await this.usersService.getUserPassword(userDto.email);
      if (!user) {
        throw new UnauthorizedException('Incorrect email or password!');
      }
      const isPasswordValid = await bcrypt.compare(
        userDto.password,
        user.password,
      );
      if (!isPasswordValid) {
        throw new UnauthorizedException('Incorrect email or password!');
      }

      const payload = { id: user.id, username: user.email };
      const accessToken = await this.jwtService.signAsync(payload);

      return {
        status: 'success',
        data: accessToken,
        message: 'Logged in successfully!',
      };
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('/register')
  async register(@Body() userDto: CreateUserDto) {
    try {
      if (userDto.password !== userDto.confirm_password) {
        throw new BadRequestException('Passwords donot match!');
      }
      const foundUser = await this.usersService.findOneUser(userDto.email);

      if (foundUser) {
        throw new BadRequestException('User already exists!');
      }
      userDto.password = await this.usersService.hashPassword(userDto.password);
      const user = await this.usersService.createUser(userDto, RoleEnum.user);

      return {
        status: 'success',
        data: user,
        message: 'User registered successfully!',
      };
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  @HttpCode(HttpStatus.OK)
  @Get('/me')
  @UseGuards(AuthGuard)
  async getMe(@Req() request: ProtectedRequest) {
    try {
      const user = await this.usersService.findOneUser(request.user.email);
      if (!user) {
        throw new NotFoundException('User not found!');
      }
      return {
        status: 'success',
        data: user,
        message: 'Profile fetched successfully!',
      };
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }
}
