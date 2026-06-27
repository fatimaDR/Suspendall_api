import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { UserModule } from '../user/user.module';
import { PushNotificationController } from 'src/infrastructure/controllers/push-notification/push-notification.controller';
import { PushNotificationService } from './push-notification.service';
import { PushNotificationProviders } from 'src/infrastructure/providers/pushNotification.providers';
import { UserPushNotification } from 'src/infrastructure/entities/user-push-notification.entity';
import { UserPushNotificationModule } from '../user-push-notification/user-push-notification.module';

@Module({
  controllers: [PushNotificationController],
  providers: [PushNotificationService, ...PushNotificationProviders],
  exports: [PushNotificationService, ...PushNotificationProviders],
  imports: [DatabaseModule, UserModule, UserPushNotificationModule]
})
export class PushNotificationModule {}
