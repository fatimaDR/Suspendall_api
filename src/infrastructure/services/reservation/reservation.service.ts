import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateReservationDto } from '../../controllers/reservation/dto/create-reservation.dto';
import { UpdateReservationDto } from '../../controllers/reservation/dto/update-reservation.dto';
import { Reservation } from 'src/infrastructure/entities/reservation.entity';
import { Any, Repository } from 'typeorm';
import { User } from 'src/infrastructure/entities/user.entity';
import { Product } from 'src/infrastructure/entities/product.entity';
import { ReservationPresenter } from 'src/infrastructure/controllers/reservation/reservation.presenter';
import { Stock } from 'src/infrastructure/entities/stock.entity';
import { getBusinessDistance } from 'src/functions/functions';
import { NotificationService } from '../notification/notification.service';
import { OpeningHour } from 'src/infrastructure/entities/opening-hour.entity';
import { ProductPresenter } from 'src/infrastructure/controllers/product/products.presenter';
import { NOTIFICATIONTYPE } from 'src/functions/notification.enum';
import { SettingsService } from '../settings/settings.service';
import * as dayjs from 'dayjs';
import 'dayjs/locale/fr';
dayjs.locale('fr');

@Injectable()
export class ReservationService {

  constructor(
    @Inject('RESERVATION_REPOSITORY') 
    private reservationRepository: Repository<Reservation>,

    private notificationService: NotificationService,

    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,

    @Inject('STOCK_REPOSITORY')
    private stockRepository: Repository<Stock>,

    private readonly settingsService: SettingsService
    
  ){}

