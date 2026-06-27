import { DataSource } from "typeorm";
import { Profitable } from "../entities/profitable.entity";

export const profitableProviders = [
    {
      provide: 'PROFITABLE_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(Profitable),
      inject: ['DATA_SOURCE'],
    }
];