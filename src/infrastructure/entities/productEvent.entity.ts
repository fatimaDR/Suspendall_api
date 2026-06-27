// join-table.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { Product } from './product.entity';
import { Event } from './event.entity';
import { OrderItem } from './order-item.entity';

@Entity('product_event')
export class ProductEvent {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => Product, (product) => product, { onDelete: "CASCADE" })
  product: Product

  @ManyToOne(() => Event, (event) => event.productEvent, { onDelete: "CASCADE" })
  event: Event

  @Column()
  quantity: number

  // @OneToMany(() => OrderItem, (orderItems) => orderItems.productEvent)
  // orderItems:OrderItem[]
}