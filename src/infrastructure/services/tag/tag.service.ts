import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateTagDto } from '../../controllers/tag/dto/create-tag.dto';
import { UpdateTagDto } from '../../controllers/tag/dto/update-tag.dto';
import { Tag } from 'src/infrastructure/entities/tag.entity';
import { Like, Repository } from 'typeorm';
import { TagPresenter } from 'src/infrastructure/controllers/tag/tags.presenter';
import { MediaService } from '../media/media.service';
import { MediaType } from 'src/infrastructure/entities/media.entity';

@Injectable()
export class TagService {

constructor(
  @Inject('TAG_REPOSITORY')
  private readonly tagRepository: Repository<Tag>,
  private mediaService: MediaService,
  
){}

  async create(createTagDto: CreateTagDto) {
    
    try {
      const existed = await this.tagRepository.exist({
        where: {
          label: createTagDto.label
        }
      })
      let errors = [];
      if(existed){
        errors.push({
          field: 'name',
          message: 'already exist'
        });
      
        throw new HttpException(
          {
            message: "",
            errors: errors
          },
          HttpStatus.BAD_REQUEST,
        );
       } 

      const created = await this.tagRepository.create(createTagDto)
      const tag = await this.tagRepository.save(created)
      
      return {
        data: { Tag: new TagPresenter(tag) }
      }

    } catch (error) {
      if(error.response) throw new HttpException(error.response,error.status)
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async findAll(query) {
    try {
      const { limit, offset , keyword = '' } = query;
      const tags = await this.tagRepository.find({
        where: {
          label: Like(`${keyword}%`),
        },
        relations: ['media'],
        order: { createdAt: 'DESC' },
        take: limit,
        skip: offset,
      })
      const totalItems = tags.length
      const allTags = tags.map( (tag) => new TagPresenter(tag) )
      return { 
        data: {
          tags: allTags,
          totalItems: totalItems
        } 
      }

    } catch (error) {
      if(error.response) throw new HttpException(error.response,error.status)
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async findOne(id: number) {
    try {
      const tag = await this.tagRepository.findOne({
        where: {id: id},
        relations: ['media'],
      })
      if (!tag) {
        throw new HttpException(
          {
            message: 'tag id does not exist'
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return { data: { tag: new TagPresenter(tag) }}

    } catch (error) {
      if(error.response) throw new HttpException(error.response,error.status)
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async update(id: number, updateTagDto: UpdateTagDto) {
    try {
      const tag = await this.tagRepository.findOneBy({id})
      if (tag) {
        const updateTag = await this.tagRepository.update(id, updateTagDto)
        if (updateTag.affected) {
          const updatedTag = await this.tagRepository.findOneBy({id})
          return { 
            data: { Tag: new TagPresenter(updatedTag) },
            message: 'Mise à jour effectuée avec succès'
          }
        }else {
          throw new HttpException('Aucune modification apportée.', HttpStatus.NOT_MODIFIED)
        }
      }

      throw new HttpException(
        {
          message: 'tag id does not exist'
        },
        HttpStatus.NOT_FOUND,
      );

    } catch (error) {
      if(error.response) throw new HttpException(error.response,error.status)
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async remove(id: number) {
    try {
      const tag = await this.tagRepository.findOneBy({id})
      let errors = []
      if(tag){
        const deleted = await this.tagRepository.delete(id);
        if(deleted.affected){
          return { message: 'Supprimé avec succès.' }
        }
        errors.push({
          field: 'delete',
          message: 'Une erreur inattendue est survenue. Veuillez réessayer plus tard.'
        });
      
        throw new HttpException(
          {
            message: "",
            errors: errors
          },
          HttpStatus.BAD_REQUEST,
        );
        
      }
      throw new HttpException(
        {
          errors: {
            message: 'tag id does not exist'
          }
        },
        HttpStatus.NOT_FOUND,
      );
    } catch (error) {
      if(error.response) throw new HttpException(error.response,error.status)
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

   // Add media to tag
   async uploadMedia(tagId: number, file) {
    try {
      
      const tag = await this.tagRepository.findOne({
        where: {id: tagId},
        relations: ['media']
      });
      if (tag.media) {
        await this.mediaService.removeMedia(tag.media.path);
        const update_mediaDto = {
          filename: file.filename,
          originalname: file.originalname,
          mimeType: file.mimetype,
          path: file.path,
          updatedAt: new Date(),
        };
        return this.mediaService.updateMedia(tag.media.id, update_mediaDto);

      } else {
        const create_mediaDto = {
          moduleId: tagId,
          moduleType: 'TAG',
          type: 'TAG',
          order: 0,
          filename: file.filename,
          originalname: file.originalname,
          mimeType: file.mimetype,
          path: file.path,
        };
        return this.mediaService.createMedia(create_mediaDto.moduleId, create_mediaDto.moduleType, MediaType.Cover, create_mediaDto);
      }
    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

}
