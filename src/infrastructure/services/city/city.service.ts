import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateCityDto } from '../../controllers/city/dto/create-city.dto';
import { UpdateCityDto } from '../../controllers/city/dto/update-city.dto';
import { City } from 'src/infrastructure/entities/city.entity';
import { Like, Repository } from 'typeorm';
import { CityPresenter } from 'src/infrastructure/controllers/city/cities.presenter';

@Injectable()
export class CityService {
  constructor(
    @Inject('CITY_REPOSITORY') 
    private cityRepository: Repository<City>,
  ){}
  
  async create(createCityDto: CreateCityDto) {
    try {
      let errors = [];

      const existedCity = await this.cityRepository.findOneBy({name: createCityDto.name});
      if (existedCity) {
        errors.push({
          field: 'name',
          message: 'La ville existe déjà.'
        });
      
        throw new HttpException(
          {
            message: "",
            errors: errors
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      const cityCreated =  await this.cityRepository.create(createCityDto);
      const city = await this.cityRepository.save(cityCreated);
      
      return { data: { city: new CityPresenter(city) } };
      
    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }

  }

  async findAll(query) {
    try {
      const { limit, offset , keyword = ''} = query;
      const cities = await this.cityRepository.find({
        where: {
          name: Like(`${keyword}%`),
        },
        take: limit,
        skip: offset,
      });

      const totalItems = cities.length
      return {
        data: {
          cities: cities.map(
            (city) => new CityPresenter(city),
          ),
          totalItems: totalItems
        },
      };

    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST); 
    }

  }

  async findOne(id: number) {

    try {
      const city = await this.cityRepository.findOne({ where: { id } })
      if (!city) {
        throw new HttpException(
          {
            errors: {
              message: 'L’identifiant de la ville n’existe pas.'
            }
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return { data: { city: new CityPresenter(city) } };

    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
   
  }

  async update(id: number, updateCityDto: UpdateCityDto) {

    try {
      const existCity = await this.cityRepository.findOne({where: { id: id }});
      if (!existCity) {
        throw new HttpException(
          {
            errors: {
              message: 'L’identifiant de la ville n’existe pas.'
            }
          },
          HttpStatus.NOT_FOUND,
        );
      }else{
        await this.cityRepository.update(id, updateCityDto);
        const getCity = await this.cityRepository.findOne({where: { id: id }});
        return { data: {city: new CityPresenter(getCity) } };
      }
      
    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }

  }

  async remove(id: number) {
    try {
      
      const city = await this.cityRepository.findOne({where: { id: id }});
      if(city){
        await this.cityRepository.delete(id);
        return { message: `La ville n°${id} a été supprimée.`  }
      }
      
      throw new HttpException({
        message: "Une erreur inattendue est survenue. Veuillez réessayer plus tard."
      }, HttpStatus.NOT_FOUND
      );
      
    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
