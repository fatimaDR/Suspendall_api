import { Module } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from '../../controllers/feedback/feedback.controller';
import { DatabaseModule } from 'src/database/database.module';
import { UserModule } from '../user/user.module';
import { BusinessModule } from '../business/business.module';
import { feedbackProviders } from 'src/infrastructure/providers/feedback.providers';
import { NotificationModule } from '../notification/notification.module';

@Module({
  controllers: [FeedbackController],
  providers: [FeedbackService, ...feedbackProviders],
  imports: [DatabaseModule, UserModule, BusinessModule, NotificationModule]
})
export class FeedbackModule {}
