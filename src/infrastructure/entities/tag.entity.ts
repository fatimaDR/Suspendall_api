import { BeforeInsert, Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Media } from "./media.entity";

@Entity()
export class Tag {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    label: string;

    @Column()
    createdAt:Date

    @Column({'default': "TAG"})
    moduleType:string

    @OneToOne(() => Media, (media) => media.tag)
    media: Media;

    @BeforeInsert()
    currentDate() {
      this.createdAt = new Date();
    }
}
