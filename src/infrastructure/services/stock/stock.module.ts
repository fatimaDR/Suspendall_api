import { forwardRef, Module } from '@nestjs/common';
import { StockService } from './stock.service';
import { StockController } from '../../controllers/stock/stock.controller';
import { stockProviders } from 'src/infrastructure/providers/stock.providers';
import { DatabaseModule } from 'src/database/database.module';
import { ProductModule } from '../product/product.module';
import { BusinessModule } from '../business/business.module';
import { BenefactorModule } from '../benefactor/benefactor.module';

@Module({
  controllers: [StockController],
  providers: [StockService, ...stockProviders],
  imports: [DatabaseModule, ProductModule, forwardRef(() => BusinessModule), BenefactorModule],
  exports: [StockService, ...stockProviders]
})
export class StockModule {}
