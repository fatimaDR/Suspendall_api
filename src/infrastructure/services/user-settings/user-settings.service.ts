import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateUserSettingDto } from '../../controllers/user-settings/dto/create-user-setting.dto';
import { UpdateUserSettingDto } from '../../controllers/user-settings/dto/update-user-setting.dto';
import { Repository } from 'typeorm';
import { UserSetting } from 'src/infrastructure/entities/user-setting.entity';
import { User } from 'src/infrastructure/entities/user.entity';
import { Stock } from 'src/infrastructure/entities/stock.entity';
import { startOfWeek, startOfMonth } from 'date-fns';
import { SubCategory } from 'src/infrastructure/entities/sub-category.entity';

@Injectable()
export class UserSettingsService {
  constructor(
    @Inject('USER_SETTINGS_REPOSITORY') 
    private userSettingsRepository: Repository<UserSetting>,
    @Inject('USER_REPOSITORY') 
    private userRepository: Repository<User>,
    @Inject('STOCK_REPOSITORY')
    private stockRepository: Repository<Stock>,
    
    @Inject('SUB_CATEGORY_REPOSITORY') 
    private subCategoryRepository: Repository<SubCategory>,
  ){}

  async editSettings(currentUserId, updateSettingsDto) {
    try {
      const user = await this.userRepository.findOne({
        relations: ['userSetting'],
        where: {
          id: currentUserId,
        },
      });
      const updateSettings = {
        user: user,
        isNotifActive: updateSettingsDto.isNotifActive
      };

      if (user.userSetting) {
        const settings = user.userSetting;
        updateSettings['updatedAt'] = new Date();
        await this.userSettingsRepository.update(settings.id, updateSettings);
      } else {
        const createdSetting = this.userSettingsRepository.create({
          user: user,
        });
        const settings = await this.userSettingsRepository.save(createdSetting);
      }
      return { 
        data: {
          message: "Vos paramètres ont été mis à jour avec succès."
        }
      };

    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);

      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async notificationActived(userId: number){
    try {
      const user = await this.userRepository.findOne({
        where: {
          id: userId,
        },
        relations: ['userSetting']
      });
      // console.log(user)
      if (!user) {
        throw new HttpException(
          {
            message: 'L’identifiant de l’utilisateur n’existe pas.'
          },
          HttpStatus.NOT_FOUND,
        );
      }
      let message = "";

      if (user.userSetting.isNotifActive == false) {
        user.userSetting.isNotifActive = true;
        await this.userSettingsRepository.update({id: user.userSetting.id}, user.userSetting)
        message =  "La notification a été activée avec succès." ;
      }else {
        user.userSetting.isNotifActive = false;
        await this.userSettingsRepository.update({id: user.userSetting.id}, user.userSetting)
        message = "La notification a été désactivée avec succès." ;
      }
      
      return {
        message: message,
      }
    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async deleteMyAccount(id: number) {
    try{
      const user = await this.userRepository.findOneBy({id})
      let errors = []
      if(user){
        user.userSetting = null;
        await this.userRepository.save(user);
        const deleted = await this.userRepository.delete(id)
        if(deleted.affected){
          return {
            message: 'Votre compte a été supprimé avec succès.'
          }
        }else{
          errors.push({
            field: 'delete account',
            message: 'Une erreur inattendue est survenue. Veuillez réessayer plus tard.'
          });
          throw new HttpException(
            {
              message: '',
              errors: errors
            },
            HttpStatus.BAD_REQUEST,
          );
        }
      }
      throw new HttpException(
        {
          message: "L’utilisateur demandé est introuvable. Veuillez vérifier les informations fournies."
        },
        HttpStatus.NOT_FOUND
      );
      
    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // Business orders by week/month and product type || Nombre de commandes payés et montant récolté
  async MyOrders(userId: number, query?: { subCategories; period: number }) {
    try {
        const user = await this.userRepository.findOneBy({id: userId})
        const businessId = user.business.id
        let amount_collected = 0
        // const subCategoriesArray = query.subCategories;
        if (businessId) {
            const queryBuilder = await this.stockRepository.createQueryBuilder('order')
            .leftJoinAndSelect("order.benefactor", "benefactor")
            .leftJoinAndSelect('order.product', 'product')
            .leftJoinAndSelect('product.subCategory', 'subCategory')
            .where("order.business.id = :businessId", { businessId })
            .andWhere("order.benefactor IS NOT NULL");
            let subCatIds = []
            if (query.subCategories) {
              for(const subCatId of query.subCategories){
                subCatIds.push(subCatId)
              }
              // subCatIds = JSON.parse(query.subCategories);
              queryBuilder.andWhere("subCategory.id IN (:SubCategories)", { SubCategories: subCatIds });
            }
            if(query.period){
              const currentDate = new Date();
              if (query.period == 7) { 
                const startDate = startOfWeek(currentDate);
                queryBuilder.andWhere('order.createdAt >= :startDate', { startDate });
              }
              if (query.period == 30) {
                const startDate = startOfMonth(currentDate);
                queryBuilder.andWhere('order.createdAt >= :startDate', { startDate });
              }
            }
            const orders = await queryBuilder.getCount();
            const orders_paid  = await queryBuilder.getMany();
            for (const element of orders_paid) {
              amount_collected += element.total
            }
            const myContributions = await this.BusinessDonation(user.id, query)
            
            return {
              data: { 
                orders: orders,
                amount_collected: amount_collected,
                contributions: myContributions
              }
            }
        }
        throw new HttpException(
            {
            errors: {
                message: 'L’identifiant du commerce n’existe pas.'
            }
            },
            HttpStatus.NOT_FOUND,
        );  
      
    } catch (error) {
      if(error.response) throw new HttpException(error.response, error.status)
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
}

// L'historique des commandes du business
async MyHistory(userId: number, query?: { product?: string, period?: number }) {
  try {
      const user = await this.userRepository.findOneBy({id: userId})
      const businessId = user.business.id
      
      if (businessId) {
          const queryBuilder = await this.stockRepository.createQueryBuilder('order')
          .leftJoinAndSelect("order.benefactor", "benefactor")
          .leftJoinAndSelect("benefactor.user", "user")
          .leftJoinAndSelect('order.product', 'product')
          .where("order.business.id = :businessId", { businessId })
          .andWhere("order.benefactor IS NOT NULL")
          if (query.product) {
            queryBuilder.andWhere('product.title = :productTitle', { productTitle: query.product })
          }
          if(query.period){
            const currentDate = new Date();
            if (query.period == 7) { 
              const startDate = startOfWeek(currentDate);
              queryBuilder.andWhere('order.createdAt >= :startDate', { startDate });
            }
            if (query.period == 30) {
              const startDate = startOfMonth(currentDate);
              queryBuilder.andWhere('order.createdAt >= :startDate', { startDate });
            }
          }
          const orders = await queryBuilder.getMany();
          return {
            data: { 
              orders: orders
            }
          }
      }
      throw new HttpException(
          {
          errors: {
              message: 'L’identifiant du commerce n’existe pas.'
          }
          },
          HttpStatus.NOT_FOUND,
      );  
    
  } catch (error) {
    if(error.response) throw new HttpException(error.response, error.status)
    throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
  }
}
// By business
async BusinessDonation(userId: number, query?: {subCategories?, period?: number }){
  try {
    const user = await this.userRepository.findOne({
        where: { id: userId},
        relations: ['business']
      })
    const business = user.business
    
    if (!business) {
      throw new HttpException(
        {
          errors: {
            message: 'L’identifiant du commerce n’existe pas.'
          }
        },
        HttpStatus.NOT_FOUND,
      );  
    }
    const queryBuilder = await this.stockRepository.createQueryBuilder('order')
    .leftJoinAndSelect("order.benefactor", "benefactor")
    .leftJoinAndSelect('order.product', 'product')
    .leftJoinAndSelect('product.subCategory', 'subCategory')
    .where("order.business.id = :businessId", { businessId: business.id })
    .andWhere("order.benefactor IS NULL")
    // .getCount()
    let subCatIds = []
    if (query.subCategories) {
      // const subCatIds = JSON.parse(query.subCategories);
      for(const subCatId of query.subCategories){
        subCatIds.push(subCatId)
      }
      queryBuilder.andWhere('subCategory.id IN (:productSubCategories)', { productSubCategories: subCatIds });
    }
    if(query.period){
      const currentDate = new Date();
      if (query.period == 7) { 
        const startDate = startOfWeek(currentDate);
        queryBuilder.andWhere('order.createdAt >= :startDate', { startDate });
      }
      if (query.period == 30) {
        const startDate = startOfMonth(currentDate);
        queryBuilder.andWhere('order.createdAt >= :startDate', { startDate });
      }
    }
    const orders = await queryBuilder.getCount();
    return orders

  } catch (error) {
    if (error.response) throw new HttpException(error.response, error.status);
    throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
  }
}
  // create(createUserSettingDto: CreateUserSettingDto) {
  //   return 'This action adds a new userSetting';
  // }

  findAll() {
    return `This action returns all userSettings`;
  }

  findOne(id: number) {
    return `This action returns a #${id} userSetting`;
  }

  update(id: number, updateUserSettingDto: UpdateUserSettingDto) {
    return `This action updates a #${id} userSetting`;
  }

  remove(id: number) {
    return `This action removes a #${id} userSetting`;
  }
}
