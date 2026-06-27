import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { addDays } from 'date-fns';
import { BUSINES_REQUEST } from 'src/functions/businessRequest.enum';
import { BusinessAdminPresenter } from 'src/infrastructure/controllers/admin/business.admin.presenter';
import { BusinessPresenter } from 'src/infrastructure/controllers/business/business.presenter';
import { UserPresenter } from 'src/infrastructure/controllers/user/user.presenter';
import { Business } from 'src/infrastructure/entities/business.entity';
import { Deal } from 'src/infrastructure/entities/deal.entity';
import { Order } from 'src/infrastructure/entities/order.entity';
import { ProductLimitRequest } from 'src/infrastructure/entities/product-limit-request.entity';
import { Stock } from 'src/infrastructure/entities/stock.entity';
import { User } from 'src/infrastructure/entities/user.entity';
import { Between, ILike, IsNull, LessThan, Like, MoreThanOrEqual, Not, Repository } from 'typeorm';


@Injectable()
export class AdminService {

  constructor(
    @Inject('BUSINESS_REPOSITORY')
    private businessRepository: Repository<Business>,
    @Inject('USER_REPOSITORY') 
    private userRepository: Repository<User>,
    @Inject('STOCK_REPOSITORY')
    private stockRepository: Repository<Stock>,
    @Inject('DEAL_REPOSITORY') 
    private dealRepository: Repository<Deal>,
    @Inject('ORDER_REPOSITORY')
    private readonly orderRepository: Repository<Order>,
    @Inject('PRODUCT_LIMIT_REQUEST_REPOSITORY')
    private productLimitReqRepository: Repository<ProductLimitRequest>,
    
  ){}
  
