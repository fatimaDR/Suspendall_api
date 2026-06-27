import { Module } from '@nestjs/common';
import { CategorySocioProService } from './category-socio-pro.service';
import { CategorySocioProController } from '../../controllers/category-socio-pro/category-socio-pro.controller';
import { CategorySocioProProviders } from 'src/infrastructure/providers/categorySocioPro.providers';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  controllers: [CategorySocioProController],
  providers: [CategorySocioProService, ...CategorySocioProProviders],
  imports: [DatabaseModule],
  exports: [CategorySocioProService, ...CategorySocioProProviders]
})
export class CategorySocioProModule {}
