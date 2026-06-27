import { DataSource } from "typeorm";
import { Stock } from "../entities/stock.entity";

export const stockProviders = [
    {
      provide: 'STOCK_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(Stock),
      inject: ['DATA_SOURCE'],
    }
];