import { Profitable } from "src/infrastructure/entities/profitable.entity"

export class ProfitablePresenter {
    id: number
    studentCard: string

    constructor(profitable: Profitable){
        this.id = profitable.id
        if(profitable.studentCard) this.studentCard = profitable.studentCard
    }
}