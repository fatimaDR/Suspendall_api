import { Tag } from "src/infrastructure/entities/tag.entity";
import { MediaPresenter } from "../media/media.presenter";

export class TagPresenter {
    id: number;
    name: string;
    media: object;
    createdAt: Date;

    constructor(tag: Tag) {
      this.id = tag.id;
      this.name = tag.label;
      this.createdAt = tag.createdAt;
      if(tag.media) this.media = new MediaPresenter(tag.media) ;
    }
  }