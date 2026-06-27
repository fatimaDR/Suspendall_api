import { DataSource } from "typeorm";
import { Deal } from "../entities/deal.entity";

export const dealProviders = [
    {
      provide: 'DEAL_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(Deal),
      inject: ['DATA_SOURCE'],
    }
];