import { Deal } from "src/infrastructure/entities/deal.entity";
import { CategoryPresenter } from "../category/category.presenter";
import { MediaPresenter } from "../media/media.presenter";
import { ProductPresenter } from "../product/products.presenter";
import { SubCategoryPresenter } from "../sub-category/sub-category.presenter";

export class DealPresenter {
    id: number;
    title: string;
    description: string
    link: string
    opportunity: string
    from: Date
    to: Date
    moduleType: string
    createdAt: Date
    deleted_at: Date
    subCategory: object
    media: object
    product: object

    constructor(deal: Deal) {
      this.id = deal.id;
      if(deal.title) this.title = deal.title;
      if(deal.description) this.description = deal.description
      if(deal.link)  this.link = deal.link
      if(deal.opportunity) this.opportunity = deal.opportunity
      if(deal.from) this.from = deal.from
      if(deal.to) this.to = deal.to
      if(deal.moduleType) this.moduleType = deal.moduleType
      this.createdAt = deal.createdAt
      if(deal.deleted_at) this.deleted_at = deal.deleted_at
      if(deal.subCategory){
        this.subCategory = new SubCategoryPresenter(deal.subCategory)
      }
      if (deal.media) {
        this.media = new MediaPresenter(deal.media)
      }
      if (deal.product) {
        this.product = new ProductPresenter(deal.product)
      }
    
    }
  }