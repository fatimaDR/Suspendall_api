import { DataSource } from "typeorm";
import { TypeBusiness } from "../entities/type-business.entity";

export const TypeBusinessProviders = [
    {
        provide: 'TypeBusiness_REPOSITORY',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(TypeBusiness),
        inject: ['DATA_SOURCE'],
    }    
]