import { Module } from "@nestjs/common";
import { DatabaseModule } from "src/database/database.module";
import { productEventProviders } from "src/infrastructure/providers/productEvent.providers";
import { ProductEventService } from "./productEvent.service";
import { Product } from "src/infrastructure/entities/product.entity";

@Module({
    controllers: [],
    providers: [ProductEventService, ...productEventProviders],
    imports: [DatabaseModule],
    exports: [ProductEventService, ...productEventProviders]
  })
  export class ProductEventModule {}