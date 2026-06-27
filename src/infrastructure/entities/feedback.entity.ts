import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Business } from "./business.entity";
import { Profitable } from "./profitable.entity";
import { Expose } from "class-transformer";

@Entity()
export class Feedback {

    @PrimaryGeneratedColumn()
    id:number

    @Column('double', { precision: 10, scale: 2, 'default': 0 })
    note:number

    @Column()
    comment:string

    @Column()
    createdAt:Date

    // @ManyToOne(() => Profitable, (profitable) => profitable.feedbacks, { onDelete: "CASCADE" })
    // profitable:Profitable
    @ManyToOne(() => User, (user) => user.feedbacks, { onDelete: "CASCADE" })
    user:User

    @ManyToOne(() => Business, (business) => business.feedbacks, { onDelete: "CASCADE" })
    business:Business

    @BeforeInsert()
    currentDate() {
      this.createdAt = new Date();
    }
}
