import { Module } from '@nestjs/common';
import { UserNotificationController } from 'src/infrastructure/controllers/user-notification/user-notification.controller';
import { UserNotificationService } from './user-notification.service';

@Module({
  controllers: [UserNotificationController],
  providers: [UserNotificationService],
})
export class UserNotificationModule {}
