import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserPushNotification } from "./user-push-notification.entity";
import { Role } from "src/auth/role.enum";

@Entity()
export class PushNotification {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    description: string

    @Column({
        type: "enum",
        enum: Role,
        // default: Role.Benefactor,
    })
    role:Role;

    @Column()
    tag: string;

    @OneToMany(() => UserPushNotification, (userPushNotifications) => userPushNotifications.pushNotification)
    userPushNotifications: UserPushNotification[];
}
