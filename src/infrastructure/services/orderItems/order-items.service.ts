import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateOrderItemDto } from '../../controllers/orderItems/dto/create-order-item.dto';
import { UpdateOrderItemDto } from '../../controllers/orderItems/dto/update-order-item.dto';
import { OrderItem } from 'src/infrastructure/entities/order-item.entity';
import { Repository } from 'typeorm';
import { Product } from 'src/infrastructure/entities/product.entity';
import { Order } from 'src/infrastructure/entities/order.entity';
import { OrderItemPresenter } from 'src/infrastructure/controllers/orderItems/orderItem.presenter';
import { OrderService } from '../order/order.service';
import { Stock } from 'src/infrastructure/entities/stock.entity';
import { User } from 'src/infrastructure/entities/user.entity';
import { Business } from 'src/infrastructure/entities/business.entity';
import { NotificationService } from '../notification/notification.service';
import { Benefactor } from 'src/infrastructure/entities/benefactor.entity';

@Injectable()
export class OrderItemsService {

  constructor(
    @Inject('ORDER_ITEM_REPOSITORY')
    private readonly orderItemRepository: Repository<OrderItem>,
    @Inject('PRODUCT_REPOSITORY') 
    private productRepository: Repository<Product>,
    @Inject('ORDER_REPOSITORY')
    private orderRepository: Repository<Order>,
    @Inject('STOCK_REPOSITORY')
    private stockRepository: Repository<Stock>,
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
    @Inject('BUSINESS_REPOSITORY')
    private businessRepository: Repository<Business>,
    private notificationService: NotificationService,
    private readonly orderService: OrderService,

    @Inject('BENEFACTOR_REPOSITORY')
    private benefactorRepository: Repository<Benefactor>,

  ) {}
  
  // async create(createOrderItemDto: CreateOrderItemDto, userId: number) {
  //   try {
  //     let product, totalAmount, order, orderItem;
  //     let orders = []
  //     const user = await this.userRepository.findOneBy({ id: userId});

  //     const benefactor = await this.benefactorRepository.findOne({
  //       where: {id: user.benefactor.id},
  //       relations: ['orders']
  //     });
  //     if (user && benefactor) {
  //       if (createOrderItemDto.productId) {
  //         product = await this.productRepository.findOneBy({id: createOrderItemDto.productId})
  //         orderItem = await this.orderItemRepository.createQueryBuilder('orderItem')
  //           .leftJoinAndSelect('orderItem.product', 'product')
  //           .where('product.id = :productId', { productId: product.id })
  //           .getOne();
  //         if(orderItem){
  //           orderItem.quantity += createOrderItemDto.quantity
  //           totalAmount = product.price * createOrderItemDto.quantity;
  //           const totalPrice = product.price * orderItem.quantity 
  //           orderItem.productPrice = totalPrice;
  //           await this.orderItemRepository.update(orderItem.id, {quantity: orderItem.quantity})
  //         }else {
  //           orderItem = await this.orderItemRepository.create(createOrderItemDto);
  //           totalAmount = product.price * orderItem.quantity;
  //           orderItem.product = product
  //           orderItem.productPrice = totalAmount;
  //         }
  //         orders = benefactor.orders
  //         if (orders.length > 0) {
  //           for (const element of orders) {
  //             if (element.payed == false  && element.benefactor.id == benefactor.id) {
  //               order = element
  //               if (order) {
  //                 orderItem.order = order;
  //                 order.sousTotal += totalAmount;
  //                 order.total += totalAmount
  //               }else {
  //                 const orderData = {
  //                   sousTotal: totalAmount ,
  //                   total: totalAmount,
  //                   payed: false,
  //                   userId: userId
  //                 }
  //                 order = await this.orderRepository.create(orderData); 
  //                 order.benefactor = benefactor;
  //                 // order.total += order.lbs
  //                 orderItem.order = order;
  //               }
  //             } 
  //           }
  //         }else{
  //           const orderData = {
  //             sousTotal: totalAmount ,
  //             total: totalAmount,
  //             payed: false,
  //             userId: userId
  //           }
  //           order = await this.orderRepository.create(orderData); 
  //           order.benefactor = benefactor;
  //           // order.total += order.lbs
  //           orderItem.order = order;
  //         }
          
