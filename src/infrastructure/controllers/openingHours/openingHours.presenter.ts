import { OpeningHour } from "src/infrastructure/entities/opening-hour.entity";
import * as dayjs from 'dayjs';

export class OpeningHoursPresenter {
    id: number;
    day: object;
    openingTime: Date ;
    closingTime: Date ;
    isClosed: boolean;

    constructor(object: OpeningHour) {
        this.id = object.id
        this.day = object.day;
        if (object.openingTime) this.openingTime = object.openingTime 
        if (object.closingTime) this.closingTime =  object.closingTime 
        this.isClosed = object.isClosed
    }
}