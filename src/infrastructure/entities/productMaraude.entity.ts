// join-table.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { Product } from './product.entity';
import { Maraude } from './maraude.entity';
import { OrderItem } from './order-item.entity';

@Entity('product_maraude')
export class ProductMaraude {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, (product) => product.productMaraude, { onDelete: "CASCADE" })
  product: Product;

  @ManyToOne(() => Maraude, (maraude) => maraude.productMaraude, { onDelete: "CASCADE" })
  maraude: Maraude;

  @Column()
  quantity: number; 

  // @OneToMany(() => OrderItem, (orderItems) => orderItems.productMaraude)
  // orderItems:OrderItem[]
}