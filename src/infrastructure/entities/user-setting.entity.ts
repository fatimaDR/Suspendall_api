import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class UserSetting {

    @PrimaryGeneratedColumn()
    id:number
    
    @Column()
    isNotifActive: boolean

    @OneToOne(() => User, (user) => user.userSetting, { onDelete: "SET NULL" })
    @JoinColumn()
    user: User
}
