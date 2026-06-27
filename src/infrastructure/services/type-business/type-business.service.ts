import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateTypeBusinessDto } from 'src/infrastructure/controllers/type-business/dto/create-type-business.dto';
import { UpdateTypeBusinessDto } from 'src/infrastructure/controllers/type-business/dto/update-type-business.dto';
import { TypePresenter } from 'src/infrastructure/controllers/type-business/TypePresenter';
import { TypeBusiness } from 'src/infrastructure/entities/type-business.entity';
import { Like, Repository } from 'typeorm';


@Injectable()
export class TypeBusinessService {
  
  constructor(
    @Inject('TypeBusiness_REPOSITORY')
    private readonly typeBusinessRepository: Repository<TypeBusiness>,

  ){}

  async create(createTypeBusinessDto: CreateTypeBusinessDto) {
    try{
      const existed = await this.typeBusinessRepository.exist({
        where: {
          name: createTypeBusinessDto.name
        }
      })
      let errors = [];
      
      if(existed){
        errors.push({
          field: 'name',
          message: 'Cet enregistrement existe déjà dans le système.'
        });
      
        throw new HttpException(
          {
            message: "",
            errors: errors
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      const created = await this.typeBusinessRepository.create(createTypeBusinessDto)
      const type = await this.typeBusinessRepository.save(created)
      return {
        data: { type: new TypePresenter(type) }
      }
    }catch(error){
      if(error.response) throw new HttpException(error.response,error.status)
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async findAll(query) {
    try{
      const { limit, offset, keyword = ''} = query;
      const types = await this.typeBusinessRepository.find({
        where: keyword ? { name: Like(`%${keyword}%`) } : {},
        take: limit,
        skip: offset,
      })
      const listeTypes = types.map( (type) => new TypePresenter(type) )
      const totalItems = listeTypes.length
      return { 
        data: {
          types: listeTypes,
          totalItems: totalItems
        } 
      }
    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findOne(id: number) {
    try{
      const type = await this.typeBusinessRepository.findOne({ 
        where: {
          id
        }
      })
      if(type){
        return { 
          data: { type: new TypePresenter(type) }
        }
      }
      throw new HttpException(
        {
          message: 'L’identifiant du type n’existe pas.'
        },
        HttpStatus.NOT_FOUND,
      );
    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async update(id: number, updateTypeBusinessDto: UpdateTypeBusinessDto) {
    try{
      const type = await this.typeBusinessRepository.findOneBy({id})
      if(type){
        const updated = await this.typeBusinessRepository.update(id, updateTypeBusinessDto)
        if(updated.affected){
          const updatedType = await this.typeBusinessRepository.findOneBy({id})
          return { 
            data: { type: new TypePresenter(updatedType) },
            message: 'Mise à jour effectuée avec succès'
          }
        }else{
          throw new HttpException('Aucune modification apportée.', HttpStatus.NOT_MODIFIED)
        }
        
      }
      throw new HttpException(
        {
          errors: {
            message: 'L’identifiant du type n’existe pas.'
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
      const type = await this.typeBusinessRepository.findOneBy({id})
      let errors = []
      if(type){
        const deleted = await this.typeBusinessRepository.delete(id);
        
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
        // throw new HttpException('Une erreur inattendue est survenue. Veuillez réessayer plus tard.', HttpStatus.BAD_REQUEST)
      }
      
      throw new HttpException(
        {
          errors: {
            message: 'L’identifiant du type n’existe pas.'
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
