import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateLikeDto } from '../../controllers/like/dto/create-like.dto';
import { UpdateLikeDto } from '../../controllers/like/dto/update-like.dto';
import { Like } from 'src/infrastructure/entities/like.entity';
import { Repository } from 'typeorm';
import { Business } from 'src/infrastructure/entities/business.entity';
import { User } from 'src/infrastructure/entities/user.entity';
import { LikePresenter } from 'src/infrastructure/controllers/like/likes.presenter';
import { BusinessService } from '../business/business.service';

@Injectable()
export class LikeService {
  
  constructor(
    @Inject('LIKE_REPOSITORY') 
    private likeRepository: Repository<Like>,

    @Inject('BUSINESS_REPOSITORY')
    private businessRepository: Repository<Business>,

    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,

    private readonly businessService: BusinessService
  ){}

  async addLike(businessId: number, userId: number){
    try {
      const business = await this.businessRepository.findOneBy({id: businessId});
      if (!business) {
        throw new HttpException(
            {
              message: "Aucun commerce correspondant n’a été trouvé."
            },
            HttpStatus.NOT_FOUND
        );
      }
      const user = await this.userRepository.findOneBy({id: userId})
      if (!user) {
        throw new HttpException(
          { message: "L'utilisateur est introuvable" },
          HttpStatus.NOT_FOUND
        );
      }
      const existingLike = await this.likeRepository.findOne({
        where: {
          business: { id: businessId },
          user: { id: userId }
        }
      });

      if (existingLike) {
        // await this.likeRepository.remove(existingLike);
        return {
          data: { message: "Ce commerce est déjà présent dans votre liste de favoris." }
        };
      }
      const like = await this.likeRepository.create({business, user});
      const likeSaved = await this.likeRepository.save(like);
      if (likeSaved) {
        return {
          data: { message: "Le commerce a été ajouté à vos favoris avec succès."  }
        }
      }
       
    } catch (error) {
      if(error.response) throw new HttpException(error.response, error.status)
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
   
  }


  async findAll(userId: number) {
    try {
      
      let favoris = [];
      let data = []
      const user = await this.userRepository.findOne({
        where: {id: userId},
        relations: ['likes']
      })

      if (user) {
        favoris = await this.likeRepository.createQueryBuilder('like')
          .leftJoinAndSelect('like.business', 'business')
          .leftJoinAndSelect('business.media', 'businessMedia')
          .leftJoinAndSelect('business.user', 'businessUser')
          .leftJoinAndSelect('businessUser.media', 'businessUserMedia')
          .leftJoinAndSelect('businessUser.city', 'businessUserCity')
          .leftJoinAndSelect('business.subCategory', 'businessSubCat')
          .leftJoinAndSelect('business.feedbacks', 'businessFeedbacks')
          .leftJoinAndSelect('like.user', 'user')
          .leftJoinAndSelect('user.media', 'userMedia')
          .where('user.id = :userId', { userId: user.id })
          .getMany();
        
          for (const favori of favoris) {
            const feedbacks = await this.businessService.getAverageFeedbacks(favori.business.id)
            data.push({
              ...new LikePresenter(favori),
              averageRating: feedbacks
            })
          }

          return {
            data: { likes: data }
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

  findOne(id: number) {
    return `Cette action renvoie la mention J’aime n°${id}.`;
  }

  update(id: number, updateLikeDto: UpdateLikeDto) {
    return `Cette action met à jour la mention J’aime n°${id}.`;
  }

  async remove(businessId: number, userId: number) {
    try {
      const business = await this.businessRepository.findOne({ where: { id: businessId } });
      if (!business) {
        // throw new HttpException('Le commerce demandé est introuvable. Veuillez vérifier l’identifiant ou réessayer plus tard.', HttpStatus.NOT_FOUND);
        throw new HttpException(
          {
            message: "Aucun commerce correspondant n’a été trouvé."
          },
          HttpStatus.NOT_FOUND
        );
      }

      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        // throw new HttpException('L’utilisateur demandé est introuvable. Veuillez vérifier les informations fournies.', HttpStatus.NOT_FOUND);
        throw new HttpException(
            {
              message: "L’utilisateur demandé est introuvable. Veuillez vérifier les informations fournies."
            },
            HttpStatus.NOT_FOUND
        );
      }
  
      const like = await this.likeRepository.findOne({ where: { business: {id: business.id}, user: {id: user.id} }});
  
      if (!like) {
        // throw new HttpException('Mention J’aime introuvable.', HttpStatus.NOT_FOUND);
        throw new HttpException(
            {
              message: "Aucune mention J’aime correspondante n’a été trouvée."
            },
            HttpStatus.NOT_FOUND
        );
      }
  
      // Remove the like entry
      await this.likeRepository.remove(like);
  
      return {
        data: { message: "Votre mention J’aime a été retirée avec succès." }
      };
    } catch (error) {
      if (error.response) {
        throw new HttpException(error.response, error.status);
      }
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // async remove(id: number, userId: number) {
  //   try {
  //     const user = await this.userRepository.findOne({
  //       where: { id: userId},
  //       relations: ['likes']
  //     })
  //     if (user) {
  //       for(let like of user.likes){
  //         if (like.id == id) {
  //           await this.likeRepository.delete(id)
  //         }
  //       }
  //       return {
  //         data: { message: "Votre mention J’aime a été retirée avec succès." }
  //       }
  //     }
  //     throw new HttpException(
  //       {
  //         message: "L’utilisateur demandé est introuvable. Veuillez vérifier les informations fournies."
  //       },
  //       HttpStatus.NOT_FOUND
  //     );
  //   } catch (error) {
  //     if(error.response) throw new HttpException(error.response, error.status)
  //     throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
  //   }
  // }
}
