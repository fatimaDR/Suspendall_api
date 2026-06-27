import { DataSource } from "typeorm";
import { CategorySocioPro } from "../entities/category-socio-pro.entity";

export const CategorySocioProProviders = [
    {
        provide: 'CategorySocioPro_REPOSITORY',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(CategorySocioPro),
        inject: ['DATA_SOURCE'],
    }    
]