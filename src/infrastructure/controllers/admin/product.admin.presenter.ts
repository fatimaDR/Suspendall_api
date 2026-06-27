import { Product } from "src/infrastructure/entities/product.entity"

export class ProductAdminPresenter {
    id: number
    title: string

    constructor(product: Product){
        this.id = product.id
        if(product.title) this.title = product.title
    }
}