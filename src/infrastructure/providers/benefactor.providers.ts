import { DataSource } from "typeorm";
import { Benefactor } from "../entities/benefactor.entity";

export const benefactorProviders = [
    {
      provide: 'BENEFACTOR_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(Benefactor),
      inject: ['DATA_SOURCE'],
    }
];