import { Module } from '@nestjs/common';
import { ProfitableService } from './profitable.service';
import { ProfitableController } from '../../controllers/profitable/profitable.controller';
import { DatabaseModule } from 'src/database/database.module';
import { profitableProviders } from 'src/infrastructure/providers/profitable.providers';
import { CityModule } from '../city/city.module';
import { MailModule } from 'src/mail/mail.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [ProfitableController],
  providers: [ProfitableService, ...profitableProviders],
  exports: [ProfitableService, ...profitableProviders],
  imports: [DatabaseModule]
})
export class ProfitableModule {}
