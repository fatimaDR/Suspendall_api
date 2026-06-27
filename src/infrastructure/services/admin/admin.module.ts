import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from '../../controllers/admin/admin.controller';
import { DatabaseModule } from 'src/database/database.module';
import { BusinessModule } from '../business/business.module';
import { StockModule } from '../stock/stock.module';
import { DealModule } from '../deal/deal.module';
import { OrderModule } from '../order/order.module';
import { ProductLimitRequestModule } from '../productLimitRequest/product-limit-request.module';

@Module({
  controllers: [AdminController],
  providers: [AdminService],
  imports: [DatabaseModule, BusinessModule, StockModule, DealModule, OrderModule, ProductLimitRequestModule]
})
export class AdminModule {}
