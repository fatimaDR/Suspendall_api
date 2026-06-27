import { Module, forwardRef } from '@nestjs/common';
import { UserSettingsService } from './user-settings.service';
import { UserSettingsController } from '../../controllers/user-settings/user-settings.controller';
import { userSettingsProviders } from 'src/infrastructure/providers/userSettings.providers';
import { DatabaseModule } from 'src/database/database.module';
import { UserModule } from '../user/user.module';
import { StockModule } from '../stock/stock.module';
import { SubCategoryModule } from '../sub-category/sub-category.module';

@Module({
  controllers: [UserSettingsController],
  providers: [UserSettingsService, ...userSettingsProviders],
  imports: [DatabaseModule, forwardRef(() => UserModule), StockModule, SubCategoryModule],
  exports: [UserSettingsService, ...userSettingsProviders]
})
export class UserSettingsModule {}
