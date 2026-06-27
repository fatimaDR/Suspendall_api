import { Notification } from "src/infrastructure/entities/notification.entity";

export class NotificationPresenter {
    id: number;
    type: string
    isRead:boolean
    deleted: boolean;
    title: string
    message: string
    createdAt: Date

    constructor(notification: Notification) {

      this.id = notification.id;
     
      if(notification.type) this.type = notification.type

      this.isRead = notification.isRead

      this.deleted = notification.deleted

      if (notification.title) this.title = notification.title

      if (notification.message) this.message = notification.message

      if(notification.createdAt) this.createdAt = notification.createdAt
      
    }
}