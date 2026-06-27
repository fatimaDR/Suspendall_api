import { Module } from '@nestjs/common';
import { PartnerService } from './partner.service';
import { PartnerController } from '../../controllers/partner/partner.controller';
import { partnerProviders } from 'src/infrastructure/providers/partner.providers';
import { DatabaseModule } from 'src/database/database.module';
import { MaraudeModule } from '../maraude/maraude.module';

@Module({
  controllers: [PartnerController],
  providers: [PartnerService, ...partnerProviders],
  imports:[DatabaseModule],
  exports: [PartnerModule, ...partnerProviders]

})
export class PartnerModule {}
