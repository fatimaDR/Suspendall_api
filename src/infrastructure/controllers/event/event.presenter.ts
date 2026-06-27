import { Event } from "src/infrastructure/entities/event.entity";
import { PartnerPresenter } from "../partner/partner.presenter";
import { MediaPresenter } from "../media/media.presenter";
import { ProductPresenter } from "../product/products.presenter";

export class EventPresenter {
    id: number;
    name: string;
    description: string;
    message: string;
    endDate: Date;
    partners: object;
    media: object;
    products: Array<object>;
  
    constructor(event: Event) {
      this.id = event.id;
      if(event.name) this.name = event.name;
      if(event.description) this.description = event.description;
      if(event.message) this.message = event.message;
      if( event.endDate) this.endDate = event.endDate;
      if(event.partners) {
        this.partners = event.partners.map((partners) => new PartnerPresenter(partners))
      }
      if(event.media) {
        this.media = event.media.map((m) => new MediaPresenter(m))
      }
      if(event.productEvent) {
        let products = []
        event.productEvent.forEach(productEvent => {
          if(productEvent.product){
            products.push(new ProductPresenter(productEvent.product))
          }
        });
        this.products = products 
      }
    
    }
  }
  