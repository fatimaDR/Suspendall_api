import { Inject, Injectable } from '@nestjs/common';
import { CreateStockDto } from '../../controllers/stock/dto/create-stock.dto';
import { UpdateStockDto } from '../../controllers/stock/dto/update-stock.dto';
import { Product } from 'src/infrastructure/entities/product.entity';
import { Repository } from 'typeorm';
import { Stock } from 'src/infrastructure/entities/stock.entity';
import { Business } from 'src/infrastructure/entities/business.entity';
import { Benefactor } from 'src/infrastructure/entities/benefactor.entity';
import { Order } from 'src/infrastructure/entities/order.entity';

@Injectable()
export class StockService {

  constructor(
    
    @Inject('PRODUCT_REPOSITORY') 
    private productRepository: Repository<Product>,

    @Inject('STOCK_REPOSITORY')
    private stockRepository: Repository<Stock>,

    @Inject('BUSINESS_REPOSITORY')
    private businessRepository: Repository<Business>,

    @Inject('BENEFACTOR_REPOSITORY')
    private benefactorRepository: Repository<Benefactor>,

  ) {}
  
  async create(user, orderItems) {

    let createdStocks = []
    const benefactor = await this.benefactorRepository.findOneBy({id: user.benefactor.id});
    // const business = await this.businessRepository.findOneBy({id: orderItems.businessId})
    for(let item of orderItems){
      
      const data = {
        quantity: item.quantity,
        productPrice: item.productPrice,
        product: item.product,
        business: item.business,
        benefactor: benefactor,
        total: item.total,
      }
      const createSuspendu = await this.stockRepository.create(data)
      createdStocks.push(createSuspendu);
    }
    return createdStocks 
  }

  findAll() {
    return `This action returns all stock`;
  }

  findOne(id: number) {
    return `This action returns a #${id} stock`;
  }

  update(id: number, updateStockDto: UpdateStockDto) {
    return `This action updates a #${id} stock`;
  }

  remove(id: number) {
    return `This action removes a #${id} stock`;
  }
}
