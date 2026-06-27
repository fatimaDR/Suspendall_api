import { BeforeInsert, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Business } from "./business.entity";
import { Day } from "./day.entity";

// export enum Day {
//     Lundi    = "LUNDI",
//     Mardi    = "MARDI",
//     Mercredi = "MERCREDI",
//     Jeudi    = "JEUDI",
//     vendredi = "VENDREDI",
//     Samedi   = "SAMEDI",
//     Dimanche = "DIMANCHE"
// }

@Entity()
export class OpeningHour {

    @PrimaryGeneratedColumn()
    id:number

    @ManyToOne(() => Day, (day) => day.openingHours, { eager: true })
    day: Day;
    // @Column({type: "enum", enum: Day})
    // day:Day
    
    @Column('time', {name: 'opening_time', 'default': null})
    openingTime:Date

    @Column('time', {name: 'closing_time', 'default': null})
    closingTime:Date

    @Column()
    isClosed: boolean

    @ManyToOne(() => Business, (business) => business.openingHours, { onDelete: "CASCADE" })
    business:Business

    @Column()
    createdAt:Date

    @Column()
    updatedAt: Date

    @BeforeInsert()
    currentDate() {
      this.createdAt = new Date();
      this.updatedAt = new Date();
    }

}
