import { Module } from '@nestjs/common';
import { CityService } from './city.service';
import { CityController } from '../../controllers/city/city.controller';
import { DatabaseModule } from 'src/database/database.module';
import { cityProviders } from 'src/infrastructure/providers/city.providers';

@Module({
  controllers: [CityController],
  providers: [CityService, ...cityProviders],
  exports: [...cityProviders],
  imports:[DatabaseModule]
})
export class CityModule {}