  async getDetailAdmin(id: number){
    try{
      const user = await this.userRepository.findOne({
        where: {id: id},
        relations: ['media']
      })

      if(user.role == "ADMIN"){
        return {
          data: { user: new UserPresenter(user) }
        }
      }  
      throw new HttpException(
        {
          message: "Administrateur introuvable."
        },
        HttpStatus.NOT_FOUND
      );

    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // async findAllBusinesses(query){
  //   try {
  //     const { limit, offset, keyword = ''} = query;
  //     const businesses = await this.businessRepository.find({
  //         where: {
  //           user: Not(IsNull()),
  //           name: Like(`${keyword}%`),
  //         },
  //         relations: ['user'],
  //         take: limit,
  //         skip: offset,
  //       },
  //     )
  //     if (businesses) {
  //       const totalItems = businesses.length
  //       return {
  //         data: { 
  //           businesses: businesses,  
  //           totalItems: totalItems
  //         }
  //       }
  //     }
  //   } catch (error) {
  //     if (error.response) throw new HttpException(error.response, error.status);
  //     throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
  //   }

  // }

  async findAllBusinesses(query) {
    try {
      const { limit = 10, offset = 0, keyword = '' } = query;

      const queryBuilder = this.businessRepository.createQueryBuilder('business')
        .leftJoinAndSelect('business.user', 'user')
        .where('business.user IS NOT NULL');

      if (keyword) {
        queryBuilder.andWhere('business.name LIKE :keyword', { keyword: `${keyword}%` });
      }

      queryBuilder
      .orderBy('business.id', 'DESC') 
      .skip(offset)
      .take(limit);

      const [businesses, totalItems] = await queryBuilder.getManyAndCount();

      return {
        data: {
          businesses: businesses,  
          totalItems: totalItems
        }
      };
    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }


  async sampleBusiesses(){
    try {
      const businesses = await this.businessRepository.find({
        where: {
          isActive: true
        },
        relations: ['products']
      })
      if (businesses) {
        const totalItems = businesses.length
        return {
          data: { businesses: businesses.map((business) => new BusinessAdminPresenter(business)),  totalItems: totalItems}
        }
      }
    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async userActiveted(userId: number) {
    try {
      
      const user = await this.userRepository.findOneBy({id: userId});
      
      if (!user) {
        throw new HttpException(
          {
            message: 'L’identifiant utilisateur n’existe pas.'
          },
          HttpStatus.NOT_FOUND,
        );
      }
      let message = "";
      if (user.isActive == false) {
        
        user.isActive = true;
        await this.userRepository.save(user)
        message =  "L\'utilisateur a été activé avec succès." ;
      }else {
        user.isActive = false;
        await this.userRepository.save(user)
        message = "L\'utilisateur a été désactivé avec succès." ;
      }
      
      return {
        message: message,
        data: { business: new UserPresenter(user) }
      }

    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async dashboardByAdmin() {
    try {
      const stocks = await this.stockRepository.find();
      const currentDate = new Date();
      const oneWeekAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(currentDate.getTime() - 14 * 24 * 60 * 60 * 1000);

      const oneMonthAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate());
      const twoMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, currentDate.getDate());

      let totalWeekPrice = 0;
      let lastWeekPrice = 0;
      let totalMonthPrice = 0;
      let lastMonthPrice = 0;
      let totlaPrice = 0;

      for(let stock of stocks){
          
        if (stock.createdAt >= oneWeekAgo) {
          totalWeekPrice += stock.quantity * stock.productPrice;
        } else if (stock.createdAt >= twoWeeksAgo && stock.createdAt < oneWeekAgo) {
          lastWeekPrice += stock.quantity * stock.productPrice;
        }

        if (stock.createdAt >= oneMonthAgo) {
          totalMonthPrice += stock.quantity * stock.productPrice;
        } else if (stock.createdAt >= twoMonthsAgo && stock.createdAt < oneMonthAgo) {
          lastMonthPrice += stock.quantity * stock.productPrice;
        }
  

        totlaPrice+= stock.quantity * stock.productPrice;
      }
      return {data: {
        revenue: { 
          currentWeek: totalWeekPrice,
          lastWeek: lastWeekPrice,
          currentMonth: totalMonthPrice,
          lastMonth: lastMonthPrice,
          totalAmount: totlaPrice,
        }  
      }
      };
        
    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async chartsByAdmin(query?){
    try {
      const {startDate, endDate} = query
      const dateFilter = startDate && endDate ? Between(startDate, endDate) : undefined;
      const activeUsers = await this.userRepository.count({
        where: { 
          isActive: true,
          createdAt: dateFilter
         }
      })
      const inactiveUsers = await this.userRepository.count({
        where: { 
          isActive: false,
          createdAt: dateFilter 
        }
      })
      const activeBusinesses = await this.businessRepository.count({
        where: { 
          isActive: true,
          user: { createdAt: dateFilter }
        },
        relations: ['user']
      })
      
      const inactiveBusinesses = await this.businessRepository.count({
        where: { 
          isActive: false,
          user: { createdAt: dateFilter }
        },
        relations: ['user']
      })
      const activeDeals = await this.dealRepository.count({
        where: {
          deleted_at: null,
          to: MoreThanOrEqual(new Date()),
          createdAt: dateFilter
        }
      })
      const inactiveDeals = await this.dealRepository.count({
        where: {
          deleted_at: null,
          to: LessThan(new Date()),
          createdAt: dateFilter
        }
      })
      return {
        data: {
          users: { active: activeUsers, inactive: inactiveUsers },
          businesses: { active: activeBusinesses, inactive: inactiveBusinesses },
          deals: {active: activeDeals, inactive: inactiveDeals}
        }
      }
    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async statistics(query?){
    try {
      const {startDate, endDate} = query
      const dateFilter = startDate && endDate ? Between(startDate, addDays(new Date(endDate), 1)) : undefined;
      const deals = await this.dealRepository.find({
        where: {
          deleted_at: null,
          createdAt: dateFilter
        }
      })
      const orders = await this.orderRepository.find({
        where: {
          createdAt: dateFilter
        }
      });

      const groupedDeals = deals.reduce((acc, deal) => {
        const date = deal.createdAt.toISOString().split('T')[0]; 

        if (!acc[date]) {
          acc[date] = { date, count: 0 };
        }
        acc[date].count++;
        return acc;
      }, {});

      const groupedRevenues = orders.reduce((acc, order) => {
        const date = order.createdAt.toISOString().split('T')[0]; 
        let total = 0
        total += order.subTotal
        if (!acc[date]) {
          
          acc[date] = { date, total:  total};
        }
        
        return acc;
      }, {});

      const statistics = Object.values(groupedDeals);
      const revenues = Object.values(groupedRevenues);
      return {
        statistics: {
          deals: statistics,
          revenues: revenues
        }
      }
    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // Augmente limit de produit pour un business
  async updateProductLimit(businessId: number, newLimit: number) {
    try {
      const business = await this.businessRepository.findOne({
        where: { id: businessId },
      });

      if (!business) {
        throw new HttpException(
          {
            errors: {
              message: 'Aucun établissement trouvé.'
            }
          },
          HttpStatus.NOT_FOUND,
        );
      }
      // business.productLimit = newLimit;

      const updated = await this.businessRepository.save(business);

      return {
        message: 'La limite du produit a été mise à jour avec succès.',
        data: new BusinessPresenter(updated),
      }
    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} admin`;
  }

  async handleBusinessRequest(id: number, approve: boolean) {
    const request = await this.productLimitReqRepository.findOne({
      where: { id },
      relations: ['business'],
    });

    if (!request) {
      throw new HttpException('Request introuvable', HttpStatus.NOT_FOUND);
    }

    if (request.status !== 'pending') {
      throw new HttpException('Cette demande a déjà été traitée.', HttpStatus.BAD_REQUEST);
    }

    request.status = approve ? BUSINES_REQUEST.Approved : BUSINES_REQUEST.Rejected;
    await this.productLimitReqRepository.save(request);

    if (approve) {
      request.business.isProductLimited = false;
      await this.businessRepository.save(request.business);
    }

    return {
      message: `Demande ${approve ? 'approuvée' : 'rejetée'} avec succès.`,
    };
  }

  async BusinessRequetList(query){
    try {
      const { limit, offset, status } = query;

      const where: any = {};
      if (status) {
        where.status = status;
      }

      const productLimitsReq = await this.productLimitReqRepository.find({
        where,
        take: limit,
        skip: offset,
        relations: ['business']
      })
      const totalItems = productLimitsReq.length
      const productLimits = productLimitsReq.map( (productLimmit) => productLimmit) 
      return { 
        data: {
          product_limits: productLimits,
          totalItems: totalItems
        } 
      }

    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

}
