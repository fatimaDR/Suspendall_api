import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateFavorisDto } from '../../controllers/favoris/dto/create-favoris.dto';
import { UpdateFavorisDto } from '../../controllers/favoris/dto/update-favoris.dto';
import { Favoris } from 'src/infrastructure/entities/favoris.entity';
import { Repository } from 'typeorm';
import { Business } from 'src/infrastructure/entities/business.entity';
import { User } from 'src/infrastructure/entities/user.entity';
import { FavorisPresenter } from 'src/infrastructure/controllers/favoris/favoris.presenter';
import { BusinessService } from '../business/business.service';

@Injectable()
export class FavorisService {

  constructor(
    @Inject('FAVORIS_REPOSITORY') 
    private favorisRepository: Repository<Favoris>,
    @Inject('BUSINESS_REPOSITORY')
    private businessRepository: Repository<Business>,
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
    private readonly businessService: BusinessService

  ){}

  async create(businessId: number, userId: number) {
   try {
    const business = await this.businessRepository.findOneBy({id: businessId, isActive: true})
    
    const user = await this.userRepository.findOneBy({id: userId})
    if (!business || !user ) {
      throw new HttpException(
        {
          errors: {
            message: 'L’identifiant du commerce ou de l’utilisateur est introuvable.'
          }
        },
        HttpStatus.NOT_FOUND,
      );
    }
    
    await this.businessRepository.save(business)
    const data = {
      business: business,
      user: user
    }
    
    const favorisCreated = await this.favorisRepository.create(data)
    const favoris = await this.favorisRepository.save(favorisCreated)

    return {
      data: { 
        message: "Vos favoris ont bien été ajoutés.",
        favoris: new FavorisPresenter(favoris) 
      }
    }

   } catch (error) {
    if (error.response) throw new HttpException(error.response, error.status);
    throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
   }
  }

  async findAll(userId: number) {
    try {
      
      let favoris = [];
      let data = []
      const user = await this.userRepository.findOne({
        where: {id: userId},
        relations: ['favoris']
      })

      if (user) {
        favoris = await this.favorisRepository.createQueryBuilder('favoris')
          .leftJoinAndSelect('favoris.business', 'business')
          .leftJoinAndSelect('favoris.user', 'user')
          .where('user.id = :userId', { userId: user.id })
          .getMany();
        
          for (const favori of favoris) {
            const feedbacks = await this.businessService.getAverageFeedbacks(favori.business.id)
            data.push({
              ...new FavorisPresenter(favori),
              averageRating: feedbacks
            })
          }

          return {
            data: { favoris: data }
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
    return `Cette action renvoie le favori n°${id}.`;
  }

  update(id: number, updateFavorisDto: UpdateFavorisDto) {
    return `Cette action met à jour le favori n°${id}.`;
  }

  async remove(businessId: number, userId: number) {
    try {
      // const user = await this.userRepository.findOneBy({id: userId})
      // const favoris = await this.favorisRepository.findOne(
      //   {
      //     where: {id: id},
      //     relations: ['user']
      //   })
      const favoris = await this.favorisRepository.findOne({
        where: {
          business: { id: businessId },
          user: { id: userId }
        },
        relations: ['user', 'business'], 
      });
      let errors = []
      if (favoris.user.id === userId) {
        const deleted = await this.favorisRepository.delete(favoris.id);
        if(deleted.affected){
          return {
            message: 'Vos favoris ont été supprimés avec succès.'
          }
        }else {
          errors.push({
            field: 'delete',
            message: 'Vos favoris n’ont pas été supprimés avec succès.'
          });
          throw new HttpException(
            {
              message: "",
              errors: errors
            },
            HttpStatus.BAD_REQUEST,
          );
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
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
