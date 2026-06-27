import { DataSource } from "typeorm";
import { UserPushNotification } from "../entities/user-push-notification.entity";

export const userPushNotificationProviders = [
    {
      provide: 'USER_PUSH_NOTIFICATION_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(UserPushNotification),
      inject: ['DATA_SOURCE'],
    }
];