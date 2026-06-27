import { Stock } from "src/infrastructure/entities/stock.entity"
import { BusinessPresenter } from "../business/business.presenter"
import { ProductEventPresenter } from "../productEvent/productEvent.presenter"
import { ProductPresenter } from "../product/products.presenter"
import { OrderPresenter } from "../oder/order.presenter"

export class SuspenduPresenter {
    id: number
    quantity: number
    productPrice: number
    sousTotal:number
    product: object
    business: object
    order: object
    constructor(suspendu: Stock){
        this.id = suspendu.id
        if(suspendu.quantity) this.quantity = suspendu.quantity
        if(suspendu.productPrice) this.productPrice = suspendu.productPrice
        if(suspendu.total) this.sousTotal = suspendu.total
        
        if(suspendu.business) {
            this.business = new BusinessPresenter(suspendu.business)
        }

        if(suspendu.product){
            this.product = new ProductPresenter(suspendu.product) 
        }

        if(suspendu.order){
            this.order = new OrderPresenter(suspendu.order)
        }
    }
}