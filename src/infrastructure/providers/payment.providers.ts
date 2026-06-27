import { DataSource } from "typeorm";
import { Payment } from "../entities/payment.entity";

export const paymentProviders = [
    {
      provide: 'PAIMENT_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(Payment),
      inject: ['DATA_SOURCE'],
    }
];