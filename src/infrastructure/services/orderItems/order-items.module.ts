import { Module } from '@nestjs/common';
import { OrderItemsService } from './order-items.service';
import { OrderItemsController } from '../../controllers/orderItems/order-items.controller';
import { orderItemProviders } from 'src/infrastructure/providers/orderItem.providers';
import { DatabaseModule } from 'src/database/database.module';
import { ProductModule } from '../product/product.module';
import { OrderModule } from '../order/order.module';
import { StockModule } from '../stock/stock.module';
import { UserModule } from '../user/user.module';
import { BusinessModule } from '../business/business.module';
import { NotificationModule } from '../notification/notification.module';
import { BenefactorModule } from '../benefactor/benefactor.module';

@Module({
  controllers: [OrderItemsController],
  providers: [OrderItemsService, ...orderItemProviders],
  imports: [DatabaseModule, ProductModule, OrderModule, StockModule, UserModule, BusinessModule, NotificationModule, BenefactorModule],
  exports: [OrderItemsService, ...orderItemProviders],
})
export class OrderItemsModule {}
