import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Event } from "./event.entity";
import { Maraude } from "./maraude.entity";

@Entity()
export class Partner {

    @PrimaryGeneratedColumn()
    id:number

    @Column()
    name:string

    @ManyToMany(() => Event, (events) => events.partners)
    @JoinTable({ 
        name: 'partner_event'
    })
    events: Event[]

    @OneToMany(() => Maraude, (maraudes) => maraudes.partner )
    maraudes: Maraude[];
}
