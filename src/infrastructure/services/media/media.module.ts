import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from '../../controllers/media/media.controller';
import { MediaProviders } from 'src/infrastructure/providers/media.providers';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  controllers: [MediaController],
  providers: [MediaService, ...MediaProviders],
  imports: [DatabaseModule],
  exports: [MediaService, ...MediaProviders]
})
export class MediaModule {}
