import { Reservation } from "src/infrastructure/entities/reservation.entity";
import { ProfitablePresenter } from "../profitable/profitable.presenter";
import { ProductPresenter } from "../product/products.presenter";
import { SuspenduPresenter } from "../stock/SuspenduPresenter";

export class ReservationPresenter {
    id: number;
    collected: boolean;
    createdAt:Date;
    collectedAt:Date;
    profitable: object;
    suspendu: object;
    
  
    constructor(reservation: Reservation) {
      this.id = reservation.id;
      reservation.collected ? this.collected = reservation.collected : this.collected = reservation.collected ;
      // this.collected = reservation.collected !== undefined ? reservation.collected : this.collected;

      if(reservation.createdAt) this.createdAt = reservation.createdAt;
      if(reservation.collectedAt) this.collectedAt = reservation.collectedAt;

      if(reservation.profitable) {
        this.profitable = new ProfitablePresenter(reservation.profitable);
      }

      if(reservation.suspendu) {
        this.suspendu =  new SuspenduPresenter(reservation.suspendu);
        // this.suspendus = (reservation.suspendus).map((suspendu) => new SuspenduPresenter(suspendu))
      }
    }
  }