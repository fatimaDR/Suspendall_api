import { CategorySocioPro } from "src/infrastructure/entities/category-socio-pro.entity"
import { UserPresenter } from "../user/user.presenter"

export class CategorySocioProPresenter {
    id: number
    name: string
    type: string
    createdAt: Date
    updatedAt: Date
    users: object

    constructor(categorySocioPro: CategorySocioPro){
        this.id = categorySocioPro.id
        if(categorySocioPro.name) this.name = categorySocioPro.name
        if(categorySocioPro.type) this.type = categorySocioPro.type
        if(categorySocioPro.createdAt) this.createdAt = categorySocioPro.createdAt
        if(categorySocioPro.updatedAt) this.updatedAt = categorySocioPro.updatedAt

        if(categorySocioPro.users){
            this.users = categorySocioPro.users.map( (user) => new UserPresenter(user) )
        }
    }
}