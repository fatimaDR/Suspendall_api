import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Profitable } from "./profitable.entity";
import { Stock } from "./stock.entity";

@Entity()
export class Reservation {
    
    @PrimaryGeneratedColumn()
    id:number

    @Column()
    collected:boolean

    @ManyToOne(() => Stock, (suspendu) => suspendu.reservations)
    suspendu:Stock

    @Column()
    createdAt:Date

    @Column()
    collectedAt:Date
    
    @ManyToOne(() => Profitable, (profitable) => profitable.reservations, { onDelete: "CASCADE" })
    profitable:Profitable

    @BeforeInsert()
    currentDate() {
      this.createdAt = new Date();
    }
}
