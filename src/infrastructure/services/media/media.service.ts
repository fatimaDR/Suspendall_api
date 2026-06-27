import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Media, MediaType } from 'src/infrastructure/entities/media.entity';
import * as fs from 'fs';

@Injectable()
export class MediaService {

  constructor(
    @Inject('MEDIA_REPOSITORY') 
    private mediaRepository: Repository<Media>,
  ){}
  
  async createMedia(moduleId: number, moduleType: string, type: MediaType, file) {
    try{
      const media = {
        moduleId: moduleId,
        moduleType: moduleType,
        type: type,
        fileName: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        path: file.path
      }
      const created_media = await this.mediaRepository.create(media)
      return await this.mediaRepository.save(created_media)
    }catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async updateMedia(media_id: number, file){
    try{
      const existed_media = await this.mediaRepository.findOneBy({id: media_id})
      if(existed_media){
        const media = {
          fileName: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          path: file.path
        }
        this.removeMedia(existed_media.path)
        await this.mediaRepository.update(existed_media.id, {updatedAt: new Date(), ...media})
        return await this.mediaRepository.findOneBy({id: existed_media.id})
      }
    }catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async removeMedia(path: string) {
    fs.unlink('./' + path, (err) => {
      if (err) {
        console.error(err);
        return err;
      }
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} media`;
  }

  async findModuleMedia(moduleId, moduleType){
    const media = await this.mediaRepository.find({
      where: {
        moduleId: moduleId,
        moduleType: moduleType
      }
    })
    return media
  }
}
