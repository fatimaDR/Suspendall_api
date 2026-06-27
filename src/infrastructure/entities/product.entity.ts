import { BeforeInsert, Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Category } from "./category.entity";
import { Business } from "./business.entity";
import { ProductEvent } from "./productEvent.entity";
import { ProductMaraude } from "./productMaraude.entity";
import { OrderItem } from "./order-item.entity";
import { SubCategory } from "./sub-category.entity";
import { Stock } from "./stock.entity";
import { Tag } from "./tag.entity";
import { Deal } from "./deal.entity";
import { Media } from "./media.entity";

@Entity()
export class Product {
    
    @PrimaryGeneratedColumn()
    id:number

    @Column()
    title:string

    @Column('double', { precision: 10, scale: 2 })
    price:number

    @Column('text', {'default': null})
    description:string

    @Column({ default: true })
    available:boolean

    @Column({'default': 1})
    quantity:number

    @Column({'default': "PRODUCT"})
    moduleType:string

    @Column()
    createdAt:Date

    @ManyToOne(() => SubCategory, (subCategory) => subCategory.products, {eager: true, onDelete: "SET NULL"} )
    subCategory: SubCategory

    @ManyToOne(() => Business, (business) => business.products )
    business:Business

    @OneToMany(() => ProductEvent, (productEvent) => productEvent.product)
    productEvent:ProductEvent[]

    @OneToMany(() => ProductMaraude, (productMaraude) => productMaraude.product)
    productMaraude:ProductMaraude[]

    @OneToMany(() => OrderItem, (orderItems) => orderItems.product)
    orderItems:OrderItem[]

    @OneToMany(() => Stock, (suspendus) => suspendus.product, {onDelete: "SET NULL", eager: true})
    suspendus: Stock[]

    @OneToMany(() => Deal, (deals) => deals.product )
    deals: Deal[];

    @ManyToMany(() => Tag,  { eager: true })
    @JoinTable()
    tags: Tag[];

    @OneToOne(() => Media, (media) => media.product, { eager: true })
    media: Media;

    @BeforeInsert()
    currentDate() {
      this.createdAt = new Date();
    }

}
