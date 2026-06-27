import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class Association{

    @PrimaryGeneratedColumn()
    id:number;

    @OneToOne(() => User, (user) => user.association, { onDelete: "CASCADE" })
    @JoinColumn()
    user: User
    
    @Column()
    sirenNumber:string    
}
