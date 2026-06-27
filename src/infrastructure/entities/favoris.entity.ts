import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Business } from "./business.entity";

@Entity()
export class Favoris {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    createdAt: Date;

    @ManyToOne(() => User, (user) => user.favoris)
    user: User;

    @OneToOne(() => Business, (business) => business, { onDelete: "CASCADE" })
    @JoinColumn()
    business: Business

    @BeforeInsert()
    currentDate() {
      this.createdAt = new Date();
    }

}
