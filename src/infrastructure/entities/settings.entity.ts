import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Settings {

    @PrimaryGeneratedColumn()
    id:number

    @Column()
    reservationProductLimit:number

    @Column()
    nextReservationTimeLimit:number

    @Column()
    reservationValidationTime:number

}
