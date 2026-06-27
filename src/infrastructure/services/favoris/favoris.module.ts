import { Module } from '@nestjs/common';
import { FavorisService } from './favoris.service';
import { FavorisController } from 'src/infrastructure/controllers/favoris/favoris.controller';
import { favorisProviders } from 'src/infrastructure/providers/favoris.providers';
import { DatabaseModule } from 'src/database/database.module';
import { BusinessModule } from '../business/business.module';

@Module({
  controllers: [FavorisController],
  providers: [FavorisService, ...favorisProviders],
  imports: [DatabaseModule, BusinessModule]
})
export class FavorisModule {}
