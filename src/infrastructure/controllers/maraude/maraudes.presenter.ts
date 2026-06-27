import { Association } from "src/infrastructure/entities/association.entity";
import { Business } from "src/infrastructure/entities/business.entity";
import { Maraude } from "src/infrastructure/entities/maraude.entity";
import { User } from "src/infrastructure/entities/user.entity";
import { BusinessPresenter } from "../business/business.presenter";
import { UserPresenter } from "../user/user.presenter";
import { AssociationPresenter } from "../association/association.presenter";
import { PartnerPresenter } from "../partner/partner.presenter";
import { MediaPresenter } from "../media/media.presenter";

export class MaraudePresenter {
  id: number;
  description: string;
  name: string;
  endDate: Date;
  message: string;
  business: Object;
  user: Object;
  partner: Object
  media: object


  constructor(maraude: Maraude) {
    this.id = maraude.id;
    if(maraude.description) this.description = maraude.description;
    if(maraude.name) this.name = maraude.name;
    if( maraude.endDate) this.endDate = maraude.endDate;
    if(maraude.message) this.message = maraude.message;

    if(maraude.business) {
      this.business = new BusinessPresenter(maraude.business);
    }

    if (maraude.user) {
      this.user = new UserPresenter(maraude.user)
    }
    if (maraude.partner) {
      this.partner = new PartnerPresenter(maraude.partner)
    }
    if (maraude.media) {
      this.media = maraude.media.map((m) => new MediaPresenter(m))
  }
  }
}
