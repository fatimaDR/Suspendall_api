import { DataSource } from "typeorm";
import { Favoris } from "../entities/favoris.entity";

export const favorisProviders = [
    {
      provide: 'FAVORIS_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(Favoris),
      inject: ['DATA_SOURCE'],
    }
];