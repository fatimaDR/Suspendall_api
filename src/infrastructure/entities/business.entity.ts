import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { City } from "./city.entity";
import { Category } from "./category.entity";
import { Product } from "./product.entity";
import { OpeningHour } from "./opening-hour.entity";
import { Maraude } from "./maraude.entity";
import { Feedback } from "./feedback.entity";
import { Media } from "./media.entity";
import { Stock } from "./stock.entity";
import { Favoris } from "./favoris.entity";
import { SubCategory } from "./sub-category.entity";
import { Like } from "./like.entity";
import { TypeBusiness } from "./type-business.entity";
import { OrderItem } from "./order-item.entity";
import { ProductLimitRequest } from "./product-limit-request.entity";

@Entity()
export class Business {
 
    @PrimaryGeneratedColumn()
    id:number

    @Column()
    name:string

    @Column('text', {'default': null})
    description:string
    
    @Column()
    socialRaison:string

    @Column({'default': null})
    rib:string

    @Column({'default': null})
    iban:string

    @Column()
    sirenNumber:string

    @Column({'default': null})
    qrCode:string

    @Column({'default': null})
    address:string

    @ManyToOne(() => TypeBusiness, (type) => type.businesses, { onDelete: "SET NULL"})
    type: TypeBusiness;

    @Column()
    latitude:string

    @Column()
    longitude:string

    @Column({'default': false})
    isActive:boolean

    // @Column({ default: 1 }) // Valeur par défaut
    // productLimit: number;
    @Column({'default': false})
    isProductLimited:boolean

    @Column({'default': "BUSINESS"})
    moduleType:string
    
    @OneToOne(() => User, (user) => user.business, { onDelete: "SET NULL" })
    @JoinColumn()
    user: User

    @ManyToOne(() => SubCategory, (subCategory) => subCategory.businesses , { onDelete: "SET NULL"})
    subCategory:SubCategory

    // @ManyToMany(() => SubCategory, (subCategories) => subCategories.businesses, { onDelete: "SET NULL"})
    // subCategories: SubCategory[]

    @OneToMany(() => Product, (products) => products.business )
    products: Product[];

    @OneToMany(() => OpeningHour, (openingHours) => openingHours.business, {eager: true})
    openingHours:OpeningHour[]

    @OneToMany(() => Maraude, (maraudes) => maraudes.business)
    maraudes:Maraude[]

    @OneToMany(() => Feedback, (feedbacks) => feedbacks.business)
    feedbacks:Feedback[]
    
    @OneToMany(() => Media, (media) => media.business)
    media: Media[]

    @OneToMany(() => Stock, (suspendus) => suspendus.business)
    suspendus:Stock[]

    @OneToMany(() => OrderItem, (ordItems) => ordItems.business)
    ordItems:OrderItem[]

    @OneToOne(() => Favoris, (favoris) => favoris.business, { onDelete: "SET NULL" })
    favoris: Favoris

    @OneToMany(() => Like, like => like.business)
    likes: Like[];

    @OneToMany(() => ProductLimitRequest, (productLimitRequests) => productLimitRequests.business)
    productLimitRequests: ProductLimitRequest[];

}
