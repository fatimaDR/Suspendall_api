import { Association } from "src/infrastructure/entities/association.entity"

export class AssociationPresenter {
    id: number
    sirenNumber: string

    constructor(association: Association){
        this.id = association.id
        if(association.sirenNumber) this.sirenNumber = association.sirenNumber
    }
}