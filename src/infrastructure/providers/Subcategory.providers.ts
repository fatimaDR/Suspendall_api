import { DataSource } from "typeorm";
import { SubCategory } from "../entities/sub-category.entity";

export const SubCategoryProviders = [
    {
        provide: 'SUB_CATEGORY_REPOSITORY',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(SubCategory),
        inject: ['DATA_SOURCE'],
    }    
]