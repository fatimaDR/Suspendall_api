import { BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Notification } from "./notification.entity";
import * as bcrypt from 'bcrypt';
import { Role } from "src/auth/role.enum";
import { Association } from "./association.entity";
import { Profitable } from "./profitable.entity";
import { Benefactor } from "./benefactor.entity";
import { Business } from "./business.entity";
import { Maraude } from "./maraude.entity";
import { City } from "./city.entity";
import { UserSetting } from "./user-setting.entity";
import { NotificationDevices } from "./notificationsdevice.entity";
import { Favoris } from "./favoris.entity";
import { Media } from "./media.entity";
import { Like } from "./like.entity";
import { CategorySocioPro } from "./category-socio-pro.entity";
import { Feedback } from "./feedback.entity";
import { PushNotification } from "./push-notification.entity";
import { UserPushNotification } from "./user-push-notification.entity";
import { ResetPassword } from "./reset-password.entity";

@Entity()
export class User{
    @PrimaryGeneratedColumn()
    id:number;
    
    @Column({'default': null})
    firstName:string

    @Column({'default': null})
    lastName:string

    @Column({'default': null})
    username:string
    
    @Column()
    email:string

    @Column({'default': null})
    password:string
    
    @Column({'default': null})
    phone:string

    @Column({'default': null})
    postalCode:number

    @ManyToOne(() => City, (city) => city.users, {eager: true, onDelete: "SET NULL"})
    city:City

    @Column({ 'default': null})
    addresse:string

    @Column({ type: 'date', nullable: true })
    birthday: Date;

    @Column({'default': false})
    isVerified:boolean

    @Column({
      type: "enum",
      enum: Role,
      default: Role.Admin,
    })
    role:Role;

    @Column()
    stripeId: string

    @Column()
    createdAt:Date
    
    @Column()
    updatedAt:Date

    @Column(({'default': false}))
    deleted:boolean

    @Column(({'default': true}))
    isActive:boolean

    @Column({'default': "USER"})
    moduleType:string

    @BeforeInsert()
    currentDate() {
      this.createdAt = new Date();
      this.updatedAt = new Date();
    }

    @BeforeInsert()
    async hashPassword() {
      if (this.password) {
        const salt = await bcrypt.genSalt();
        this.password = await bcrypt.hash(this.password, salt);
      }
    }
    
    @OneToMany(() => Maraude, (maraudes) => maraudes.user )
    maraudes: Maraude[];

    @OneToOne(() => Association, (association) => association.user, { eager: true })
    association: Association

    @OneToOne(() => Profitable, (profitable) => profitable.user, { eager: true })
    profitable: Profitable

    @OneToOne(() => UserSetting, (userSetting) => userSetting.user)
    userSetting: UserSetting

    @OneToOne(() => Benefactor, (benefactor) => benefactor.user, { eager: true })
    benefactor: Benefactor

    @OneToOne(() => Business, (business) => business.user, { eager: true })
    business: Business

    @OneToMany(() => NotificationDevices, (notifications) => notifications.user)
    notifications:NotificationDevices

    @OneToMany(() => Favoris, (favoris) => favoris.user)
    favoris:Favoris

    @OneToOne(() => Media, (media) => media.user)
    media: Media

    @OneToMany(() => Like, like => like.user)
    likes: Like[];

    @ManyToOne(() => CategorySocioPro, (category) => category.users, { onDelete: "SET NULL"})
    category: CategorySocioPro;

    @OneToMany(() => Feedback, (feedbacks) => feedbacks.user)
    feedbacks:Feedback[]

    @OneToMany(() => UserPushNotification, (userPushNotifications) => userPushNotifications.user)
    userPushNotifications: UserPushNotification[];


    @OneToOne(() => ResetPassword, (resetPassword) => resetPassword.user, { onDelete: "SET NULL" })
    resetPassword: ResetPassword

}
