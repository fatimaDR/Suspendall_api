import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { ProductMaraudeService } from './productMaraude.service';
import { productMaraudeProviders } from 'src/infrastructure/providers/productMaraude.providers';

@Module({
  controllers: [],
  providers: [ProductMaraudeService, ...productMaraudeProviders],
  imports: [DatabaseModule],
  exports: [ProductMaraudeService, ...productMaraudeProviders]
})
export class ProductMaraudeModule {}
