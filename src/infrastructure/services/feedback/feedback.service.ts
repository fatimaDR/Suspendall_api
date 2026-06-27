import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateFeedbackDto } from '../../controllers/feedback/dto/create-feedback.dto';
import { UpdateFeedbackDto } from '../../controllers/feedback/dto/update-feedback.dto';
import { Feedback } from 'src/infrastructure/entities/feedback.entity';
import { Like, Repository } from 'typeorm';
import { Business } from 'src/infrastructure/entities/business.entity';
import { Profitable } from 'src/infrastructure/entities/profitable.entity';
import { User } from 'src/infrastructure/entities/user.entity';
import { FeedbackPresenter } from 'src/infrastructure/controllers/feedback/feedbacks.presenter';
import { BusinessService } from '../business/business.service';
import { NotificationService } from '../notification/notification.service';
import { NOTIFICATIONTYPE } from 'src/functions/notification.enum';

@Injectable()
export class FeedbackService {

  constructor(
    @Inject('FEEDBACK_REPOSITORY')
    private readonly feedbackRepository: Repository<Feedback>,

    @Inject('BUSINESS_REPOSITORY')
    private businessRepository: Repository<Business>,

    private readonly businessService: BusinessService,

    @Inject('USER_REPOSITORY') 
    private userRepository: Repository<User>,

    private notificationService: NotificationService,
  ){}

  async addFeedback(businessId: number, userId: number, createFeedbackDto: CreateFeedbackDto) {
    try { 
      const business = await this.businessRepository.findOne({
        where: { id: businessId },
        relations: ['user']
      })

      if (business) {
        const user = await this.userRepository.findOne({
          where: { id: userId },
          relations: ['media']
        })
        // const profitable  = user.profitable 
        const feedbackCreated = await this.feedbackRepository.create(createFeedbackDto);
        feedbackCreated.business = business;
        feedbackCreated.user = user
        const feedback = await this.feedbackRepository.save(feedbackCreated)
        const rating = await this.businessService.getAverageFeedbacks(business.id);
        feedback['averageRating'] = rating;
        const Note = feedback.note
        if (feedback) {
          // send notification to recovery confirmation
          const message = `Vous avez reçu un avis ★${Note}.`
          await this.notificationService.sendNotifMessage(business.user.id, business.user.id, business.user, NOTIFICATIONTYPE.Transaction, "Nouveau retour reçu", message)
        }
        return {
          data: {
            feedback: feedback ,
            // feedback: new FeedbackPresenter(feedback)
          }
        };
      }

      throw new HttpException(
        {
          errors: {
            message: 'Aucun commerce trouvé avec cet identifiant.'
          }
        },
        HttpStatus.NOT_FOUND,
      );
      
    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findAll(businessId: number) {
    try {
      const business = await this.businessRepository.findOne({
        where: {id: businessId }, 
        relations: ['media' ,'feedbacks.user.media']
      })

      if (business) {
        const feedbacks = business.feedbacks
        return {
          data: { feedbacks: feedbacks.map((feedback) => new FeedbackPresenter(feedback)) }
        }
      }
      throw new HttpException(
        {
          errors: {
            message: 'Aucun commerce trouvé avec cet identifiant.'
          }
        },
        HttpStatus.NOT_FOUND,
      );
      
    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // Liste des feedbacks d'un business utilisé par admin
  async allFeedbacks(query) {
    try {

      const { business, limit = 10, offset = 0, keyword } = query;
      // Initialize the QueryBuilder for fetching feedbacks
      const feedbackQuery = this.feedbackRepository.createQueryBuilder('feedback')
        .leftJoinAndSelect('feedback.user', 'user')
        .leftJoinAndSelect('user.media', 'media');
  
      // Apply business filter if `business` exists in the query
      if (query.business) {
        feedbackQuery.andWhere('feedback.business = :business', { business });
      }
  
      // Apply keyword filter if provided
      if (keyword) {
        feedbackQuery.andWhere('feedback.note LIKE :keyword', { keyword: `%${keyword}%` });
      }
  
      feedbackQuery.orderBy('feedback.createdAt', 'DESC');
      // Apply pagination
      feedbackQuery.skip(offset).take(limit);
  
      // Execute query and get results
      const [feedbacks, totalItems] = await feedbackQuery.getManyAndCount();
  
      return {
        data: {
          feedbacks: feedbacks.map((feedback) => new FeedbackPresenter(feedback)),
          totalItems,
        },
      };
    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
  

  
  // findOne(id: number) {
  //   return `This action returns a #${id} feedback`;
  // }

  async update(id: number, userId: number, updateFeedbackDto: UpdateFeedbackDto) {
    try{
      const feedback = await this.feedbackRepository.findOne({
        where: {id: id},
        relations: ['user']
      })
      const user = await this.userRepository.findOneBy({ id: userId });
     
      if(feedback && (user.id === feedback.user.id) ){
        const updated = await this.feedbackRepository.update(id, updateFeedbackDto)
        if(updated.affected){
          const updatedFeedback = await this.feedbackRepository.findOneBy({id})
          return { 
            data: { comment: new FeedbackPresenter(updatedFeedback) },
            message: 'Mise à jour effectuée avec succès'
          }
        }else{
          throw new HttpException('Aucune modification apportée.', HttpStatus.NOT_MODIFIED)
        }
        
      }
      throw new HttpException(
        {
          errors: {
            message: "Impossible d’accéder à ce commentaire : il est introuvable ou vous n’êtes pas autorisé."
          }
        },
        HttpStatus.NOT_FOUND,
      );
    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);

      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async remove(id: number, userId: number) {
    try {
      let errors = []
      const user = await this.userRepository.findOneBy({ id: userId });
      const feedback = await this.feedbackRepository.findOne({
        where:{id: id},
        relations: ['user']
      })

      if (feedback && user.id === feedback.user.id) {
        const deleted = await this.feedbackRepository.delete(id);
        if(deleted.affected){
          return {data: {message: 'Ce commentaire n’est plus disponible.'} }
        }
        errors.push({
          field: '',
          message: 'Une erreur inattendue est survenue. Veuillez réessayer plus tard.'
        });
      }
      errors.push({
        field: 'feedback id',
        message: 'Ce commentaire est introuvable.'
      });
    
      throw new HttpException(
        {
          message: "",
          errors: errors
        },
        HttpStatus.BAD_REQUEST,
      );
    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
    
  }
}
