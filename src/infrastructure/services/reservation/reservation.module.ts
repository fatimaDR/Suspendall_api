import { Module, forwardRef } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { ReservationController } from '../../controllers/reservation/reservation.controller';
import { reservationProviders } from 'src/infrastructure/providers/reservation.providers';
import { DatabaseModule } from 'src/database/database.module';
import { ProductModule } from '../product/product.module';
import { UserModule } from '../user/user.module';
import { StockModule } from '../stock/stock.module';
import { NotificationModule } from '../notification/notification.module';
import { BusinessModule } from '../business/business.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  controllers: [ReservationController],
  providers: [ReservationService, ...reservationProviders],
  imports: [
    DatabaseModule,
    StockModule, 
    SettingsModule, 
    forwardRef(() => UserModule),
    NotificationModule
  ],
  exports: [ReservationService, ...reservationProviders]
})
export class ReservationModule {}
