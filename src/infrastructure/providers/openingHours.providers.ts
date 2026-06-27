import { DataSource } from "typeorm";
import { OpeningHour } from "../entities/opening-hour.entity";

export const OpeningHoursProviders = [
    {
      provide: 'OPENING_HOURS_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(OpeningHour),
      inject: ['DATA_SOURCE'],
    }
];