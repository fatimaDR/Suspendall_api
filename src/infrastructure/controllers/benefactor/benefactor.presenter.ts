import { Benefactor } from "src/infrastructure/entities/benefactor.entity"
import { CityPresenter } from "../city/cities.presenter"
import { UserPresenter } from "../user/user.presenter"

export class BenefactorPresenter {
    id: number
    entreprise: string
    sirenNumber: string
    isCompany: boolean
    firstName: string
    lastName: string

    constructor(benefactor: Benefactor){
        this.id = benefactor.id
        if(benefactor.entreprise) this.entreprise = benefactor.entreprise
        if(benefactor.sirenNumber) this.sirenNumber = benefactor.sirenNumber
        this.isCompany = benefactor.isCompany
        if (benefactor.user) {
            benefactor.user.firstName ? this.firstName = benefactor.user.firstName : this.firstName = ''
            benefactor.user.lastName ?  this.lastName = benefactor.user.lastName : this.lastName = ''
        }
        
    }
}