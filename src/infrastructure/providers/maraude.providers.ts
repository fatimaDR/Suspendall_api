import { DataSource } from "typeorm";
import { Maraude } from "../entities/maraude.entity";

export const maraudeProviders = [
    {
      provide: 'MARAUDE_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(Maraude),
      inject: ['DATA_SOURCE'],
    }
];  
  