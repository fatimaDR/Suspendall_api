import { DataSource } from "typeorm";
import { Settings } from "../entities/settings.entity";

export const SettingsProviders = [
    {
        provide: 'SETTINGS_REPOSITORY',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(Settings),
        inject: ['DATA_SOURCE'],
    }    
]