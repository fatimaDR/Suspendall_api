import { Module } from '@nestjs/common';
import { SubCategoryService } from './sub-category.service';
import { SubCategoryController } from 'src/infrastructure/controllers/sub-category/sub-category.controller';
import { SubCategoryProviders } from 'src/infrastructure/providers/Subcategory.providers';
import { DatabaseModule } from 'src/database/database.module';
import { MediaModule } from '../media/media.module';
import { CategoryModule } from '../category/category.module';


@Module({
  controllers: [SubCategoryController],
  providers: [SubCategoryService, ...SubCategoryProviders],
  imports: [DatabaseModule, MediaModule, CategoryModule],
  exports: [SubCategoryService, ...SubCategoryProviders],
})
export class SubCategoryModule {}
