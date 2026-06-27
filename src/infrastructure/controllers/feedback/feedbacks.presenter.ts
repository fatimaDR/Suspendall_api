import { Feedback } from "src/infrastructure/entities/feedback.entity";
import { BusinessPresenter } from "../business/business.presenter";
import { ProfitablePresenter } from "../profitable/profitable.presenter";
import { UserPresenter } from "../user/user.presenter";

export class FeedbackPresenter {
    id: number;
    note: number;
    comment: string;
    createdAt: Date;
    user: Object;
    business: Object
  
    constructor(feedback: Feedback) {
        this.id = feedback.id;
        this.note = feedback.note
        if(feedback.comment) this.comment = feedback.comment;
        if(feedback.createdAt) this.createdAt = feedback.createdAt;

        if(feedback.business) {
            this.business = new BusinessPresenter(feedback.business);
        }
        if (feedback.user) {
            this.user = new UserPresenter(feedback.user)
        }
    }
}
  