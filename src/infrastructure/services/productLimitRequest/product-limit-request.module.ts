import { forwardRef, Module } from '@nestjs/common';
import { ProductLimitRequestService } from './product-limit-request.service';
import { ProductLimitRequestController } from '../../controllers/productLimitRequest/product-limit-request.controller';
// import { productLimitRequestProviders } from 'src/infrastructure/providers/ProductLimitRequest.providers';
import { DatabaseModule } from 'src/database/database.module';
import { BusinessModule } from '../business/business.module';
import { productLimitRequestProviders } from 'src/infrastructure/providers/productLimitRequest.providers';

@Module({
  controllers: [ProductLimitRequestController],
  providers: [ProductLimitRequestService, ...productLimitRequestProviders],
  imports: [DatabaseModule, forwardRef(() => BusinessModule)],
  exports: [ProductLimitRequestService, ...productLimitRequestProviders]

})
export class ProductLimitRequestModule {}
