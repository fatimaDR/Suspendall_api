import { Payment } from "src/infrastructure/entities/payment.entity";
import { OrderPresenter } from "../oder/order.presenter";

export class PaymentPresenter {

    id: number;
    total: number;
    subTotal: number;
    stripeId: string;
    paymentMode: string;
    tva: number;
    bankFee: number;
    lbs: number;
    createdAt: Date;
    order: object;

    constructor(payment: Payment){
        this.id = payment.id;
        if(payment.total) this.total = payment.total;
        if(payment.subTotal) this.subTotal = payment.subTotal;
        if(payment.stripeId) this.stripeId = payment.stripeId
        if(payment.paymentMode) this.paymentMode = payment.paymentMode
        if(payment.tva) this.tva = payment.tva;
        this.bankFee = payment.bankFee
        this.lbs = payment.lbs
        if(payment.createdAt) this.createdAt = payment.createdAt;

        if(payment.order) {
            this.order = new OrderPresenter(payment.order)
        }
    }

}