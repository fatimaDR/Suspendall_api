import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Business } from "./business.entity";
import { Product } from "./product.entity";
import { SubCategory } from "./sub-category.entity";
import { Deal } from "./deal.entity";
import { Media } from "./media.entity";

export enum CatType {
  Product  = "PRODUCT",
  Business = "BUSINESS"
}

@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    id:number

    @Column()
    name:string

    @Column({
        type: "enum",
        enum: CatType,
        default: CatType.Product,
    })
    type: CatType;

    @Column()
    createdAt:Date

    @Column()
    updatedAt:Date

    @Column({'default': "CATEGORY"})
    moduleType:string

    // @OneToMany(() => Deal, (deals) => deals.category )
    // deals: Deal[];

    @OneToMany(() => SubCategory, (subCategories) => subCategories.category, { onDelete: "CASCADE" } )
    subCategories: SubCategory[];

    @OneToOne(() => Media, (media) => media.category)
    media: Media;

    @BeforeInsert()
    currentDate() {
      this.createdAt = new Date();
      this.updatedAt = new Date();
    }

    @BeforeUpdate()
    updateDate() {
      this.updatedAt = new Date();
    }
}
