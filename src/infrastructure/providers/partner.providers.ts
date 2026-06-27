
import { DataSource } from "typeorm";
import { Maraude } from "../entities/maraude.entity";
import { Partner } from "../entities/partner.entity";

export const partnerProviders = [
    {
      provide: 'PARTNER_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(Partner),
      inject: ['DATA_SOURCE'],
    }
];