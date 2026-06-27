import { Module } from '@nestjs/common';
import { BenefactorService } from './benefactor.service';
import { BenefactorController } from '../../controllers/benefactor/benefactor.controller';
import { benefactorProviders } from 'src/infrastructure/providers/benefactor.providers';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  controllers: [BenefactorController],
  providers: [BenefactorService, ...benefactorProviders],
  exports: [BenefactorService, ...benefactorProviders],
  imports: [DatabaseModule],
})
export class BenefactorModule {}
