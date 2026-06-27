import { BeforeInsert, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Business } from "./business.entity";

@Entity()
export class TypeBusiness {
    
    @PrimaryGeneratedColumn()
    id:number

    @Column()
    name:string

    @Column()
    createdAt: Date;

    @OneToMany(() => Business, (businesses) => businesses.type )
    businesses: Business[];

    @BeforeInsert()
    currentDate() {
      this.createdAt = new Date();
    }
}
