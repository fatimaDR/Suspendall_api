import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Business } from "./business.entity";
import { User } from "./user.entity";

@Entity()
export class Like {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Business, business => business.likes)
    business: Business;

    @ManyToOne(() => User, user => user.likes)
    user: User;
}
