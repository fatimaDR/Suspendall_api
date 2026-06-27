import { DataSource } from "typeorm";
import { ProductLimitRequest } from "../entities/product-limit-request.entity";

export const productLimitRequestProviders = [
    {
      provide: 'PRODUCT_LIMIT_REQUEST_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(ProductLimitRequest),
      inject: ['DATA_SOURCE'],
    }
];