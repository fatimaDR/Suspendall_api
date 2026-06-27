import { Module, forwardRef } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from '../../controllers/category/category.controller';
import { CategoryProviders } from 'src/infrastructure/providers/category.providers';
import { DatabaseModule } from 'src/database/database.module';
import { BusinessModule } from '../business/business.module';
import { MediaModule } from '../media/media.module';

@Module({
  controllers: [CategoryController],
  providers: [CategoryService, ...CategoryProviders],
  imports: [DatabaseModule, forwardRef(() => BusinessModule), MediaModule],
  exports: [CategoryService, ...CategoryProviders]
})
export class CategoryModule {}