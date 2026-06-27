import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { userPushNotificationProviders } from 'src/infrastructure/providers/userPushNotification.providers';

@Module({
    providers: [...userPushNotificationProviders],
    exports: [...userPushNotificationProviders],
    imports:[DatabaseModule]
})
export class UserPushNotificationModule {}