  async create(createReservationDto: CreateReservationDto, userId: number) {
    try {
      const user = await this.userRepository.findOne({
        where: {id: userId},
        relations: ['profitable']
      })
      let formattedTime 
      if (user.role === 'PROFITABLE') {
        const delayMinutes = await this.settingsService.getReservationValidationTime()
        // check si profitable a dèjà reserver dans dernier 24h
        const lastReservation = await this.reservationRepository.findOne({
          where: { profitable: { id: user.profitable.id } },
          relations: ['suspendu'],
          order: { createdAt: 'DESC' },
        });
        
        if (lastReservation) {
          const now = new Date();
          const lastDate = new Date(lastReservation.createdAt);
          const diffInMs = now.getTime() - lastDate.getTime();
          const diffInHours = diffInMs / (1000 * 60 * 60);
          const diffInMinutes = diffInMs / (1000 * 60); // convertit les ms en minutes

          if (diffInMinutes > delayMinutes && !lastReservation.collected) {
            if (lastReservation.suspendu) {
              lastReservation.suspendu.quantity += 1;
              await this.stockRepository.save(lastReservation.suspendu);
            }
            await this.reservationRepository.delete(lastReservation.id);
          } 

          if (diffInMinutes < delayMinutes) {
            const totalMinutes = Math.floor(delayMinutes);
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            if (delayMinutes >= 60) {
              // formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
              formattedTime = `${hours}h${minutes.toString().padStart(2, '0')}min`;
            }else{
              formattedTime = `${minutes.toString().padStart(2, '0')}min`;
            }
            throw new HttpException(
              {
                statusCode: 403,
                message: `Vous ne pouvez réserver un article qu'une seule fois toutes les ${formattedTime} .`,
              },
              HttpStatus.FORBIDDEN,
            );
          }
          // if (diffInHours < 24) {
          //   throw new HttpException(
          //     {
          //       statusCode: 403,
          //       message: "Vous ne pouvez suspendre un article qu'une seule fois toutes les 24 heures.",
          //     },
          //     HttpStatus.FORBIDDEN,
          //   );
          // }
        }

        const reservationCreated = await this.reservationRepository.create(createReservationDto);
        const suspendu = await this.stockRepository.findOne({
          where: {id: createReservationDto.suspenduId},
          relations: ['product', 'business', 'business.user', 'reservations']
        });

        if (!suspendu) {
          throw new HttpException(
            {
              code: HttpStatus.NOT_FOUND,
              errors: {
                product: 'stock id does not exist'
              }
            },
            HttpStatus.NOT_FOUND,
          );
        }
        let message, busMessage
        if (suspendu.quantity > 0) {
          // reservationCreated.suspendus.push(suspendu);
          reservationCreated.suspendu = suspendu;
          suspendu.quantity = suspendu.quantity - 1
          await this.stockRepository.save(suspendu)
          reservationCreated.profitable = user.profitable;
          const reservation =  await this.reservationRepository.save(reservationCreated);
          // Calcul de la date d’expiration
          const expirationDate = dayjs(reservation.createdAt).add(delayMinutes, 'minute');
          
          const formattedExpiration = expirationDate.format('DD/MM/YYYY à HH:mm'); 
          const delayHours = delayMinutes / 60;
          // send notification to profittable to Reminder
          message = `Votre réservation est confirmée ! Votre article vous attend chez ${reservation.suspendu.business.socialRaison}. Venez le récupérer avant  ${formattedExpiration}`
          busMessage = `Le bénéficiaire ${user.firstName} ${user.lastName} souhaite recevoir ${reservation.suspendu.product.title}. Merci de vous préparer à organiser la remise du produit dans les ${delayHours} h.`
          await this.notificationService.sendNotifMessage(user.id, user.id, user, NOTIFICATIONTYPE.Transaction, "Réservation Confirmée", message)
          // process.exit()
          await this.notificationService.sendNotifMessage(reservation.suspendu.business.user.id, reservation.suspendu.business.user.id, reservation.suspendu.business.user, NOTIFICATIONTYPE.Transaction, "Nouvelle demande de réservation", busMessage)
          return { data: 
            { reservation: new ReservationPresenter(reservation)}
          }
        }
      }

    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findAll(userId: number, query) {
    try {
      let reservations = [];
      const user = await this.userRepository.findOne({
        where: {id: userId},
        relations: ['profitable']
      })

      if (user) {
        // reservations = await this.reservationRepository.find()
        const queryBuilder = await this.reservationRepository.createQueryBuilder('reservation')
          .leftJoinAndSelect('reservation.profitable', 'profitable')
          .leftJoinAndSelect('reservation.suspendu', 'suspendu')
          .leftJoinAndSelect('suspendu.business', 'business')
          .leftJoinAndSelect('business.subCategory', 'subCategory')
          .leftJoinAndSelect('subCategory.media', 'subCategoryMedia')
          .leftJoinAndSelect('subCategory.category', 'category')
          .leftJoinAndSelect('category.media', 'categoryMedia')
          .leftJoinAndSelect('business.media', 'businessMedia')
          .leftJoinAndSelect('suspendu.product', 'product')
          .leftJoinAndSelect('product.media', 'media')
          .where('profitable.id = :profitableId', { profitableId: user.profitable.id })
          .orderBy('reservation.createdAt', 'DESC');
        
        if (query.status === 'collected') {
          // Filter for reservations that have been collected
          queryBuilder.andWhere('reservation.collected = :isCollected', { isCollected: true });
        } 

        if (query.status === 'not_collected') {
          // Filter for reservations that have been collected
          queryBuilder.andWhere('reservation.collected = :not_collected', { not_collected: false });
        } 

        // Execute the query
        reservations = await queryBuilder.getMany();
         
        return {
          data: { reservations: reservations.map((reservation) => new ReservationPresenter(reservation))  }
        }
      }

      throw new HttpException(
        {
          code: HttpStatus.NOT_FOUND,
          errors: {
            product: 'user id does not exist'
          }
        },
        HttpStatus.NOT_FOUND,
      );

    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async lastReservation(userId: number) {
    try {
      const user = await this.userRepository.findOne({
        where: {id: userId},
        relations: ['profitable']
      })
    
      if (user) {
        const reservation = await this.reservationRepository.findOne({
          where: { collected: false },
          relations: ['profitable', 'suspendu.business.media', 'suspendu.product.media', 'suspendu.business.subCategory.media', 'suspendu.business.subCategory.category.media'],
          order: {
            createdAt: 'DESC',
          },
        });

        if (!reservation) {
          throw new HttpException(
            {
              code: HttpStatus.NOT_FOUND,
              errors: {
                product: 'order id does not exist'
              }
            },
            HttpStatus.NOT_FOUND,
          );
        }
      return { data: { reservation: new ReservationPresenter(reservation) }}
    }

    throw new HttpException(
      {
        code: HttpStatus.NOT_FOUND,
        errors: {
          message: 'user id does not exist'
        }

      },
      HttpStatus.NOT_FOUND,
    );

    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }


  async collectOrder(id: number, query, userId: number) {
    try {
      
      let business, userProfitable,  message, formattedDate;

      const reservation = await this.reservationRepository.createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.suspendu','suspendu')
      .leftJoinAndSelect('suspendu.product', 'product')
      .leftJoinAndSelect('product.media', 'media')
      .leftJoinAndSelect('suspendu.business', 'business')
      .leftJoinAndSelect('business.user', 'userBus')
      .leftJoinAndSelect('business.subCategory', 'subCategory')
      .leftJoinAndSelect('subCategory.media', 'subCategoryMedia')
      .leftJoinAndSelect('subCategory.category', 'category')
      .leftJoinAndSelect('category.media', 'categoryMedia')
      .leftJoinAndSelect('suspendu.benefactor', 'benefactor')
      .leftJoinAndSelect('benefactor.user', 'user')
      .where('reservation.collected = false')
      .andWhere(`reservation.id = ${id}`)
      .getOne()
      
      if (reservation) {
        const user = reservation.suspendu.benefactor.user
        const benefactorName = reservation.suspendu.benefactor.isCompany ? reservation.suspendu.benefactor.entreprise : `${user.firstName} ${user.lastName}`;
        userProfitable = await this.userRepository.findOneBy({id: userId})
        business = reservation.suspendu.business
        const userBusiness = business.user
        // Check if suspendu.benefactor is null before accessing its properties
        if (reservation.suspendu && reservation.suspendu.benefactor) {

          reservation.collected = true
          reservation.collectedAt = new Date();
          formattedDate = dayjs(reservation.collectedAt).format('DD/MM/YYYY à HH:mm');
          await this.reservationRepository.save(reservation)
          if (user) {
            // send notification to recovery confirmation
            message = `Nous vous informons qu'un article de votre commande suspendue ${reservation.suspendu.id} a été récupéré par un bénéficiaire.`
            await this.notificationService.sendNotifMessage(user.id, user.id, user, NOTIFICATIONTYPE.Transaction, "Un article de votre commande suspendue a été récupéré !", message)
          }
          if (userProfitable) {
            // Send notif to profitable to evaluate this command
            message = `Avez vous apprécié l'article offert par ${benefactorName} ? partager votre avis pour encourager notre génèreuse communauté`
            await this.notificationService.sendNotifMessage(userProfitable.id, userProfitable.id, userProfitable, NOTIFICATIONTYPE.Transaction, "Invitation à Évaluer un article Récupéré", message)
          }
          if(userBusiness){
            // Send notif to business 
            message = `Le bénéficiaire ${userProfitable.firstName} ${userProfitable.lastName} a récupéré ${reservation.suspendu.product.title} le ${formattedDate}.`
            await this.notificationService.sendNotifMessage(userBusiness.id, userBusiness.id, userBusiness, NOTIFICATIONTYPE.Transaction, "Produit remis au bénéficiaire", message)
          }

        }else {
          reservation.collected = true
          reservation.collectedAt = new Date();
          formattedDate = dayjs(reservation.collectedAt).format('DD/MM/YYYY à HH:mm');
          business = reservation.suspendu.business
          // userProfitable = await this.userRepository.findOneBy({id: userId})
          // const user = reservation.suspendu.benefactor.user
          await this.reservationRepository.save(reservation)
          
          if (userProfitable) {
            // Send notif to profitable to evaluate this command
            message = `Avez vous apprécié l'article offert par ${benefactorName} ? Partager votre avis pour encourager notre génèreuse communauté`
            await this.notificationService.sendNotifMessage(userProfitable.id, userProfitable.id, userProfitable, NOTIFICATIONTYPE.Transaction, "Invitation à Évaluer un article Récupéré", message)
          }

          if(userBusiness){
            // Send notif to business 
            message = `Le bénéficiaire ${userProfitable.firstName} ${userProfitable.lastName} a récupéré ${reservation.suspendu.product.title} le ${formattedDate}.`
            await this.notificationService.sendNotifMessage(userBusiness.id, userBusiness.id, userBusiness, NOTIFICATIONTYPE.Transaction, "Produit remis au bénéficiaire", message)
          }
        }
        
        return {
          data: { 
          reservation: new ReservationPresenter(reservation) ,
          distance: getBusinessDistance(business, query)
        }}
      }
      throw new HttpException(
        {
          code: HttpStatus.NOT_FOUND,
          errors: {
            product: 'order id does not exist'
          }
        },
        HttpStatus.NOT_FOUND,
      );
    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  update(id: number, updateReservationDto: UpdateReservationDto) {
    return `This action updates a #${id} reservation`;
  }

  async cancelOrder(id: number) {
    try {
      const reservation = await this.reservationRepository.findOne({
        where: { id: id},
        relations: ['suspendu', 'profitable', 'profitable.user']
      })
      if (!reservation) {
        throw new HttpException(
          {
            code: HttpStatus.NOT_FOUND,
            errors: {
              product: 'order id does not exist'
            }
          },
          HttpStatus.NOT_FOUND,
        );
      }
      const stock =  await this.stockRepository.findOne({ 
        where: {id: reservation.suspendu.id} ,
        relations: ['product' , 'business', 'business.user']
      })
      stock.quantity += 1
      await this.stockRepository.save(stock)
      const formattedDate = dayjs(new Date()).format('DD/MM/YYYY à HH:mm');
      await this.reservationRepository.remove(reservation)
      const message = `Le bénéficiaire ${reservation.profitable.user.firstName} ${reservation.profitable.user.lastName} a annulé sa réservation pour le produit ${stock.product.title} le ${formattedDate}.`
      await this.notificationService.sendNotifMessage(stock.business.user.id, stock.business.user.id, stock.business.user, NOTIFICATIONTYPE.Transaction, "Réservation annulée", message)
      return { data: { message: "Votre commande a été annulée." }}
    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async recommandedForYou(businessId: number, limit: number)  {

    const results =  await this.reservationRepository
      .createQueryBuilder("reservation")
      .leftJoinAndSelect("reservation.suspendu", "stock")
      .leftJoinAndSelect("stock.product", "product")
      .leftJoinAndSelect('product.media', 'productMedia')
      .leftJoinAndSelect('product.tags', 'tags')
      .leftJoinAndSelect('tags.media', 'tagMedia')
      .leftJoinAndSelect('product.subCategory', 'subCategory')
      .leftJoinAndSelect('subCategory.media', 'subMedia')
      .leftJoinAndSelect('subCategory.category', 'category')
      .leftJoinAndSelect('category.media', 'catMedia')
      .leftJoin("stock.business", "business") 
      .addSelect("COUNT(stock.id) as count")
      .where("business.id = :businessId", { businessId }) 
      .groupBy("stock.id") 
      .orderBy("count", "DESC") 
      .limit(limit) 
      .getMany();
      
    return { products: results.map((reservation) => new ProductPresenter(reservation.suspendu.product))} 
  }
 
}
