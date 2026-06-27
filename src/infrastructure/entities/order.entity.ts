import { BeforeInsert, Column, Double, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { OrderItem } from "./order-item.entity";
import { Benefactor } from "./benefactor.entity";
import { Payment } from "./payment.entity";
import { Stock } from "./stock.entity";

@Entity()
export class Order {

    @PrimaryGeneratedColumn()
    id:number

    @Column('double', { precision: 10, scale: 2 })
    subTotal:number

    @Column('double', { precision: 10, scale: 2 })
    total:number

    @Column()
    status:string

    @Column()
    createdAt:Date

    @OneToMany(() => OrderItem, (orderItems) => orderItems.order)
    orderItems:OrderItem[]

    @ManyToOne(() => Benefactor, (benefactor) => benefactor.orders, { onDelete: "SET NULL", eager: true })
    benefactor:Benefactor

    @OneToMany(() => Stock, (stocks) => stocks.order)
    stocks:Stock[]

    @OneToOne(() => Payment, (payment) => payment.order, { onDelete: "SET NULL" })
    payment: Payment

    @BeforeInsert()
    currentDate() {
      this.createdAt = new Date();
    }
}
