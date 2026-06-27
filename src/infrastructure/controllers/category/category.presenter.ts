import { CatType, Category } from "src/infrastructure/entities/category.entity"
import { BusinessPresenter } from "../business/business.presenter"
import { SubCategoryPresenter } from "../sub-category/sub-category.presenter"
import { MediaPresenter } from "../media/media.presenter"


export class CategoryPresenter {
    id: number
    name: string
    type: CatType
    createdAt: Date
    updatedAt: Date
    media: object
    subCategories: object

    constructor(category: Category){
        this.id = category.id
        if(category.name) this.name = category.name
        if(category.type) this.type = category.type
        if(category.createdAt) this.createdAt = category.createdAt
        if(category.updatedAt) this.updatedAt = category.updatedAt
        if(category.media) this.media = new MediaPresenter(category.media)

        if(category.subCategories){
            this.subCategories = category.subCategories.map( (subCategory) => new SubCategoryPresenter(subCategory) )
        }
    }
}