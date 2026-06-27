import { Like } from "src/infrastructure/entities/like.entity";
import { BusinessPresenter } from "../business/business.presenter";
import { UserPresenter } from "../user/user.presenter";

export class LikePresenter {
    id: number;
    business:Object
    user: Object;

  
    constructor(like: Like) {
      this.id = like.id;
     
      if(like.business) {
        this.business = new BusinessPresenter(like.business);
      }

      if(like.user) {
        this.user = new UserPresenter(like.user);
      }
      
    }
}