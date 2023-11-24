import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Otp, Users } from '../users/entities';
import { UsersService } from '../users/users.service';
import { AddressesController } from './addresses.controller';
import { AddressesService } from './addresses.service';
import { Address } from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Address, Otp, Users]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('SECRET_KEY'),
        signOptions: { expiresIn: configService.get('EXPIRES_IN') },
      }),
    }),
  ],
  controllers: [AddressesController],
  providers: [AddressesService, UsersService],
})
export class AddressesModule {}
