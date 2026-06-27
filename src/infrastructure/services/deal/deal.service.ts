import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateDealDto } from '../../controllers/deal/dto/create-deal.dto';
import { UpdateDealDto } from '../../controllers/deal/dto/update-deal.dto';
import { Deal } from 'src/infrastructure/entities/deal.entity';
import { In, Like, MoreThanOrEqual, Repository } from 'typeorm';
import { Product } from 'src/infrastructure/entities/product.entity';
import { Category } from 'src/infrastructure/entities/category.entity';
import { DealPresenter } from 'src/infrastructure/controllers/deal/deal.presenter';
import { MediaService } from '../media/media.service';
import { MediaType } from 'src/infrastructure/entities/media.entity';
import { SubCategory } from 'src/infrastructure/entities/sub-category.entity';

@Injectable()
export class DealService {
  constructor(
    @Inject('DEAL_REPOSITORY') 
    private dealRepository: Repository<Deal>,
    @Inject('PRODUCT_REPOSITORY') 
    private productRepository: Repository<Product>,
    @Inject('SUB_CATEGORY_REPOSITORY') 
    private subCategoryRepository: Repository<SubCategory>,
    private mediaService: MediaService,
  ){}

  async create(createDealDto: CreateDealDto) {
    try {
      createDealDto.moduleType = 'DEAL';
      const createDeal = await this.dealRepository.create(createDealDto)

      const product = await this.productRepository.findOne({
        where: {id: createDealDto.productId},
        relations: ['business']
      })
      console.log(product)
      if (product) {
        createDeal.product = product;
      }else {
        throw new HttpException(
          {
            message: "L’identifiant du produit n’existe pas."
          },
          HttpStatus.NOT_FOUND
        );
      }
      const subCategory = await this.subCategoryRepository.findOneBy({id: createDealDto.categoryId})
      if (subCategory) {
        createDeal.subCategory = subCategory;
      }
      const deal = await this.dealRepository.save(createDeal)
      return { data: 
        { 
          dela: new DealPresenter(deal)
        }
      }

    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findAll(query) {
    try {
      // const category = await this.categoryRepository.findOneBy({id: categoryId})
      const { subCategories, limit, offset , keyword = '' } = query;
      // const subCategoryIds = query.subCategories;
      let whereClause: any = {
        deleted_at: null,
        to: MoreThanOrEqual(new Date()),
        title: Like(`${keyword}%`)
      };
      if (subCategories) {
        whereClause.subCategory = { id: In(subCategories) };
      }
      
      const allDeals = await this.dealRepository.find({
        where: whereClause,
        relations: ['subCategory', 'media', 'product'],
        take: limit,
        skip: offset,
        
      })
      const totalItems = allDeals.length
      const deals = allDeals.map( (deal) => new DealPresenter(deal) )
      return { 
        data: {
          deals: deals,
          totalItems: totalItems
        } 
      }

    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async uploadMedia(dealId: number, file) {
    try {
      
      const deal = await this.dealRepository.findOneBy({
        id: dealId,
      });
      if (deal.media) {
        await this.mediaService.removeMedia(deal.media.path);
        const update_mediaDto = {
          filename: file.filename,
          originalname: file.originalname,
          mimeType: file.mimetype,
          path: file.path,
          updatedAt: new Date(),
        };
        return this.mediaService.updateMedia(deal.media.id, update_mediaDto);
      } else {
        const create_mediaDto = {
          moduleId: dealId,
          moduleType: 'DEAL',
          type: 'DEAL',
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

  async findOne(id: number) {
    try {
      const deal = await this.dealRepository.findOne({
        where: {
          id: id,
          deleted_at: null,
          to: MoreThanOrEqual(new Date()),
        }, 
        relations: ['subCategory', 'media', 'product']
      })
      if (!deal) {
        throw new HttpException(
          {
            errors: {
              message: 'L’identifiant de l’offre n’existe pas.'
            }
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        data: { 
          deal: new DealPresenter(deal) 
        }
      }
    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async update(id: number, updateDealDto: UpdateDealDto) {
    try {
      const deal = await this.dealRepository.findOne({
        where: {
          id: id,
          deleted_at: null,
          to: MoreThanOrEqual(new Date()),
        }, 
      })
      let updated
      if (deal) {
        if (updateDealDto.categoryId) {
          const subCategory = await this.subCategoryRepository.findOneBy({id: updateDealDto.categoryId})
          if (!subCategory) {
            throw new HttpException(
              {
                errors: {
                  message: 'L’identifiant de la sous-catégorie n’existe pas.'
                }
              },
              HttpStatus.NOT_FOUND,
            );
          }
          updated = await this.dealRepository.update(id, {
            subCategory: {id: subCategory.id},
            // updatedAt: new Date()
          });  
        }else if (updateDealDto.productId) {
          const product = await this.productRepository.findOneBy({id: updateDealDto.productId})
          if (!product) {
            throw new HttpException(
              {
                errors: {
                  message: 'L’identifiant du produit n’existe pas.'
                }
              },
              HttpStatus.NOT_FOUND,
            );
          }
          updated = await this.dealRepository.update(id, {
            product: {id: product.id},
            // updatedAt: new Date()
          }); 
        }else {
          updated = await this.dealRepository.update(id, updateDealDto)
        }
        
        if (updated.affected) {
          const dealUpdated = await this.dealRepository.findOneBy({id})
          return {
            data: { deal: new DealPresenter(dealUpdated) },
            message: 'Mise à jour effectuée avec succès.'
          }
        }else {
          throw new HttpException('Aucune modification apportée.', HttpStatus.NOT_MODIFIED)
        }
      }
      throw new HttpException(
        {
          errors: {
            message: 'L’identifiant de l’offre n’existe pas.'
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
    try {
      const deleted = await this.dealRepository.findOne({
        where: {
          id: id,
          deleted_at: null
        }
      })
      console.log(deleted)
      if (deleted) {
        deleted.deleted_at = new Date()
        await this.dealRepository.save(deleted)
        return {
          data: {
            deal: new DealPresenter(deleted)
          },
          message: "L’offre a été supprimée avec succès."
        }
      }
      throw new HttpException(
        {
          errors: {
            message: 'L’identifiant de l’offre n’existe pas.'
          }
        },
        HttpStatus.NOT_FOUND,
      );

    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
