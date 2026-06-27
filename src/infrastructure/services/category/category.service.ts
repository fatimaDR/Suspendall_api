import { HttpException, HttpStatus, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { CreateCategoryDto } from '../../controllers/category/dto/create-category.dto';
import { UpdateCategoryDto } from '../../controllers/category/dto/update-category.dto';
import { In, Repository } from 'typeorm';
import { Category } from 'src/infrastructure/entities/category.entity';
import { CategoryPresenter } from 'src/infrastructure/controllers/category/category.presenter';
import { ValidationError, validate } from 'class-validator';
import { BusinessPresenter } from 'src/infrastructure/controllers/business/business.presenter';
import { Business } from 'src/infrastructure/entities/business.entity';
import { BusinessService } from '../business/business.service';
import { getBusinessDistance } from 'src/functions/functions';
import { MediaService } from '../media/media.service';
import { MediaType } from 'src/infrastructure/entities/media.entity';
import { User } from 'src/infrastructure/entities/user.entity';

@Injectable()
export class CategoryService {

  constructor(
    @Inject('CATEGORY_REPOSITORY')
    private readonly categoryRepository: Repository<Category>,

    @Inject('BUSINESS_REPOSITORY')
    private businessRepository: Repository<Business>,

    @Inject('USER_REPOSITORY') 
    private userRepository: Repository<User>,

    @Inject(forwardRef(() => BusinessService))
    private businessService: BusinessService,
    private mediaService: MediaService,

  ){}

  async create(createCategoryDto: CreateCategoryDto) {
    try{
      const existed = await this.categoryRepository.exist({
        where: {
          name: createCategoryDto.name
        }
      })
      let errors = [];
      
      if(existed){
        errors.push({
          field: 'name',
          message: 'Cet enregistrement existe déjà dans le système.'
        });
      
        throw new HttpException(
          {
            message: "",
            errors: errors
          },
          HttpStatus.BAD_REQUEST,
        );
        // throw new HttpException('Cet enregistrement existe déjà dans le système.', HttpStatus.BAD_REQUEST) 
      }
      const created = await this.categoryRepository.create(createCategoryDto)
      const category = await this.categoryRepository.save(created)
      return {
        data: { category: new CategoryPresenter(category) }
      }
    }catch(error){
      if(error.response) throw new HttpException(error.response,error.status)
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async findAll() {
    try{
      const cats = await this.categoryRepository.find(
        {
          relations: ['subCategories.media', 'media']
        }
      )
      const categories = cats.map( (category) => new CategoryPresenter(category) )
      return { 
        data: {
          categories: categories
        } 
      }
    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findOne(id: number) {
    try{
      const category = await this.categoryRepository.findOne({ 
        where: {
          id
        },
        relations: ['subCategories']
      })
      if(category){
        return { 
          data: { category: new CategoryPresenter(category) }
        }
      }
      throw new HttpException(
        {
          message: 'L’identifiant de la catégorie n’existe pas.'
        },
        HttpStatus.NOT_FOUND,
      );
    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findPopularBusinesses(id: number, query){
    try {
      let businesses = []
      const user = await this.userRepository.findOneBy({id: id})
      // const subCategoryIds = query.subCatgeories;
      const subCategoryIds = query.subCategories;
      let subCatIds: number[] = [];
      if (subCategoryIds) {
        if (typeof subCategoryIds === 'string') {
          subCatIds = subCategoryIds.split(',').map(id => Number(id.trim()));
        } else if (Array.isArray(subCategoryIds)) {
          subCatIds = subCategoryIds.map(Number);
        }
      }

      // businesses = await this.businessRepository.find({
      //   relations: ['user', 'user.media', 'user.city', 'media', 'subCategory', 'feedbacks', 'products.subCategory', 'products.media', 'likes.user'],
      //   where: {
      //     user: {isVerified: true },
      //     isActive: true,
      //     ...(subCatIds.length > 0 && {
      //       subCategory: { id: In(subCatIds) }
      //     })
      //   },
      //   take: query.limit,
      //   skip: query.offset
      // });

      const queryBuilder = this.businessRepository.createQueryBuilder('business')
      .leftJoinAndSelect('business.user', 'user')
      .leftJoinAndSelect('user.media', 'userMedia')
      .leftJoinAndSelect('user.city', 'city')
      .leftJoinAndSelect('business.media', 'media')
      .leftJoinAndSelect('business.subCategory', 'subCategory')
      .leftJoinAndSelect('business.feedbacks', 'feedbacks')
      .leftJoinAndSelect('business.products', 'products')
      .leftJoinAndSelect('products.subCategory', 'productSubCategory')
      .leftJoinAndSelect('products.media', 'productMedia')
      .leftJoinAndSelect('business.likes', 'likes')
      .leftJoinAndSelect('business.openingHours', 'openingHours')
      .leftJoinAndSelect('openingHours.day', 'day')
      .leftJoinAndSelect('likes.user', 'likeUser')
      .where('user.isVerified = true')
      .andWhere('business.isActive = true');

      if (subCatIds.length > 0) {
        queryBuilder.andWhere('subCategory.id IN (:...subCatIds)', { subCatIds });
      }
      const radiusKm = 50;
      const { lat, lng } = query;
      if (lat && lng) {
        queryBuilder.andWhere(`
          6371 * 2 * ASIN(SQRT(
            POWER(SIN(RADIANS(business.latitude - :lat) / 2), 2) +
            COS(RADIANS(:lat)) * COS(RADIANS(business.latitude)) *
            POWER(SIN(RADIANS(business.longitude - :lng) / 2), 2)
          )) <= :radius
        `, { lat, lng, radius: radiusKm });
      }
      
      businesses = await queryBuilder
      .take(query.limit)
      .skip(query.offset)
      .getMany();
      
      let data = []
      let suspendedProducts
      if (businesses) {
        for(const business of businesses){
          let isFavorite = false;
          if (business.likes.length > 0) {
            for (const like of business.likes) {
              if (like.user && like.user.id === user.id) {
                isFavorite = true
                break;
              }
            }
            
          }
          const distance = getBusinessDistance(query, business)
          const feedbacks = await this.businessService.getAverageFeedbacks(business.id)
          if (user.role === 'PROFITABLE') {
            suspendedProducts = await this.businessService.calculateSuspendu(business.id)
          }
          data.push({
            ...new BusinessPresenter(business),
            like: isFavorite,
            distance: distance,
            suspendedProducts: suspendedProducts,
            averageRating: feedbacks,
            price: (business.products.length > 0) ? (business.products.reduce((prev, current) => prev.price < current.price ? prev : current)).price : 0,
          })
          // if (user.role === 'PROFITABLE') {
          //   data.push({
          //     suspededProducts: await this.businessService.calculateSuspendu(business.id)
          //   })
          // }
        }
        data.sort((a, b) => b.feedbacks - a.feedbacks);
        return {
          data: { businesses: data }
        }
      }
      
      
    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }


  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    try{
      const category = await this.categoryRepository.findOneBy({id})
      if(category){
        const updated = await this.categoryRepository.update(id, updateCategoryDto)
        if(updated.affected){
          const updated_category = await this.categoryRepository.findOneBy({id})
          return { 
            data: { category: new CategoryPresenter(updated_category) },
            message: 'Mise à jour effectuée avec succès'
          }
        }else{
          throw new HttpException('Aucune modification apportée.', HttpStatus.NOT_MODIFIED)
        }
        
      }
      throw new HttpException(
        {
          errors: {
            message: 'L’identifiant de la catégorie n’existe pas.'
          }
        },
        HttpStatus.NOT_FOUND,
      );
    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);

      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async remove(id: number) {
    try{
      const category = await this.categoryRepository.findOneBy({id})
      let errors = []
      if(category){
        const deleted = await this.categoryRepository.delete(id);
        
        if(deleted.affected){
          return { message: 'Supprimé avec succès' }
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
        // throw new HttpException('Une erreur inattendue est survenue. Veuillez réessayer plus tard.', HttpStatus.BAD_REQUEST)
      }
      
      throw new HttpException(
        {
          errors: {
            message: 'L’identifiant de la catégorie n’existe pas.'
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
  async uploadMedia(categoryId: number, file) {
    try {
      
      const category = await this.categoryRepository.findOne({
        where: {id: categoryId},
        relations: ['media']
      });
      if (category.media) {
        await this.mediaService.removeMedia(category.media.path);
        const update_mediaDto = {
          filename: file.filename,
          originalname: file.originalname,
          mimeType: file.mimetype,
          path: file.path,
          updatedAt: new Date(),
        };
        return this.mediaService.updateMedia(category.media.id, update_mediaDto);

      } else {
        const create_mediaDto = {
          moduleId: categoryId,
          moduleType: 'CATEGORY',
          type: 'CATEGORY',
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


