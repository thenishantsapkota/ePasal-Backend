import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BlogsModule } from './blogs/blogs.module';
import { CartModule } from './cart/cart.module';
import { CrmModule } from './crm/crm.module';
import { DatabaseModule } from './database/database.module';
import { EmailModule } from './email/email.module';
import { LoyaltiesModule } from './loyalties/loyalties.module';
import { OrdersModule } from './orders/orders.module';
import { ProductsModule } from './products/products.module';
import { ReferralsModule } from './referrals/referrals.module';
import { UsersModule } from './users/users.module';
import { VouchersModule } from './vouchers/vouchers.module';
import { AddressesModule } from './addresses/addresses.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `./.env.${process.env.NODE_ENV}`,
    }),
    UsersModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    BlogsModule,
    CrmModule,
    LoyaltiesModule,
    ReferralsModule,
    VouchersModule,
    DatabaseModule,
    EmailModule,
    AddressesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
