import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from '../../controllers/event/event.controller';
import { eventProviders } from 'src/infrastructure/providers/event.providers';
import { DatabaseModule } from 'src/database/database.module';
import { PartnerModule } from '../partner/partner.module';
import { MediaModule } from '../media/media.module';
import { Product } from 'src/infrastructure/entities/product.entity';
import { ProductEventModule } from '../productEvent/productEvent.module';
import { ProductModule } from '../product/product.module';

@Module({
  controllers: [EventController],
  providers: [EventService, ...eventProviders],
  imports: [DatabaseModule, PartnerModule, MediaModule, ProductModule, ProductEventModule],
})
export class EventModule {}
