import { BeforeInsert, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Order } from "./order.entity";
import { join } from "path";

@Entity()
export class Payment {

    @PrimaryGeneratedColumn()
    id:number

    @Column('double', { precision: 10, scale: 2 })
    total:number

    @Column('double', { precision: 10, scale: 2 })
    subTotal:number

    @Column()
    stripeId:string

    @Column()
    paymentMode: string

    @Column('double', { precision: 10, scale: 2 })
    tva:number

    @Column('double', { precision: 10, scale: 2})
    bankFee:number

    @Column('double', { precision: 10, scale: 2 })
    lbs:number

    @Column()
    createdAt:Date
 
    @OneToOne(() => Order, (order) => order.payment, { onDelete: "SET NULL" })
    @JoinColumn({})
    order: Order

    @BeforeInsert()
    currentDate() {
      this.createdAt = new Date();
    }
}
