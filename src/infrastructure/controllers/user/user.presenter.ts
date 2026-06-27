import { Role } from "src/auth/role.enum"
import { User } from "src/infrastructure/entities/user.entity"
import { AssociationPresenter } from "../association/association.presenter"
import { ProfitablePresenter } from "../profitable/profitable.presenter"
import { BenefactorPresenter } from "../benefactor/benefactor.presenter"
import { BusinessPresenter } from "../business/business.presenter"
import { CityPresenter } from "../city/cities.presenter"
import { CategorySocioPro } from "src/infrastructure/entities/category-socio-pro.entity"
import { CreateCategorySocioProDto } from "../category-socio-pro/dto/create-category-socio-pro.dto"
import { CategorySocioProPresenter } from "../category-socio-pro/categorySocioPro.presenter"
import { MediaPresenter } from "../media/media.presenter"
import { format } from "date-fns"

export class UserPresenter {
    id: number
    firstName: string
    lastName: string
    username: string
    email: string
    phone: string
    addresse: string
    birthday: string | null;
    postalCode: number
    isVerified: boolean
    isActive: boolean
    role: Role
    city: Object
    categoriSocioPro: Object
    profitable: Object
    benefactor: Object
    business: Object
    media: Object
    createdAt: Date
    updatedAt: Date
    deleted: boolean

    constructor(user: User){
        this.id = user.id
        this.role = user.role
        this.email = user.email
        if(user.firstName) this.firstName = user.firstName
        if(user.lastName) this.lastName = user.lastName
        if(user.username) this.username = user.username
        if (user.addresse) this.addresse = user.addresse
        if(user.birthday) this.birthday = user.birthday ? format(user.birthday, 'dd-MM-yyyy') : null;
        if(user.phone) this.phone = user.phone
        if(user.postalCode) this.postalCode = user.postalCode
        this.isVerified = user.isVerified
        this.isActive = user.isActive
        this.createdAt = user.createdAt
        this.updatedAt = user.updatedAt
        this.deleted = user.deleted
        if(user.city){
            this.city = new CityPresenter(user.city)
        }
        if(user.category){
            this.categoriSocioPro = new CategorySocioProPresenter(user.category)
        }
        if(user.profitable){
            this.profitable = new ProfitablePresenter(user.profitable)
        }
        else if(user.benefactor){
            console.log(user.benefactor)
            this.benefactor = new BenefactorPresenter(user.benefactor)
        }
        else if(user.business){
            this.business = new BusinessPresenter(user.business)
        }
        if(user.media){
            this.media = new MediaPresenter(user.media)
        }
    }
}