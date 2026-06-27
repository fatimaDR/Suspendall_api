import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BUSINES_REQUEST } from 'src/functions/businessRequest.enum';
import { CreateProductLimitRequestDto } from 'src/infrastructure/controllers/productLimitRequest/dto/create-product-limit-request.dto';
import { UpdateProductLimitRequestDto } from 'src/infrastructure/controllers/productLimitRequest/dto/update-product-limit-request.dto';
import { Business } from 'src/infrastructure/entities/business.entity';
import { ProductLimitRequest } from 'src/infrastructure/entities/product-limit-request.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductLimitRequestService {
  
  constructor(
    @Inject('PRODUCT_LIMIT_REQUEST_REPOSITORY')
    private productLimitReqRepository: Repository<ProductLimitRequest>,

    @Inject('BUSINESS_REPOSITORY')
    private businessRepository: Repository<Business>,
  ){}

  async requestProductLimit(userId: number, createProductLimitRequestDto: CreateProductLimitRequestDto) {

    try {
      const business = await this.businessRepository.findOne({
        where: { user: { id: userId } },
      });

      if (!business) {
        throw new HttpException('Le commerce introuvable', HttpStatus.NOT_FOUND);
      }

      const existingPending = await this.productLimitReqRepository.findOne({
        where: { business: { id: business.id }, status: BUSINES_REQUEST.Pending },
      });

      if (existingPending) {
        throw new HttpException(
          'Une demande est déjà en attente de validation.',
          HttpStatus.CONFLICT,
        );
      }

      const request = this.productLimitReqRepository.create({
        business,
        message: createProductLimitRequestDto.message,
      });

      await this.productLimitReqRepository.save(request);

      return {
        message: "Votre demande a été envoyée à l'administrateur.",
        data: request,
      };
    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
    
  }

  findAll() {
    return `This action returns all productLimitRequest`;
  }

  findOne(id: number) {
    return `This action returns a #${id} productLimitRequest`;
  }

  update(id: number, updateProductLimitRequestDto: UpdateProductLimitRequestDto) {
    return `This action updates a #${id} productLimitRequest`;
  }

  remove(id: number) {
    return `This action removes a #${id} productLimitRequest`;
  }
}
