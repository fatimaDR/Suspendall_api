import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Business } from "./business.entity";
import { Event } from "./event.entity";
import { Maraude } from "./maraude.entity";
import { User } from "./user.entity";
import { Deal } from "./deal.entity";
import { Product } from "./product.entity";
import { Category } from "./category.entity";
import { SubCategory } from "./sub-category.entity";
import { Tag } from "./tag.entity";

export enum MediaType {
    Cover    = "COVER",
    Logo     = "LOGO",
    Gallery  = "GALLERY",
}

@Entity()
export class Media {

    @PrimaryGeneratedColumn()
    id:number

    @Column()
    moduleId:number

    @Column()
    moduleType:string

    @Column()
    fileName:string

    @Column()
    originalName:string

    @Column()
    mimeType:string

    @Column()
    path:string

    @Column({
        type: 'enum', 
        enum: MediaType,
        default: MediaType.Cover
    })
    type:MediaType

    @Column()
    createdAt:Date
    
    @Column()
    updatedAt:Date

    @BeforeInsert()
    currentDate() {
      this.createdAt = new Date();
      this.updatedAt = new Date();
    }

    @ManyToOne(() => Business, (business) => business.media, { onDelete: "CASCADE" })
    @JoinColumn([
        { name: 'moduleId', referencedColumnName: 'id' },
        { name: 'moduleType', referencedColumnName: 'moduleType' },
    ])
    business: Business

    @ManyToOne(() => Event, (event) => event.media, { onDelete: "CASCADE" })
    @JoinColumn([
        { name: 'moduleId', referencedColumnName: 'id' },
        { name: 'moduleType', referencedColumnName: 'moduleType' },
    ])
    event: Event

    @ManyToOne(() => Maraude, (maraude) => maraude.media, { onDelete: "CASCADE" })
    @JoinColumn([
        { name: 'moduleId', referencedColumnName: 'id' },
        { name: 'moduleType', referencedColumnName: 'moduleType' },
    ])
    maraude: Maraude

    @OneToOne(() => User, (user) => user.media, { onDelete: "CASCADE" })
    @JoinColumn(
        [
            { name: 'moduleId', referencedColumnName: 'id' },
            { name: 'moduleType', referencedColumnName: 'moduleType' },
        ]
    )
    user: User

    @OneToOne(() => Deal, (deal) => deal.media, { onDelete: "CASCADE" })
    @JoinColumn(
        [
            { name: 'moduleId', referencedColumnName: 'id' },
            { name: 'moduleType', referencedColumnName: 'moduleType' },
        ]
    )
    deal: Deal

    @OneToOne(() => Product, (product) => product.media, { onDelete: "CASCADE" })
    @JoinColumn(
        [
            { name: 'moduleId', referencedColumnName: 'id' },
            { name: 'moduleType', referencedColumnName: 'moduleType' },
        ]
    )
    product: Product

    @OneToOne(() => Category, (category) => category.media, { onDelete: "CASCADE" })
    @JoinColumn(
        [
            { name: 'moduleId', referencedColumnName: 'id' },
            { name: 'moduleType', referencedColumnName: 'moduleType' },
        ]
    )
    category: Category

    @OneToOne(() => Tag, (tag) => tag.media, { onDelete: "CASCADE" })
    @JoinColumn(
        [
            { name: 'moduleId', referencedColumnName: 'id' },
            { name: 'moduleType', referencedColumnName: 'moduleType' },
        ]
    )
    tag: Tag

    @OneToOne(() => SubCategory, (subCategory) => subCategory.media, { onDelete: "CASCADE" })
    @JoinColumn(
        [
            { name: 'moduleId', referencedColumnName: 'id' },
            { name: 'moduleType', referencedColumnName: 'moduleType' },
        ]
    )
    subCategory: SubCategory
}
