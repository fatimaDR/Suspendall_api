import { Media } from "src/infrastructure/entities/media.entity";

export class MediaPresenter {
    id: number;
    type: string;
    fileName: string;
    originalName: string;
    mimeType: string;
    path: string;

    constructor(media: Media) {
        this.id = media.id;
        this.type = media.type;
        this.fileName = media.fileName;
        this.originalName = media.originalName;
        this.mimeType = media.mimeType;
        this.path = media.path;
    }
}