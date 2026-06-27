import { forwardRef, Module } from '@nestjs/common';
import { OpeningHoursService } from './opening-hours.service';
import { OpeningHoursController } from '../../controllers/openingHours/opening-hours.controller';
import { DatabaseModule } from 'src/database/database.module';
import { OpeningHoursProviders } from 'src/infrastructure/providers/openingHours.providers';
import { BusinessModule } from '../business/business.module';
import { DayModule } from '../day/day.module';

@Module({
  controllers: [OpeningHoursController],
  providers: [OpeningHoursService, ...OpeningHoursProviders],
  imports: [DatabaseModule, forwardRef(() => BusinessModule), DayModule],
  exports: [OpeningHoursService, ...OpeningHoursProviders]
})
export class OpeningHoursModule {}
