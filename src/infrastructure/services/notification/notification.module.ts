import { Module, forwardRef } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from '../../controllers/notification/notification.controller';
import { notificationsProviders } from 'src/infrastructure/providers/notifications.providers';
import { DatabaseModule } from 'src/database/database.module';
import { UserModule } from '../user/user.module';

@Module({
  controllers: [NotificationController],
  providers: [NotificationService, ...notificationsProviders],
  imports: [DatabaseModule, forwardRef(() => UserModule)],
  exports: [NotificationService, ...notificationsProviders]
})
export class NotificationModule {}
