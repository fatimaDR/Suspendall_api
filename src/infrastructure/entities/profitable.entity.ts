import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { City } from "./city.entity";
import { Reservation } from "./reservation.entity";
import { Feedback } from "./feedback.entity";

@Entity()
export class Profitable{

    @PrimaryGeneratedColumn()
    id:number

    @OneToOne(() => User, (user) => user.profitable, { onDelete: "CASCADE" })
    @JoinColumn()
    user: User
    
    @Column()
    studentCard:string

    @OneToMany(() => Reservation, (reservations) => reservations.profitable)
    reservations:Reservation[]

    // @OneToMany(() => Feedback, (feedbacks) => feedbacks.profitable)
    // feedbacks:Feedback[]

}
