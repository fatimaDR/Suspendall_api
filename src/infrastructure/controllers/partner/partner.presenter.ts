import { Partner } from "src/infrastructure/entities/partner.entity";

export class PartnerPresenter {
    id: number;
    name: string;
  
  
    constructor(partner: Partner) {
      this.id = partner.id;
      if(partner.name) this.name = partner.name;
    }
  }