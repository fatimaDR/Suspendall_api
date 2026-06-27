import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Order } from "./order.entity";
import { ProductMaraude } from "./productMaraude.entity";
import { Product } from "./product.entity";
import { ProductEvent } from "./productEvent.entity";
import { Business } from "./business.entity";

@Entity()
export class OrderItem {

    @PrimaryGeneratedColumn()
    id:number

    @Column('double', { precision: 10, scale: 2 })
    productPrice:number

    @Column()  
    quantity:number

    @Column('double', { precision: 10, scale: 2 })
    total:number

    @Column()  
    suspendu:number

    @ManyToOne(() => Order, (order) => order.orderItems, { onDelete: "CASCADE" })
    order:Order

    @ManyToOne(() => Product, (product) => product.orderItems, { eager: true, onDelete: "CASCADE" })
    product: Product

    @ManyToOne(() => Business, (business) => business.ordItems , { onDelete: "SET NULL"})
    business:Business
    
    // @ManyToOne(() => ProductMaraude, (productMaraude) => productMaraude.orderItems, { onDelete: "CASCADE" })
    // productMaraude:ProductMaraude

    // @ManyToOne(() => ProductEvent, (productEvent) => productEvent, { onDelete: "CASCADE" })
    // productEvent:ProductEvent
}
