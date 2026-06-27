import { OrderItem } from "src/infrastructure/entities/order-item.entity";
import { OrderPresenter } from "../oder/order.presenter";
import { BusinessPresenter } from "../business/business.presenter";
import { ProductPresenter } from "../product/products.presenter";

export class OrderItemPresenter {
    id: number;
    quantity: number;
    productPrice: number
    sousTotal:number
    // suspendu: number
    order: object;
    product: object;
    business: object 
    
    constructor(orderItem: OrderItem) {
        this.id = orderItem.id;
        if(orderItem.quantity) this.quantity = orderItem.quantity;

        // if(orderItem.suspendu) this.suspendu = orderItem.suspendu ;
        // orderItem.suspendu ? this.suspendu = orderItem.suspendu : this.suspendu = 0

        if(orderItem.productPrice) this.productPrice = orderItem.productPrice;

        if(orderItem.total) this.sousTotal = orderItem.total

        if(orderItem.business) {
            this.business = new BusinessPresenter(orderItem.business)
        }

        if(orderItem.product){
            this.product = new ProductPresenter(orderItem.product) 
        }

        // if(orderItem.productMaraude) this.productMaraude = orderItem.productMaraude;

        // if(orderItem.productEvent) this.productEvent = orderItem.productEvent;
    }
  }