  //         // if (createOrderItemDto.orderId) {
  //           // order = await this.orderRepository.findOneBy({id: createOrderItemDto.orderId})
        
  //         // }else {
  //         //   const orderData = {
  //         //     sousTotal: totalAmount ,
  //         //     total: totalAmount,
  //         //     // tva: 20,
  //         //     // stripe: null,
  //         //     // lbs: null,
  //         //     payed: false,
  //         //     userId: userId
  //         //   }
  //         //   order = await this.orderRepository.create(orderData); 
  //         //   order.benefactor = benefactor;
  //         //   // order.total += order.lbs
  //         //   orderItem.order = order;
  //         // }
          
  //       }
  //       await this.orderRepository.save(order);
  //       // let productSuspendu = 0
  //       // if(orderItem.quantity > 1){
  //       //   productSuspendu = createOrderItemDto.suspendu 
  //       //   const suspendu = await this.stockRepository.createQueryBuilder('suspendu')
  //       //     .leftJoinAndSelect('suspendu.product', 'product')
  //       //     .where('product.id = :productId', { productId: product.id })
  //       //     .getOne();

  //       //   const business = await this.businessRepository.findOneBy({id: product.business})
  //       //   const data = {
  //       //     quantity: createOrderItemDto.suspendu,
  //       //     product: product,
  //       //     business: business,
  //       //     benefactor: benefactor
  //       // }
  //       //   if (!suspendu) {
  //       //     const createSuspendu = await this.stockRepository.create(data)
  //       //     await this.stockRepository.save(createSuspendu)

  //       //   }else {
  //       //     suspendu.quantity += data.quantity
  //       //     await this.stockRepository.update(suspendu.id, {quantity: suspendu.quantity})
  //       //     // send notification to benefactor to confirm don suspendall
  //       //     await this.notificationService.sendNotifMessage(user.id, user.id, user, 'DonationConfirmation', `Votre don de ${productSuspendu} repas a été traité avec succès`)
  //       //   }
          
  //       // }
  //       const orderItemSaved =  await this.orderItemRepository.save(orderItem)
  //       if(orderItemSaved) {
  //         return { data: { orderItem: new OrderItemPresenter(orderItemSaved)}}
  //       }
  //     }  
  //   } catch (error) {
  //     if(error.response) throw new HttpException(error.response, error.status)
  //     throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
  //   }
  // }

  async create(cart, user) {
    
    const items = cart.items;
    let business;
    let totalAmount = 0;
    let productsSuspendu = 0; 
    let orderDetails = [];
    

    for (let item of items) {
      business = await this.businessRepository.findOneBy({id: cart.businessId})
      const product = await this.productRepository.findOne({
        where: { id: item.productId },
        relations: ['tags']
      });
  
      const subTotal = product.price * item.quantity;
      totalAmount += subTotal;
      productsSuspendu += item.quantity;

      const data = {
        quantity: item.quantity,
        productPrice: product.price,
        product: product,
        total: subTotal,
      };
      
      const createOrder = this.orderItemRepository.create(data);
      // const order = await this.orderItemRepository.save(createOrder);
      orderDetails.push(createOrder);
    }

    return {
      orderDetails,
      totalAmount,
      business
    }
}

  findAll() {
    return `This action returns all orderItems`;
  }

  findOne(id: number) {
    return `This action returns a #${id} orderItem`;
  }

  update(id: number, updateOrderItemDto: UpdateOrderItemDto) {
    return `This action updates a #${id} orderItem`;
  }

  remove(id: number) {
    return `This action removes a #${id} orderItem`;
  }
}
