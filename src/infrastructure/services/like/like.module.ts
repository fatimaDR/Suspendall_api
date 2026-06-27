import { Module } from '@nestjs/common';
import { LikeService } from './like.service';
import { LikeController } from '../../controllers/like/like.controller';
import { likeProviders } from 'src/infrastructure/providers/like.providers';
import { DatabaseModule } from 'src/database/database.module';
import { UserModule } from '../user/user.module';
import { BusinessModule } from '../business/business.module';

@Module({
  controllers: [LikeController],
  providers: [LikeService, ...likeProviders],
  imports: [DatabaseModule, UserModule, BusinessModule]
})
export class LikeModule {}
