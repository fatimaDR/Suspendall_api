import { DataSource } from "typeorm";
import { ProductMaraude } from "../entities/productMaraude.entity";

export const productMaraudeProviders = [
    {
      provide: 'PRODUCT_MARAUDE_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(ProductMaraude),
      inject: ['DATA_SOURCE'],
    }
];