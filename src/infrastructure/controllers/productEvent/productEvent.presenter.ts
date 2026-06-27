import { ProductEvent } from "src/infrastructure/entities/productEvent.entity";
import { ProductPresenter } from "../product/products.presenter";
import { EventPresenter } from "../event/event.presenter";

export class ProductEventPresenter {

    id: number;
    quantity:number;
    product:Object
    event: Object;

    constructor(productEvent: ProductEvent) {
      this.id = productEvent.id;
      if(productEvent.quantity) this.quantity = productEvent.quantity;

      if(productEvent.product) {
        this.product = new ProductPresenter(productEvent.product);
      }

      if(productEvent.event) {
        this.event = new EventPresenter(productEvent.event);
      }
      
    }
}    