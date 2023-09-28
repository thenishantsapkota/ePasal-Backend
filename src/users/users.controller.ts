import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  Put,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiTags } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';
import { EmailService } from 'src/email/email.service';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from './dto';
import { OtpDto } from './dto/otp.dto';
import { RoleEnum } from './enums';
import { AuthGuard } from './guard';
import { VerifiedGuard } from './guard/verified.guard';
import { ProtectedRequest } from './types/AuthRequest';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
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

      const payload = { id: user.id, username: user.email };
      const accessToken = await this.jwtService.signAsync(payload);
      if (process.env.NODE_ENV === 'production') {
        const otp = await this.emailService.sendOtp(user.email);
        await this.usersService.createOtp(user.email, otp);
      } else if (process.env.NODE_ENV === 'development') {
        const updatedUser = await this.usersService.verifyEmail(user.email);
        if (!updatedUser) {
          throw new BadRequestException();
        }
      }
      return {
        status: 'success',
        data: accessToken,
        message: 'User registered successfully!',
      };
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('/verify')
  @UseGuards(AuthGuard)
  async verifyOtp(@Req() request: ProtectedRequest, @Body() otpDto: OtpDto) {
    try {
      const user = await this.usersService.findOneUser(request.user.email);
      const now = new Date();
      if (!user) {
        throw new ForbiddenException("User doesn't exist")!;
      }
      const otp = await this.usersService.findOtpByUser(user);
      if (!otp) {
        throw new ForbiddenException(
          "OTP hasn't been generated for this user!",
        );
      }

      if (otp.expiresAt < now) {
        await this.usersService.deleteOtp(user);
        throw new ForbiddenException('OTP expired!');
      }

      if (!(otpDto.otp === otp.otp)) {
        throw new ForbiddenException("OTP doesn't match!");
      }

      const updatedUser = await this.usersService.verifyEmail(user.email);
      await this.usersService.deleteOtp(updatedUser);
      return {
        status: 'success',
        data: updatedUser,
        message: 'Email verified successfully!',
      };
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  @HttpCode(HttpStatus.OK)
  @Put('/resend-otp')
  @UseGuards(AuthGuard)
  async resendOtp(@Req() request: ProtectedRequest) {
    try {
      if (request.user.verified) {
        throw new BadRequestException('User is already verified!');
      }
      await this.usersService.deleteOtp(request.user);
      const otp = await this.emailService.sendOtp(request.user.email);
      await this.usersService.createOtp(request.user.email, otp);

      return {
        status: 'success',
        message: 'OTP resent successfully!',
      };
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  @HttpCode(HttpStatus.OK)
  @Get('/me')
  @UseGuards(AuthGuard, VerifiedGuard)
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

  @HttpCode(HttpStatus.OK)
  @Put('/update-profile')
  @UseGuards(AuthGuard, VerifiedGuard)
  async updateProfile(
    @Req() request: ProtectedRequest,
    @Body() userDto: UpdateUserDto,
  ) {
    try {
      const updatedUser = await this.usersService.updateUser(
        request.user.email,
        userDto,
      );

      return {
        status: 'success',
        data: updatedUser,
        message: 'Profile updated successfully!',
      };
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }
}
