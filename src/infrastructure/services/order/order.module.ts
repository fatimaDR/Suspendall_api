import { forwardRef, Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from '../../controllers/oder/order.controller';
import { orderProviders } from 'src/infrastructure/providers/order.providers';
import { DatabaseModule } from 'src/database/database.module';
import { BenefactorModule } from '../benefactor/benefactor.module';
import { UserModule } from '../user/user.module';
import { BusinessModule } from '../business/business.module';
import { ProductModule } from '../product/product.module';

@Module({
  controllers: [OrderController],
  providers: [OrderService, ...orderProviders],
  imports: [DatabaseModule, forwardRef(() => UserModule), forwardRef(() =>BusinessModule ) , BenefactorModule, ProductModule],
  exports: [OrderService, ...orderProviders],
})
export class OrderModule {}
