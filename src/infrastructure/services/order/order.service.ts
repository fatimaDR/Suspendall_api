import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateOrderDto } from '../../controllers/oder/dto/create-order.dto';
import { UpdateOrderDto } from '../../controllers/oder/dto/update-order.dto';
import { Order } from 'src/infrastructure/entities/order.entity';
import { Repository } from 'typeorm';
import { Benefactor } from 'src/infrastructure/entities/benefactor.entity';
import { User } from 'src/infrastructure/entities/user.entity';
import { OrderPresenter } from 'src/infrastructure/controllers/oder/order.presenter';
import { Business } from 'src/infrastructure/entities/business.entity';
import { Product } from 'src/infrastructure/entities/product.entity';
import { OrderOfBusinessPresenter } from 'src/infrastructure/controllers/oder/orderOfBusiness.presenter';

@Injectable()
export class OrderService {

  constructor(
    @Inject('ORDER_REPOSITORY')
    private readonly orderRepository: Repository<Order>,

    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,

    @Inject('BUSINESS_REPOSITORY')
    private businessRepository: Repository<Business>,

    @Inject('BENEFACTOR_REPOSITORY')
    private benefactorRepository: Repository<Benefactor>,

    @Inject('PRODUCT_REPOSITORY') 
        private productRepository: Repository<Product>,
    
  ){}

  // async addDonLbs(userId: number, orderId: number, donlbs){
  //   try {
  //     const user = await this.userRepository.findOneBy({id: orderId})
      
  //     if (user) {
  //       const order = await this.orderRepository.findOneBy({id: orderId})
  //       order.lbs = donlbs
  //       order.total += donlbs
  //       const oraderUpdated = await this.orderRepository.update(order.id, {lbs:  order.lbs, total: order.total})
  //       if (oraderUpdated) {
  //         return true
  //       }
  //       return false
  //     }
  //     throw new HttpException(
  //       {
  //         errors: {
  //           message: 'L’identifiant de l’utilisateur n’existe pas.'
  //         }
  //       },
  //       HttpStatus.NOT_FOUND,
  //     );  
  //   } catch (error) {
  //     if(error.response) throw new HttpException(error.response, error.status)
  //     throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
  //   }
  // }


  async create(createOrderDto) {
    try {

      const user = await this.userRepository.findOneBy({ id: createOrderDto.benefactorId});

      const orderData = {
        subTotal: createOrderDto.subTotal, 
        total: createOrderDto.total,
        status: "",
        createdAt: new Date(),
        benefactor: createOrderDto.benefactor
      }

      if (!user) {
        throw new HttpException(
          {
            message: "Utilisateur introuvable."
          },
          HttpStatus.NOT_FOUND
        );
      }

      const orderCreated = await this.orderRepository.create(orderData);
      // orderCreated.benefactor = benefactor;
      // const order = await this.orderRepository.save(orderCreated);
      return  orderCreated;

    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findAll(userId: number) {
    try {
      let orders = []
      const user = await this.userRepository.findOneBy({id: userId})
      if (user) {
        orders = await this.orderRepository.createQueryBuilder('order')
          .leftJoinAndSelect('order.orderItems', 'orderItems')
          .leftJoinAndSelect('order.benefactor', 'benefactor')
          .leftJoinAndSelect('benefactor.user', 'user')
          .leftJoinAndSelect('order.payment', 'payment')
          // .leftJoinAndSelect('order.stocks', 'stocks')
          // .leftJoinAndSelect('stocks.business', 'businesses')
          .leftJoinAndSelect('orderItems.business', 'businesses')
          .leftJoinAndSelect('businesses.media', 'businessesMedia')
          .leftJoinAndSelect('businesses.feedbacks', 'feedbacks')
          .leftJoinAndSelect('businesses.likes', 'likes')
          // .leftJoinAndSelect('stocks.product', 'products')
          .leftJoinAndSelect('orderItems.product', 'products')
          .leftJoinAndSelect('products.subCategory', 'subCategory')
          .leftJoinAndSelect('subCategory.category', 'category')
          .leftJoinAndSelect('products.media', 'productsMedia')
          .where('benefactor.id = :benefactorId', { benefactorId: user.benefactor.id })
          .orderBy('order.createdAt', 'DESC')
          .getMany();
          
        return {
          // data: { orders: orders.map((order) => new OrderPresenter(order) )  }
          data: { orders: orders.map((order) => new OrderOfBusinessPresenter(order) )  }
        }
      }

      throw new HttpException(
        {
          errors: {
            message: 'L’identifiant de l’utilisateur n’existe pas.'
          }
        },
        HttpStatus.NOT_FOUND,
      );  
      
    } catch (error) {
      if(error.response) throw new HttpException(error.response, error.status)
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async findOne(id: number, userId) {
    try {
      let errors = []
      const order = await this.orderRepository.findOne({
        where: { id: id},
        relations: ['orderItems', 'stocks.business']
      });
      
      if (!order) {
        throw new HttpException(
          {
            errors: {
              message: 'L’identifiant de la commande n’existe pas.'
            }
          },
          HttpStatus.NOT_FOUND,
        );  
      }
      const user = await this.userRepository.findOneBy({id: userId})
      
      if (user && (user.benefactor.id === order.benefactor.id)) {
        return {
          data: { order: new OrderPresenter(order)}
        }
      }else {
        errors.push({
        field: 'benefactoer id',
        message:  "order's benefactor wrong"
        });
        
        throw new HttpException(
          {
            message: "",
            errors: errors
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      
    } catch (error) {
      if(error.response) throw new HttpException(error.response, error.status)
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `Cette action met à jour la commande n°${id}.`;
  }

  remove(id: number) {
    return `Cette action supprime la commande n°${id}.`;
  }
}
