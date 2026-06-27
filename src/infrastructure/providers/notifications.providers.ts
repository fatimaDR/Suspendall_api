import { DataSource } from "typeorm";
import { Notification } from "../entities/notification.entity";
import { NotificationDevices } from "../entities/notificationsdevice.entity";
import * as firebase from 'firebase-admin';

export const notificationsProviders = [
    {
      provide: 'NOTIFICATIONS_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(Notification),
      inject: ['DATA_SOURCE'],
    },

    {
        provide: 'NOTIFS_REPOSITORY',
        useFactory: (dataSource: DataSource) =>
          dataSource.getRepository(NotificationDevices),
        inject: ['DATA_SOURCE'],
      },

      {
        provide: 'FIREBASE_INIT',
        useFactory: () => {
          if (!firebase.apps.length)
            firebase.initializeApp({
              credential: firebase.credential.cert(
                process.env.GOOGLE_APPLICATION_CREDENTIALS,
              ),
            });
        },
      },
];