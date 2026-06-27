import { DataSource } from "typeorm";
import { Day } from "../entities/day.entity";

export const dayProviders = [
    {
      provide: 'DAY_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(Day),
      inject: ['DATA_SOURCE'],
    }
];