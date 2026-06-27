import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, BeforeInsert } from 'typeorm';
import { User } from './user.entity';


@Entity('reset_passwords')
export class ResetPassword {
  @PrimaryGeneratedColumn()
  id: number;

    @OneToOne(() => User, (user)=> user.resetPassword, { onDelete: "SET NULL" })
    @JoinColumn()
    user: User;

    @Column()
    password: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @BeforeInsert()
    currentDate() {
    this.createdAt = new Date();
    this.updatedAt = new Date();
    }
}
