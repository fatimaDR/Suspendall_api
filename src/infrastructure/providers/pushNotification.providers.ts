import { DataSource } from "typeorm";
import { PushNotification } from "../entities/push-notification.entity";


export const PushNotificationProviders = [
    {
        provide: 'PUSH_NOTIFICATION_REPOSITORY',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(PushNotification),
        inject: ['DATA_SOURCE'],
    }    
]