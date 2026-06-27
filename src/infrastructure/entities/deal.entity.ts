import { BeforeInsert, Column, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Category } from "./category.entity";
import { Media } from "./media.entity";
import { Product } from "./product.entity";
import { SubCategory } from "./sub-category.entity";
@Entity()

export class Deal {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    link: string;

    @Column()
    opportunity: string;

    @Column()
    description: string;

    @Column({ default: null })
    from: Date;

    @Column({ default: null })
    to: Date;

    @Column({'default': "Deal"})
    moduleType:string

    @Column()
    createdAt: Date;

    @DeleteDateColumn({
        type: 'timestamp',
        default: () => null,
    })
    deleted_at: Date;

    @BeforeInsert()
    currentDate() {
      this.createdAt = new Date();
    }

    @ManyToOne(() => SubCategory, (subCategory) => subCategory.deals, { eager: true })
    subCategory: SubCategory;

    @OneToOne(() => Media, (media) => media.deal, { eager: true })
    media: Media;

    @ManyToOne(() => Product, (product) => product.deals, { eager: true })
    product: Product;
}
