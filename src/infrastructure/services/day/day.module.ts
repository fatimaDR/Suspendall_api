import { Module } from '@nestjs/common';
import { DayService } from './day.service';
import { DayController } from 'src/infrastructure/controllers/day/day.controller';
import { DatabaseModule } from 'src/database/database.module';
import { dayProviders } from 'src/infrastructure/providers/day.providers';


@Module({
  controllers: [DayController],
  providers: [DayService, ...dayProviders],
  imports: [DatabaseModule],
  exports: [DayService, ...dayProviders]
})
export class DayModule {}
