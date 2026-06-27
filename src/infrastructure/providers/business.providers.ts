import { DataSource } from "typeorm";
import { Business } from "../entities/business.entity";
import { User } from "../entities/user.entity";

export const businessProviders = [
    {
      provide: 'BUSINESS_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(Business),
      inject: ['DATA_SOURCE'],
    },
    {
      provide: 'USER_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(User),
      inject: ['DATA_SOURCE'],
    }
];