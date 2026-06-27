import { DataSource } from "typeorm";
import { Association } from "../entities/association.entity";

export const associationProviders = [
    {
      provide: 'ASSOCIATION_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(Association),
      inject: ['DATA_SOURCE'],
    }
];