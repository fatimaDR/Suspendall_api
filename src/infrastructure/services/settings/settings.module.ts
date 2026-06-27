import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsController } from '../../controllers/settings/settings.controller';
import { SettingsProviders } from 'src/infrastructure/providers/settings.providers';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  controllers: [SettingsController],
  providers: [SettingsService, ...SettingsProviders],
  imports: [ DatabaseModule],
  exports: [SettingsService, ...SettingsProviders],
})
export class SettingsModule {}
