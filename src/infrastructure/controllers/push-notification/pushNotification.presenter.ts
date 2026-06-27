import { PushNotification } from "src/infrastructure/entities/push-notification.entity"
import { UserPushNotification } from "src/infrastructure/entities/user-push-notification.entity"
import { UserPushNotificationPresenter } from "./user-push-notification.presenter"

export class PushNotificationPresenter {
    
    id: number
    title: string
    description: string
    userPushNotifications: object
    
    constructor(notification: PushNotification){
        this.id = notification.id
        if(notification.title) this.title = notification.title
        if(notification.description) this.description = notification.description
       
        if(notification.userPushNotifications){
            this.userPushNotifications = notification.userPushNotifications.map((upnotif) => new UserPushNotificationPresenter(upnotif))  
        }
    }

}