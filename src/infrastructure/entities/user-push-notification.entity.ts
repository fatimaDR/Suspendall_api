import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { User } from './user.entity';
import { Notification } from './notification.entity';
import { PushNotification } from './push-notification.entity';

@Entity()
export class UserPushNotification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false })
  isActive: boolean;

  @ManyToOne(() => User, (user) => user)
  user: User;

  @ManyToOne(() => PushNotification, (pushNotification) => pushNotification.userPushNotifications)
  pushNotification: PushNotification;

}