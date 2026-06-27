import { Favoris } from "src/infrastructure/entities/favoris.entity";
import { BusinessPresenter } from "../business/business.presenter";
import { UserPresenter } from "../user/user.presenter";

export class FavorisPresenter {
    id: number;
    business: object;
    // user: object;

    constructor(favoris: Favoris) {
      this.id = favoris.id;
      
      if(favoris.business) {
        this.business = new BusinessPresenter(favoris.business) 
      }
      // if(favoris.user) {
      //   this.user = new UserPresenter(favoris.user)
      // }
      
    
    }
  }