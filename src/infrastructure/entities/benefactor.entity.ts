import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Order } from "./order.entity";
import { Stock } from "./stock.entity";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

@Entity()
export class Benefactor{

    @PrimaryGeneratedColumn()
    id:number;

    @OneToOne(() => User, (user) => user.benefactor, { onDelete: "CASCADE" })
    @JoinColumn()
    user: User

    @Column(({'default': false}))
    isCompany: boolean;

    @Column({'default': null})
    entreprise:string

    @Column()
    sirenNumber:string

    @OneToMany(() => Order, (orders) => orders.benefactor)
    orders?:Order[]

    @OneToMany(() => Stock, (suspendus) => suspendus.benefactor)
    suspendus:Stock[]

}

