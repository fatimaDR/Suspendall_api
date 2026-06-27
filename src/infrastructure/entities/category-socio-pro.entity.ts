import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { User } from "./user.entity"
import { CATEGORY_SOCIO_PRO } from "src/functions/categorySocioPro.enum"

@Entity()
export class CategorySocioPro {

    @PrimaryGeneratedColumn()
    id:number

    @Column()
    name:string

    @Column()
    createdAt:Date

    @Column()
    updatedAt:Date

    @OneToMany(() => User, (users) => users.category )
    users: User[];

    @Column({
      type: "enum",
      enum: CATEGORY_SOCIO_PRO,
      // default: CATEGORY_SOCIO_PRO.Particular,
    })
    type: CATEGORY_SOCIO_PRO;

    @BeforeInsert()
    currentDate() {
      this.createdAt = new Date();
      this.updatedAt = new Date();
    }

    @BeforeUpdate()
    updateDate() {
      this.updatedAt = new Date();
    }
}
