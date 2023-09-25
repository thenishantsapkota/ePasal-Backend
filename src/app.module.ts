import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { BlogsModule } from './blogs/blogs.module';
import { CrmModule } from './crm/crm.module';
import { LoyaltiesModule } from './loyalties/loyalties.module';
import { ReferralsModule } from './referrals/referrals.module';
import { VouchersModule } from './vouchers/vouchers.module';

@Module({
  imports: [
    UsersModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    BlogsModule,
    CrmModule,
    LoyaltiesModule,
    ReferralsModule,
    VouchersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
