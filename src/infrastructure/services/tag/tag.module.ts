import { Module } from '@nestjs/common';
import { TagService } from './tag.service';
import { TagController } from '../../controllers/tag/tag.controller';
import { TagProviders } from 'src/infrastructure/providers/tag.providers';
import { DatabaseModule } from 'src/database/database.module';
import { MediaModule } from '../media/media.module';

@Module({
  controllers: [TagController],
  providers: [TagService, ...TagProviders],
  imports: [DatabaseModule, MediaModule],
  exports: [TagService, ...TagProviders]
})
export class TagModule {}
