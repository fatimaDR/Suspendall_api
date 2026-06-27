/* eslint-disable prettier/prettier */
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';


@Entity()
export class NotificationDevices {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  deviceId: string;

  @Column()
  deviceType: string;

  @Column()
  deviceToken: string;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;

  @Column()
  disconnectedAt: Date;

  @ManyToOne(() => User, (user) => user.notifications)
  user: User;

  
  @BeforeInsert()
  currentDate() {
    this.createdAt = new Date();
  }

}
