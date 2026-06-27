import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { OpeningHour } from "./opening-hour.entity";

@Entity()
export class Day {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @OneToMany(() => OpeningHour, (openingHour) => openingHour.day)
    openingHours: OpeningHour[];
}
