import { DataSource } from "typeorm";
import { UserSetting } from "../entities/user-setting.entity";

export const userSettingsProviders = [
    {
      provide: 'USER_SETTINGS_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(UserSetting),
      inject: ['DATA_SOURCE'],
    }
];