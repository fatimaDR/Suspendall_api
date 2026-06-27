import { BeforeInsert, Column, Entity, Index, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";
import { User } from "./user.entity";



@Entity()
@Unique('my_unique_constraint', ['name'])
export class City {

    @PrimaryGeneratedColumn()
    id:number
    
    @Column({ unique: true, 'default': null})
    name:string

    @Column()
    createdAt:Date

    @Column()
    updatedAt: Date

    @OneToMany(() => User, (users) => users.city, { onDelete: "SET NULL" })
    users: User[];

    @BeforeInsert()
    currentDate() {
      this.createdAt = new Date();
      this.updatedAt = new Date();
    }
}
