import { BeforeInsert, Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";
import { ProductEvent } from "./productEvent.entity";
import { Partner } from "./partner.entity";
import { Media } from "./media.entity";

@Entity()
export class Event {

    @PrimaryGeneratedColumn()
    id:number

    @Column()
    name:string

    @Column('text', {'default': null})
    description:string

    @Column()
    message:string

    @Column({ type: 'date', nullable: true })
    endDate:Date

    @Column()
    createdAt:Date
    
    @Column({'default': "EVENT"})
    moduleType:string

    @BeforeInsert()
    currentDate() {
      this.createdAt = new Date()
    }

    @ManyToMany(() => Partner, (partners) => partners.events)
    partners: Partner[]

    @OneToMany(() => ProductEvent, (productEvent) => productEvent.event)
    productEvent:ProductEvent[]
    
    @OneToMany(() => Media, (media) => media.event) 
    media: Media[]

}
