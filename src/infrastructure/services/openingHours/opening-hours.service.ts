import { HttpException, HttpStatus, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateOpeningHourDto } from '../../controllers/openingHours/dto/create-opening-hour.dto';
import { UpdateOpeningHourDto } from '../../controllers/openingHours/dto/update-opening-hour.dto';
import { OpeningHour } from 'src/infrastructure/entities/opening-hour.entity';
import { Business } from 'src/infrastructure/entities/business.entity';
import { OpeningHoursPresenter } from 'src/infrastructure/controllers/openingHours/openingHours.presenter';
import { InjectRepository } from '@nestjs/typeorm';
import { Day } from 'src/infrastructure/entities/day.entity';
import { Repository } from 'typeorm';
import { User } from 'src/infrastructure/entities/user.entity';

@Injectable()
export class OpeningHoursService {
  constructor(
    @Inject('OPENING_HOURS_REPOSITORY')
    private readonly openingHoursRepository: Repository<OpeningHour>,
    
    @Inject('BUSINESS_REPOSITORY')
    private readonly businessRepository: Repository<Business> ,

    @Inject('DAY_REPOSITORY')
    private readonly dayRepository: Repository<Day>,

    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
  ){}

  async create(userId: number, createOpeningHourDto: { openingHours: CreateOpeningHourDto[] }) {
    try{
      const openingHours = [];      
      const business = await this.businessRepository.findOne({
        where: { user: { id: userId } },
        relations: ['openingHours']
      });

      if (!business) {
        throw new HttpException(
          { message: "Le commerce demandé est introuvable. Veuillez vérifier l'identifiant ou réessayer plus tard." },
          HttpStatus.NOT_FOUND
        );
      }
      // for (const dto of createOpeningHourDto.openingHours) {
      //   const day = await this.dayRepository.findOne({
      //     where: {id: dto.day}
      //   })
      //   if (!day) {
      //     throw new HttpException(
      //       {
      //         message: `Aucun jour correspondant à l'identifiant ${dto.day} n'a été trouvé.`,
      //       },
      //       HttpStatus.NOT_FOUND
      //     );
      //   }
      //   // Create new opening hour entry
      //   const newOpeningHour = this.openingHoursRepository.create({
      //     day: day,
      //     openingTime: dto.openingTime ? dto.openingTime : null,
      //     closingTime: dto.closingTime ? dto.closingTime : null,
      //     isClosed: (dto.isClosed == true) ? true : false,
      //     business: business, 
      //   });

      //   openingHours.push(newOpeningHour);
      // }
      for (const dto of createOpeningHourDto.openingHours) {
        const day = await this.dayRepository.findOne({ where: { id: dto.day } });
        if (!day) {
          throw new HttpException(
            {
              message: `Aucun jour correspondant à l'identifiant ${dto.day} n'a été trouvé.`,
            },
            HttpStatus.NOT_FOUND
          );
        }
        // Vérifie si une entrée existe déjà pour ce jour et ce business
        let existingOH = await this.openingHoursRepository.findOne({
          where: {
            business: { id: business.id },
            day: { id: dto.day },
          },
          relations: ['day', 'business'],
        });

        if (existingOH) {
          // Update
          console.log("update: ", existingOH)
          existingOH.openingTime = dto.openingTime ? new Date(`1970-01-01T${dto.openingTime}`) : null;
          existingOH.closingTime = dto.closingTime ? new Date(`1970-01-01T${dto.closingTime}`) : null;
          existingOH.isClosed = (dto.isClosed === true) ? true : false,
          existingOH.updatedAt = new Date()
          openingHours.push(existingOH);
        } else {
          // Create
          const newOH = this.openingHoursRepository.create({
            day: day,
            openingTime: dto.openingTime ? dto.openingTime : null,
            closingTime: dto.closingTime ? dto.closingTime : null,
            isClosed: (dto.isClosed == true) ? true : false,
            business: business, 
          });
          console.log("create: ", newOH)
          openingHours.push(newOH);
        }
      }
      const ohs = await this.openingHoursRepository.save(openingHours);

      return {
        data: { openingHours: ohs.map((oh) => new OpeningHoursPresenter(oh))  }
      };

    }catch(error){
      if(error.response) throw new HttpException(error.response, error.status)
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async findAll(userId: number) {
    try{
      const user = await this.userRepository.findOneBy({id: userId})
      if (user.role === "BUSINESS") {
        const openingHours = await this.openingHoursRepository.find({
          where: {
            business: { id: user.business.id }
          }
        })
        return {
          data: { openingHours: openingHours.map((oh) => new OpeningHoursPresenter(oh)) }
        }
      }
      
    }catch(error){
      if(error.response) throw new HttpException(error.response, error.status)
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async findOne(id: number) {
    try{
      const openingHours = await this.openingHoursRepository.findOneBy({id})
      if(!openingHours){
        throw new HttpException(
          {
            message: "Les horaires d’ouverture sont introuvables."
          },
          HttpStatus.NOT_FOUND
        );
        
      } 
      return {
        data: { openingHours: new OpeningHoursPresenter(openingHours) }
      }
    }catch(error){
      if(error.response) throw new HttpException(error.response, error.status)
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async update(businessId: number, openingHoursData: any) {
    try {
      
      const business = await this.businessRepository.findOne(
        {
          where: { id: businessId},
          relations: ['openingHours']
        }
      );
    
      if (!business) {
        throw new Error("Le commerce demandé est introuvable. Veuillez vérifier l'identifiant ou réessayer plus tard.");
      }
      const existingHours =  business.openingHours
      let updatedOpeningHour
      // let updatedOpeningHours 
      for (const op of openingHoursData.openingHours) {
        const day = await this.dayRepository.findOneBy({id: op.day})
        for (const hour of existingHours) {
          if (hour.day.id === day.id) {
            updatedOpeningHour = await this.openingHoursRepository.update({id: hour.id}, op)
            if (!updatedOpeningHour) {
              throw new HttpException(
                {
                  message: "L'horaire d'ouverture n'a pas été modifié."
                },
                HttpStatus.NOT_FOUND
              );
              // updatedOpeningHours.push(updatedOpeningHour);
            }
            // updatedOpeningHours.push(updatedOpeningHour);
          }
        }
      }
      if (updatedOpeningHour.affected) {
        return { 
        data: { 
          message: 'Mise à jour effectuée avec succès'
        } 
      }
      }
      
    } catch (error) {
      if(error.response) throw new HttpException(error.response, error.status)
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
}

  async remove(userId: number, id: number) {
    try{
      const user = await this.userRepository.findOneBy({id : userId})
      const openingHours = await this.openingHoursRepository.findOne({
        where: {
          id: id,
          business: {user: user}
        },
        relations: ['business.user']
      })
      if(!openingHours) {
        throw new HttpException(
          {
            message: "Les horaires d’ouverture sont introuvables."
          },
          HttpStatus.NOT_FOUND
        );
      }
      let errors = []
      if(openingHours.business.user.id != userId) {
        // throw new UnauthorizedException()
        errors.push({
          field: 'user id',
          message: 'Accès non autorisé.'
        });

        throw new HttpException(
          {
            message: "",
            errors: errors
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      await this.openingHoursRepository.delete(openingHours.id)
      return {
        message: 'Supprimé avec succès.'
      }
    }catch(error){
      if(error.response) throw new HttpException(error.response, error.status)
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }
}
