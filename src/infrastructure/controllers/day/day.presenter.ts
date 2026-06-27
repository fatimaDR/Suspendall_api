import { Day } from "src/infrastructure/entities/day.entity"
import { OpeningHoursPresenter } from "../openingHours/openingHours.presenter"

export class DayPresenter {
    id: number
    name: string
    openingHours: object

    constructor(day: Day){
        this.id = day.id
        if(day.name) this.name = day.name

        if(day.openingHours){
            this.openingHours = day.openingHours.map( (opHour) => new OpeningHoursPresenter(opHour) )
        }
    }
}