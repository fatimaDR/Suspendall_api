import { Inject, Injectable } from "@nestjs/common";
import { ProductEvent } from "src/infrastructure/entities/productEvent.entity";
import { Repository } from "typeorm";

@Injectable()
export class ProductEventService {
  constructor(
    @Inject('PRODUCT_EVENT_REPOSITORY') 
    private productEventRepository: Repository<ProductEvent>,
  ){}

  
}