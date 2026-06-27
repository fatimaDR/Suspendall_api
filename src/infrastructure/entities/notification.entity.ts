import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Business } from "./business.entity";
// export enum Type {
//     User     = "USER",
//     Business = "BUSINESS"
// }

@Entity()
export class Notification {
    @PrimaryGeneratedColumn()
    id:number

    @Column()
    fromId: number;

    @Column()
    toId: number;

    @Column()
    eventId: number;

    @Column()
    type: string;

    @Column({'default': false})
    isRead:boolean

    @Column({'default': false})
    deleted: boolean;

    @Column()
    title: string

    @Column()
    message: string

    @Column()
    createdAt:Date

    @Column()
    updatedAt: Date;

    @BeforeInsert()
    currentDate() {
      this.createdAt = new Date();
    }

    @BeforeUpdate()
    updateDate() {
      this.updatedAt = new Date();
    }

    // @ManyToOne(() => User, (user) => user.notifications, { onDelete: "CASCADE" })
    // user:User
}
