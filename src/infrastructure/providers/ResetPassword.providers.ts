import { DataSource } from "typeorm";
import { ResetPassword } from "../entities/reset-password.entity";

export const ResetPasswordProviders = [
    {
        provide: 'RESET_PASSWORD_REPOSITORY',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(ResetPassword),
        inject: ['DATA_SOURCE'],
    }    
]
