import { Order } from "src/infrastructure/entities/order.entity";
import { BenefactorPresenter } from "../benefactor/benefactor.presenter";
import { OrderItem } from "src/infrastructure/entities/order-item.entity";
import { OrderItemPresenter } from "../orderItems/orderItem.presenter";
import { SuspenduPresenter } from "../stock/SuspenduPresenter";
import { PaymentPresenter } from "../payment/payment.presenter";

export class OrderOfBusinessPresenter {
    id: number;
    subTotal: number
    total: number
    status: string;
    createdAt: Date
    benefactor: object;
    payment: object;
    stocks: object;
    isDon: boolean
    // orderItems: object;

    
    constructor(order: Order) {
        this.id = order.id;
        
        if(order.total) this.total = order.total;

        if(order.subTotal) this.subTotal = order.subTotal

        if(order.status) this.status = order.status

        order.benefactor ? this.isDon  = false : true

        if(order.createdAt) this.createdAt = order.createdAt;

        if(order.benefactor) {
            this.benefactor = new BenefactorPresenter(order.benefactor) ;
        }

        if(order.payment) {
            this.payment = new PaymentPresenter(order.payment)
        }
       
        if(order.orderItems){
            this.stocks = order.orderItems.map((stock) => new OrderItemPresenter(stock))
        }

    }
  }