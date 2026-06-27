import { Module } from '@nestjs/common';
import { DealService } from './deal.service';
import { DealController } from '../../controllers/deal/deal.controller';
import { dealProviders } from 'src/infrastructure/providers/deal.providers';
import { DatabaseModule } from 'src/database/database.module';
import { ProductModule } from '../product/product.module';
import { CategoryModule } from '../category/category.module';
import { MediaModule } from '../media/media.module';
import { SubCategoryModule } from '../sub-category/sub-category.module';

@Module({
  controllers: [DealController],
  providers: [DealService, ...dealProviders],
  exports: [DealService, ...dealProviders],
  imports: [DatabaseModule, ProductModule, SubCategoryModule, MediaModule]
})
export class DealModule {}
