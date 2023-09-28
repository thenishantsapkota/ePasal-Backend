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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';
import { diskStorage } from 'multer';
import * as path from 'path';
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
    private readonly config: ConfigService,
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

      const payload = { id: user.id, email: user.email, user: user };
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

      const payload = { id: user.id, email: user.email, user: user };
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
  @ApiBearerAuth()
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
  @ApiBearerAuth()
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
  @ApiBearerAuth()
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

  @HttpCode(HttpStatus.CREATED)
  @Post('/profile-picture')
  @UseGuards(AuthGuard, VerifiedGuard)
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: path.join(
          __dirname,
          '..',
          '..',
          'public',
          'profile-pictures',
        ),
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const extension = path.extname(file.originalname);
          cb(null, uniqueSuffix + extension);
        },
      }),
    }),
  )
  async uploadProfilePicture(
    @Req() request: ProtectedRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('File not found');
    }
    const filename = `/profile-pictures/${file.filename}`;
    const user = await this.usersService.updateProfilePicture(
      request.user.email,
      filename,
    );
    return {
      status: 'success',
      data: user,
      message: 'Profile picture uploaded successfully!',
    };
  }

  @HttpCode(HttpStatus.OK)
  @Put('/update-profile')
  @UseGuards(AuthGuard, VerifiedGuard)
  @ApiBearerAuth()
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
