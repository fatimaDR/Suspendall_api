import { DataSource } from "typeorm";
import { ProductEvent } from "../entities/productEvent.entity";

export const productEventProviders = [
    {
      provide: 'PRODUCT_EVENT_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(ProductEvent),
      inject: ['DATA_SOURCE'],
    }
];