import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { DayPresenter } from 'src/infrastructure/controllers/day/day.presenter';
import { CreateDayDto } from 'src/infrastructure/controllers/day/dto/create-day.dto';
import { UpdateDayDto } from 'src/infrastructure/controllers/day/dto/update-day.dto';
import { Day } from 'src/infrastructure/entities/day.entity';
import { Repository } from 'typeorm';


@Injectable()
export class DayService {

  constructor(
    @Inject('DAY_REPOSITORY')
    private readonly dayRepository: Repository<Day>,
  ){}

  async create(createDayDto: CreateDayDto) {
    try {
      const existed = await this.dayRepository.exist({
        where: {
          name: createDayDto.name
        }
      })
      let errors = [];
      
      if(existed){
        errors.push({
          field: 'day',
          message: 'Cet élément existe déjà.'
        });
      
        throw new HttpException(
          {
            message: "",
            errors: errors
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      const createdDay = await this.dayRepository.create(createDayDto)
      const day = await this.dayRepository.save(createdDay)
      return {
        data: { day: new DayPresenter(day) }
      }
    } catch (error) {
      if(error.response) throw new HttpException(error.response,error.status)
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async findAll() {
    try{
      const days = await this.dayRepository.find(
        {
          relations: ['openingHours']
        }
      )
      const dayList = days.map( (day) => new DayPresenter(day) )
      return { 
        data: {
          days: dayList
        } 
      }
    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findOne(id: number) {
    try{
      const day = await this.dayRepository.findOne({ 
        where: {
          id
        },
        relations: ['openingHours']
      })
      if(day){
        return { 
          data: { day: new DayPresenter(day) }
        }
      }
      throw new HttpException(
        {
          message: 'L’identifiant du jour n’existe pas.'
        },
        HttpStatus.NOT_FOUND,
      );
    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async update(id: number, updateDayDto: UpdateDayDto) {
    try{
      const day = await this.dayRepository.findOneBy({id})
      if(day){
        const updated = await this.dayRepository.update(id, updateDayDto)
        if(updated.affected){
          const updatedDay = await this.dayRepository.findOneBy({id})
          return { 
            data: { day: new DayPresenter(updatedDay) },
            message: 'Mise à jour effectuée avec succès.'
          }
        }else{
          throw new HttpException('Aucune modification apportée.', HttpStatus.NOT_MODIFIED)
        }
        
      }
      throw new HttpException(
        {
          errors: {
            message: 'L’identifiant du jour n’existe pas.'
          }
        },
        HttpStatus.NOT_FOUND,
      );
    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);

      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async remove(id: number) {
    try{
      const day = await this.dayRepository.findOneBy({id})
      let errors = []
      if(day){
        const deleted = await this.dayRepository.delete(id);
        
        if(deleted.affected){
          return { message: 'Supprimé avec succès' }
        }
        errors.push({
          field: '',
          message: 'Une erreur inattendue est survenue. Veuillez réessayer plus tard.'
        });
      
        throw new HttpException(
          {
            message: "",
            errors: errors
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      
      throw new HttpException(
        {
          errors: {
            message: 'L’identifiant du jour n’existe pas.'
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
