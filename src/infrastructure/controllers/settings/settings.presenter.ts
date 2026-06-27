import { Settings } from "src/infrastructure/entities/settings.entity"

export class SettingsPresenter {
    id: number
    reservationProductLimit: number
    nextReservationTimeLimit: number
    reservationValidationTime: number

    constructor(settings: Settings){
        this.id = settings.id
        this.reservationProductLimit = settings.reservationProductLimit
        this.nextReservationTimeLimit = settings.nextReservationTimeLimit
        this.reservationValidationTime = settings.reservationValidationTime
    }
}