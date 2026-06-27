import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";
import { Business } from "./business.entity";
import { Reservation } from "./reservation.entity";
import { Benefactor } from "./benefactor.entity";
import { Order } from "./order.entity";

@Entity()
export class Stock {

    @PrimaryGeneratedColumn()
    id:number

    @Column({'default': 0})
    quantity:number

    @Column('double', { precision: 10, scale: 2 })
    productPrice:number

    // @Column('double', { precision: 10, scale: 2 })
    // sousTotal:number

    @Column('double', { precision: 10, scale: 2 })
    total:number

    @ManyToOne(() => Order, (order) => order.stocks, { onDelete: "CASCADE" })
    order:Order

    @ManyToOne(() => Product, (product) => product.suspendus, { onDelete: "SET NULL" })
    @JoinColumn()
    product: Product;

    @ManyToOne(() => Business, (business) => business.suspendus , { onDelete: "SET NULL"})
    business:Business

    @OneToMany(() => Reservation, (reservations) => reservations.suspendu, { onDelete: "SET NULL"})
    reservations:Reservation[]

    @ManyToOne(() => Benefactor, (benefactor) => benefactor.suspendus , { onDelete: "SET NULL"})
    benefactor:Benefactor

    @Column()
    createdAt:Date

    @Column()
    updatedAt:Date

    @BeforeInsert()
    currentDate() {
      this.createdAt = new Date();
      this.updatedAt = new Date();
    }
}
