import { Order } from "src/infrastructure/entities/order.entity";
import { BenefactorPresenter } from "../benefactor/benefactor.presenter";
import { OrderItem } from "src/infrastructure/entities/order-item.entity";
import { OrderItemPresenter } from "../orderItems/orderItem.presenter";
import { SuspenduPresenter } from "../stock/SuspenduPresenter";
import { PaymentPresenter } from "../payment/payment.presenter";

export class OrderPresenter {
    id: number;
    subTotal: number
    total: number
    status: string;
    createdAt: Date
    benefactor: object;
    payment: object;
    stocks: object;
    // orderItems: object;

    
    constructor(order: Order) {
        this.id = order.id;
        
        if(order.total) this.total = order.total;

        if(order.subTotal) this.subTotal = order.subTotal

        if(order.status) this.status = order.status

        if(order.createdAt) this.createdAt = order.createdAt;

        if(order.benefactor) {
            this.benefactor = new BenefactorPresenter(order.benefactor) ;
        }

        if(order.payment) {
            this.payment = new PaymentPresenter(order.payment)
        }
       
        if(order.stocks){
            this.stocks = order.stocks.map((stock) => new SuspenduPresenter(stock))
        }

        // if(order.orderItems){
        //     this.orderItems = order.orderItems.map((orderItem) => new OrderItemPresenter(orderItem))
        // }
    }
  }