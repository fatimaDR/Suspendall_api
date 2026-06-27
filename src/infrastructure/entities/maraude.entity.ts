import { Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductMaraude } from "./productMaraude.entity";
import { Business } from "./business.entity";
import { User } from "./user.entity";
import { Partner } from "./partner.entity";
import { Media } from "./media.entity";

@Entity()
export class Maraude {

    @PrimaryGeneratedColumn()
    id:number

    @Column('text', {'default': null})
    description:string

    @Column()
    name:string

    @Column({ type: 'date', nullable: true })
    endDate:Date

    @Column()
    message:string

    @Column({'default': "MARAUDE"})
    moduleType:string

    @OneToMany(() => ProductMaraude, (productMaraude) => productMaraude.product)
    productMaraude:ProductMaraude[]

    @ManyToOne(() => Business, (business) => business.maraudes, { onDelete: "CASCADE" })
    business:Business

    @ManyToOne(() => User, (user) => user.maraudes, {eager: true, onDelete: "CASCADE" })
    user:User

    @ManyToOne(() => Partner, (partner) => partner.maraudes, {onDelete: "SET NULL"})
    partner:Partner

    @OneToMany(() => Media, (media) => media.maraude)
    media: Media[]
    
}
