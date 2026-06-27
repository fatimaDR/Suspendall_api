import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ProductMaraude } from 'src/infrastructure/entities/productMaraude.entity';
import { Association } from 'src/infrastructure/entities/association.entity';
import { Repository } from 'typeorm';


@Injectable()
export class ProductMaraudeService {
  constructor(
    @Inject('PRODUCT_MARAUDE_REPOSITORY') 
    private productMaraudeRepository: Repository<ProductMaraude>,
  ){}

  
}
