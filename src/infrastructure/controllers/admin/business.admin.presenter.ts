import { Business } from "src/infrastructure/entities/business.entity"
import { ProductAdminPresenter } from "./product.admin.presenter"

export class BusinessAdminPresenter {
    id: number
    name: string
    products: object
    isProductLimited: boolean;

    constructor(business: Business){
        this.id = business.id
        if(business.name) this.name = business.name
        business.isProductLimited ? this.isProductLimited = business.isProductLimited : this.isProductLimited = false
        if (business.products) {
            this.products = business.products.map((product) => new ProductAdminPresenter(product))
        }
    }
}