import { Business } from "src/infrastructure/entities/business.entity";
import { CityPresenter } from "../city/cities.presenter";
import { CategoryPresenter } from "../category/category.presenter";
import { MediaPresenter } from "../media/media.presenter";
import { ProductPresenter } from "../product/products.presenter";
import { OpeningHoursPresenter } from "../openingHours/openingHours.presenter";
import { FeedbackPresenter } from "../feedback/feedbacks.presenter";
import { SubCategoryPresenter } from "../sub-category/sub-category.presenter";
import { TypePresenter } from "../type-business/TypePresenter";
import { LikePresenter } from "../like/likes.presenter";

export class BusinessPresenter {
   
    firstName: string
    email: string
    phone: string
    postalCode: number
    address: string;
    role: string;
    city: object
    // Les informations du commerce
    id: number;
    name: string;
    description: string;
    socialRaison: string
    rib: string;
    sirenNumber: string;
    isActive: boolean;
    type: Object;
    iban: string;
    qrCode: string;
    isProductLimited: boolean;
    subCategory: Object
    media: Object;
    latitude: string;
    longitude: string;
    products: object
    openingHours: object
    feedbacks: object
    suspendus: object
    likes: object
    averageRating: number
    
    constructor(business: Business) {
        this.id = business.id
        if(business.name) this.name = business.name
        this.isActive = business.isActive
        if(business.user){
            const user = business.user
            this.email = user.email
            if(user.firstName) this.firstName = user.firstName
            if(user.phone) this.phone = user.phone
            if(user.postalCode) this.postalCode = user.postalCode
            if(user.addresse) this.address = user.addresse
            if(user.city){
                this.city = new CityPresenter(user.city)
            }
            
        }
        if(business.description) this.description = business.description
        if(business.socialRaison) this.socialRaison = business.socialRaison
        if(business.sirenNumber) this.sirenNumber = business.sirenNumber
        if (business.iban) this.iban = business.iban
        if (business.qrCode) {
            const qrBaseUrl = process.env.QR_URL || 'https://api.suspendall.snack-dev.fr/api/business';
            this.qrCode = `${qrBaseUrl}?qrcode=${encodeURIComponent(business.qrCode)}`;
        }
        business.isProductLimited ? this.isProductLimited = business.isProductLimited : this.isProductLimited = false
        if (business.rib) this.rib = business.rib
        if(business.address) this.address = business.address
        if(business.type) {
            this.type = new TypePresenter(business.type)
        }
        if(business.latitude) this.latitude = business.latitude;
        if(business.longitude) this.longitude = business.longitude
        
        if (business.subCategory) {
            this.subCategory = new SubCategoryPresenter(business.subCategory)
        }
        if (business.media) {
            this.media = business.media.map((m) => new MediaPresenter(m))
        }
        if(business.products) {
            this.products = business.products.map((products) => new ProductPresenter(products))
        }

        if(business.openingHours) {
            this.openingHours = business.openingHours.map((oh) => new OpeningHoursPresenter(oh))
        }

        if(business.feedbacks) {
            this.feedbacks = business.feedbacks.map( (feedback) => new FeedbackPresenter(feedback))
            if(business.feedbacks.length > 0) {
                const feedbacksSum = business.feedbacks.reduce((sum, feedback) => sum + feedback.note, 0);
                this.averageRating = feedbacksSum / business.feedbacks.length; 
            } 
        }

        if (business.likes) {
            this.likes = business.likes.map( (like) => new LikePresenter(like) )
        }

        if (business.suspendus) {
            this.suspendus = (business.suspendus).map((susp) => susp)
        }
    }
    
}