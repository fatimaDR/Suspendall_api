import { UserPushNotification } from "src/infrastructure/entities/user-push-notification.entity"

export class UserPushNotificationPresenter {
    
    id: number
    isActive: boolean
    user: object
    pushNotification: object
    
    constructor(userPushNotification: UserPushNotification){
        this.id = userPushNotification.id
        this.isActive = userPushNotification.isActive
        if(userPushNotification.user) this.user = userPushNotification.user
        if(userPushNotification.pushNotification) this.pushNotification =  userPushNotification.pushNotification
    }

}