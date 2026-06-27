import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateSubCategoryDto } from 'src/infrastructure/controllers/sub-category/dto/create-sub-category.dto';
import { UpdateSubCategoryDto } from 'src/infrastructure/controllers/sub-category/dto/update-sub-category.dto';
import { SubCategoryPresenter } from 'src/infrastructure/controllers/sub-category/sub-category.presenter';
import { Business } from 'src/infrastructure/entities/business.entity';
import { SubCategory } from 'src/infrastructure/entities/sub-category.entity';
import { Like, Repository } from 'typeorm';
import { MediaService } from '../media/media.service';
import { MediaType } from 'src/infrastructure/entities/media.entity';
import { Category } from 'src/infrastructure/entities/category.entity';


@Injectable()
export class SubCategoryService {

  constructor(
    @Inject('SUB_CATEGORY_REPOSITORY')
    private readonly subCategoryRepository: Repository<SubCategory>,

    @Inject('CATEGORY_REPOSITORY')
    private readonly categoryRepository: Repository<Category>,

    private mediaService: MediaService,

  ){}

  async create(createSubCategoryDto: CreateSubCategoryDto) {
    try{

      const category = await this.categoryRepository.findOne({ where: { id: createSubCategoryDto.category }})
      console.log(category)
      if(!category){
        throw new HttpException(
          {
            message: 'Catégorie introuvable'
          },
        HttpStatus.NOT_FOUND,
        );
      }
      // const created = await this.subCategoryRepository.create(createSubCategoryDto)
      const created = this.subCategoryRepository.create({
        name: createSubCategoryDto.name,
        category: category, 
      });
      created.category = category
      const subCategory = await this.subCategoryRepository.save(created)
      return {
        data: { subCategory: new SubCategoryPresenter(subCategory) }
      }
    }catch(error){
      if(error.response) throw new HttpException(error.response,error.status)
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async findAll(query) {
    try{
      const { limit, offset, keyword = ''} = query;
      const subCats = await this.subCategoryRepository.find(
        {
          where: {
            name: Like(`${keyword}%`),
          },
          relations: ['category', 'media'],
          take: limit,
          skip: offset,
        }
      )
      const totalItems = subCats.length
      const subCategories = subCats.map( (subCategory) => new SubCategoryPresenter(subCategory) )
      return { 
        data: {
          subCategories: subCategories,
          totalItems: totalItems
        } 
      }
    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findOne(id: number) {
    try{
      const subCategory = await this.subCategoryRepository.findOne({ 
        where: {
          id
        },
        relations: ['category']
      })
      if(subCategory){
        return { 
          data: { subCategory: new SubCategoryPresenter(subCategory) }
        }
      }
      throw new HttpException(
        {
          message: 'sub category id does not exist'
        },
        HttpStatus.NOT_FOUND,
      );
    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async update(id: number, updateSubCategoryDto: UpdateSubCategoryDto) {
    try{
      const subCategory = await this.subCategoryRepository.findOne({ 
        where: {
          id
        },
        relations: ['category']
      })

      if (!subCategory) {
        throw new HttpException(
          { message: 'La sous-catégorie est introuvable' },
          HttpStatus.NOT_FOUND,
        );
      }
      let category
      const data: Partial<SubCategory> = {};

      if (updateSubCategoryDto.name) {
        data.name = updateSubCategoryDto.name;
      }

      if (updateSubCategoryDto.category) {
        const category = await this.categoryRepository.findOne({
          where: { id: updateSubCategoryDto.category },
        });

        if (!category) {
          throw new HttpException(
            { message: 'Catégorie invalide' },
            HttpStatus.BAD_REQUEST,
          );
        }

        data.category = category;
      }

      const updated = await this.subCategoryRepository.update(id, data)
      if(updated.affected){
        const updatedSubCategory = await this.subCategoryRepository.findOneBy({id})
        return { 
          data: { subCategory: new SubCategoryPresenter(updatedSubCategory) },
          message: 'Mise à jour effectuée avec succès'
        }
      }else{
        throw new HttpException('Aucune modification apportée.', HttpStatus.NOT_MODIFIED)
      }
      
    } catch (error) {
        if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async remove(id: number) {
    try{
      const subCategory = await this.subCategoryRepository.findOneBy({id})
      let errors = []
      if(subCategory){
        const deleted = await this.subCategoryRepository.delete(id);
        
        if(deleted.affected){
          return { message: 'Supprimé avec succès.' }
        }
        errors.push({
          field: '',
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
            message: 'sub category id does not exist'
          }
        },
        HttpStatus.NOT_FOUND,
      );

    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // Add media to categry
  async uploadMedia(subCategoryId: number, file) {
    try {
      
      const subCategory = await this.subCategoryRepository.findOneBy({
        id: subCategoryId,
      });

      if (subCategory.media) {
        await this.mediaService.removeMedia(subCategory.media.path);
        const update_mediaDto = {
          filename: file.filename,
          originalname: file.originalname,
          mimeType: file.mimetype,
          path: file.path,
          updatedAt: new Date(),
        };
        return this.mediaService.updateMedia(subCategory.media.id, update_mediaDto);

      } else {
        const create_mediaDto = {
          moduleId: subCategoryId,
          moduleType: 'SUBCATEGORY',
          type: 'SUBCATEGORY',
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
