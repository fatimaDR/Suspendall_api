// entities/product-limit-request.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, BeforeInsert } from 'typeorm';
import { Business } from './business.entity';
import { BUSINES_REQUEST } from 'src/functions/businessRequest.enum';

@Entity()
export class ProductLimitRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Business, (business) => business.productLimitRequests, { onDelete: 'CASCADE' })
  business: Business;

  @Column({ type: 'text', nullable: true })
  message: string;

  // @Column({ default: 'pending' }) // 'pending' | 'approved' | 'rejected'
  // status: string;

  @Column({
  type: "enum",
  enum: BUSINES_REQUEST,
  default: BUSINES_REQUEST.Pending,
  })
  status: BUSINES_REQUEST;

  @CreateDateColumn()
  createdAt: Date;

   @BeforeInsert()
    currentDate() {
    this.createdAt = new Date();
    }
}

