import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from '../../controllers/product/product.controller';
import { productProviders } from 'src/infrastructure/providers/products.providers';
import { DatabaseModule } from 'src/database/database.module';
import { MediaModule } from '../media/media.module';
import { SubCategoryModule } from '../sub-category/sub-category.module';

@Module({
  controllers: [ProductController],
  providers: [ProductService, ...productProviders],
  imports: [DatabaseModule, MediaModule, SubCategoryModule],
  exports: [ProductService, ...productProviders]
})
export class ProductModule {}
