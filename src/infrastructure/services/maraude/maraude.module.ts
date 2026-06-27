import { Module } from '@nestjs/common';
import { MaraudeService } from './maraude.service';
import { MaraudeController } from '../../controllers/maraude/maraude.controller';
import { maraudeProviders } from 'src/infrastructure/providers/maraude.providers';
import { DatabaseModule } from 'src/database/database.module';
import { UserModule } from '../user/user.module';
import { AssociationModule } from '../association/association.module';
import { BusinessModule } from '../business/business.module';
import { PartnerModule } from '../partner/partner.module';
import { MediaModule } from '../media/media.module';
import { ProductModule } from '../product/product.module';
import { ProductMaraudeModule } from '../productMaraude/productMaraude.module';

@Module({
  controllers: [MaraudeController],
  providers: [MaraudeService, ...maraudeProviders],
  imports:[DatabaseModule, UserModule, AssociationModule, BusinessModule, PartnerModule, MediaModule, ProductModule, ProductMaraudeModule],
  exports: [MaraudeModule, ...maraudeProviders]
 
})
export class MaraudeModule {}
