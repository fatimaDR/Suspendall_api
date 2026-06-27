import { DataSource } from "typeorm";
import { Reservation } from "../entities/reservation.entity";

export const reservationProviders = [
    {
      provide: 'RESERVATION_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(Reservation),
      inject: ['DATA_SOURCE'],
    }
];