import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateProductDto } from '../../controllers/product/dto/create-product.dto';
import { UpdateProductDto } from '../../controllers/product/dto/update-product.dto';
import { Repository } from 'typeorm';
import { Product } from 'src/infrastructure/entities/product.entity';
import { ProductPresenter } from 'src/infrastructure/controllers/product/products.presenter';
import { MediaService } from '../media/media.service';
import { MediaType } from 'src/infrastructure/entities/media.entity';
import { SubCategory } from 'src/infrastructure/entities/sub-category.entity';

@Injectable()
export class ProductService {

  constructor(
    @Inject('PRODUCT_REPOSITORY') 
    private productRepository: Repository<Product>,
    @Inject('SUB_CATEGORY_REPOSITORY') 
    private subCategoryRepository: Repository<SubCategory>,
    private mediaService: MediaService,
  ){}

  create(createProductDto: CreateProductDto) {
    return 'This action adds a new product';
  }

  // async findAll(businessId: number, offset: number, limit: number) {
  //   try {
  //     const products = await this.productRepository.find({
  //       relations: ['business', 'subCategory', 'tags'],
  //       where: {
  //         business: { id: businessId, isActive: true } ,
  //         available: true
  //       },
  //       take: limit,
  //       skip: offset,
  //     });

  //     if (products) {
  //       return {
  //         data: {
  //           products: products.map( (product) => new ProductPresenter(product) )
  //         }
  //       }
  //     }
  //     throw new HttpException(
  //       {
  //         message: "products not found"
  //       },
  //       HttpStatus.NOT_FOUND);

  //   } catch (error) {
  //     if (error.response) throw new HttpException(error.response, error.status);
  //     throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
  //   }
  // }

  async findOne(id: number) {
    try {
      const product =  await this.productRepository.findOne({
        where: { id: id },
        relations: ['subCategory', 'business', 'tags']
      });
      if (!product) {
        throw new HttpException(
          {
            message: "product id not found"
          },
          HttpStatus.NOT_FOUND);
      }

      return {
        data: {
          product: new ProductPresenter(product),
        }
      }
    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
    
  }

  // async update(id: number, updateProductDto: UpdateProductDto, userId) {
  //   try {
  //     const product = await this.productRepository.findOne({
  //       where: { 
  //         id: id, 
  //         business: { user: { id:  userId }, isActive: true },
  //         available: true
  //       }
  //     });

  //     if (product) {
  //       await this.productRepository.update(id, updateProductDto);
  //       const productUpdated = await this.productRepository.findOne({
  //         where: {id: id},
  //         relations: ['subCategory.category']
  //       })
  //       return {
  //         data: {
  //           product: new ProductPresenter(productUpdated),
  //         },
  //         message: "product has been successfully modified"
  //       }
  //     }
      
  //     throw new HttpException(
  //       {
  //         message: "product id not found"
  //       },
  //       HttpStatus.NOT_FOUND
  //     );

  //   } catch (error) {
  //     if (error.response) throw new HttpException(error.response, error.status);
  //     throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
  //   }
  // }

  async update(id: number, updateProductDto: UpdateProductDto, userId: number) {
  try {
    const product = await this.productRepository.findOne({
      where: {
        id,
        business: { user: { id: userId }, isActive: true },
        available: true,
      },
    });

    if (!product) {
      throw new HttpException(
        { message: 'product id not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    // Gérer la sous-catégorie si elle est présente
    let subCategory ;
    if (updateProductDto.subCategory) {
      subCategory = await this.subCategoryRepository.findOne({
        where: { id: updateProductDto.subCategory },
      });
      if (!subCategory) {
        throw new HttpException(
          { message: 'subCategory not found' },
          HttpStatus.NOT_FOUND,
        );
      }
    }
    const updatedData: any = {
      ...updateProductDto,
    };

    if (subCategory) {
      updatedData.subCategory = subCategory;
    }

    await this.productRepository.update(id, updatedData);

    const productUpdated = await this.productRepository.findOne({
      where: { id },
      relations: ['subCategory.category'],
    });

    return {
      data: {
        product: new ProductPresenter(productUpdated),
      },
      message: 'product has been successfully modified',
    };
    
    } catch (error) {
      if (error.response) {
        throw new HttpException(error.response, error.status);
      }
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }


  async remove(id: number, userId) {
    try {
      // const product = await this.productRepository.findOneBy({id});
      const product = await this.productRepository.findOne({
        where: { 
          id: id, 
          business: { user: { id:  userId }, isActive: true },
          available: true
        }
      });
      if (product) {
        await this.productRepository.delete(id);
        return { message: `product id: ${id} has been successfully deleted` }
      }
      
      throw new HttpException(
        {
          code: HttpStatus.NOT_FOUND,
          message: `product id: ${id} not found`
        },
        HttpStatus.NOT_FOUND
      );

    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async uploadMedia(productId: number, file) {
    try {
      
      const product = await this.productRepository.findOneBy({
        id: productId,
      });
      if (product.media) {
        await this.mediaService.removeMedia(product.media.path);
        const update_mediaDto = {
          filename: file.filename,
          originalname: file.originalname,
          mimeType: file.mimetype,
          path: file.path,
          updatedAt: new Date(),
        };
        return this.mediaService.updateMedia(product.media.id, update_mediaDto);
      } else {
        const create_mediaDto = {
          moduleId: productId,
          moduleType: 'PRODUCT',
          type: 'PRODUCT',
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
