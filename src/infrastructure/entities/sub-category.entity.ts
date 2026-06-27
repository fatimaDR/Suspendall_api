import { BeforeInsert, Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm"
import { Product } from "./product.entity"
import { Category } from "./category.entity"
import { Business } from "./business.entity"
import { Media } from "./media.entity"
import { Deal } from "./deal.entity"

@Entity()
export class SubCategory {
    
    @PrimaryGeneratedColumn()
    id:number

    @Column()
    name:string

    @Column()
    createdAt:Date

    @Column()
    updatedAt:Date

    @Column({'default': "SUBCATEGORY"})
    moduleType:string

    @ManyToOne(() => Category, (category) => category.subCategories, { onDelete: "CASCADE" } )
    category:Category

    @OneToMany(() => Product, (products) => products.subCategory , {onDelete: "SET NULL"})
    products: Product[];

    @OneToMany(() => Business, (businesses) => businesses.subCategory , {onDelete: "SET NULL"})
    businesses: Business[];

    @OneToOne(() => Media, (media) => media.subCategory)
    media: Media;

    @OneToMany(() => Deal, (deals) => deals.subCategory )
    deals: Deal[];

    @BeforeInsert()
    currentDate() {
      this.createdAt = new Date();
      this.updatedAt = new Date();
    }

}
