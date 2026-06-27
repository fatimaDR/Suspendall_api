import { SubCategory } from "src/infrastructure/entities/sub-category.entity"
import { MediaPresenter } from "../media/media.presenter"
import { CategoryPresenter } from "../category/category.presenter"

export class SubCategoryPresenter {
    id: number
    name: string
    createdAt: Date
    updatedAt: Date
    category: object
    media: object

    constructor(subCategory: SubCategory){
        this.id = subCategory.id
        if(subCategory.name) this.name = subCategory.name
        if(subCategory.createdAt) this.createdAt = subCategory.createdAt
        if(subCategory.updatedAt) this.updatedAt = subCategory.updatedAt

        if(subCategory.category) this.category = new CategoryPresenter(subCategory.category)

        if(subCategory.media) this.media = new MediaPresenter(subCategory.media)
        
    }
}