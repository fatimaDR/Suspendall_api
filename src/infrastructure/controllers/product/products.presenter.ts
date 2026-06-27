import { Product } from "src/infrastructure/entities/product.entity";
import { Collection } from "typeorm";
import { BusinessPresenter } from "../business/business.presenter";
import { CategoryPresenter } from "../category/category.presenter";
import { ProductMaraudePresenter } from "../productMaraude/productMaraude.presenter";
import { Maraude } from "src/infrastructure/entities/maraude.entity";
import { ProductEventPresenter } from "../productEvent/productEvent.presenter";
import { OrderItem } from "src/infrastructure/entities/order-item.entity";
import { SubCategoryPresenter } from "../sub-category/sub-category.presenter";
import { OrderItemPresenter } from "../orderItems/orderItem.presenter";
import { TagPresenter } from "../tag/tags.presenter";
import { MediaPresenter } from "../media/media.presenter";

export class ProductPresenter {
    id: number;
    title: string;
    price: number;
    description: string;
    available:boolean;
    quantity:number;
    createdAt:Date;
    subCategory:Object
    business: Object;
    productEvent: object;
    media: object;
    tags: object;
  
    constructor(product: Product) {
      this.id = product.id;
      if(product.title) this.title = product.title;
      if(product.price) this.price = product.price;
      if(product.description) this.description = product.description;
      if(product.available) { this.available = product.available } else { this.available = false };
      if(product.quantity) this.quantity = product.quantity;
      if(product.createdAt) this.createdAt = product.createdAt;


      if(product.subCategory) {
        this.subCategory = new SubCategoryPresenter(product.subCategory) ;
      }

      if(product.business) {
        this.business = new BusinessPresenter(product.business);
      }

      if(product.media) {
        this.media = new MediaPresenter(product.media)
      }
      
      if (product.productEvent) {
        this.productEvent = product.productEvent.map( (productEvent) => new ProductEventPresenter(productEvent))
      }

      if (product.tags) {
        this.tags = product.tags.map( (tag) => new TagPresenter(tag))
      }
    }
  }