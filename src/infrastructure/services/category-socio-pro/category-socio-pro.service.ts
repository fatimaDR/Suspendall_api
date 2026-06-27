import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateCategorySocioProDto } from '../../controllers/category-socio-pro/dto/create-category-socio-pro.dto';
import { UpdateCategorySocioProDto } from '../../controllers/category-socio-pro/dto/update-category-socio-pro.dto';
import { ILike, Like, Repository } from 'typeorm';
import { CategorySocioPro } from 'src/infrastructure/entities/category-socio-pro.entity';
import { CategorySocioProPresenter } from 'src/infrastructure/controllers/category-socio-pro/categorySocioPro.presenter';

@Injectable()
export class CategorySocioProService {

  constructor(
    @Inject('CategorySocioPro_REPOSITORY')
    private readonly categorySocioProRepository: Repository<CategorySocioPro>,

  ){}

  async create(createCategorySocioProDto: CreateCategorySocioProDto) {
    try{
      const existed = await this.categorySocioProRepository.exist({
        where: {
          name: createCategorySocioProDto.name
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
      const created = await this.categorySocioProRepository.create(createCategorySocioProDto)
      const categorySocioPro = await this.categorySocioProRepository.save(created)
      return {
        data: { category: new CategorySocioProPresenter(categorySocioPro) }
      }
    }catch(error){
      if(error.response) throw new HttpException(error.response,error.status)
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async findAll(query) {
    try{
      const { limit, offset, keyword = '', type } = query;
      const where: any = {};

      if (keyword) {
        where.name = ILike(`${keyword}%`); 
      }

      if (type) {
        where.type = type;
      }
      const catCount =  await this.categorySocioProRepository.find()
      const cats = await this.categorySocioProRepository.find({
        where,
        take: limit,
        skip: offset,
        order: {
        createdAt: 'DESC'},
      })
      const totalItems = catCount.length

      const categoriesSocioPro = cats.map( (category) => new CategorySocioProPresenter(category) )
      return { 
        data: {
          categories: categoriesSocioPro,
          totalItems: totalItems
        } 
      }
    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  findOne(id: number) {
    return `Cette action renvoie la catégorie socio-pro n°${id}.`;
  }

  async update(id: number, updateCategorySocioProDto: UpdateCategorySocioProDto) {
    try{
      const categorySocioPro = await this.categorySocioProRepository.findOneBy({id})
      if(categorySocioPro){
        const updated = await this.categorySocioProRepository.update(id, updateCategorySocioProDto)
        if(updated.affected){
          const updatedCategorySocioPro = await this.categorySocioProRepository.findOneBy({id})
          return { 
            data: { category_socio_professionnelle: new CategorySocioProPresenter(updatedCategorySocioPro) },
            message: 'updated'
          }
        }else{
          throw new HttpException('Aucune modification apportée.', HttpStatus.NOT_MODIFIED)
        }
        
      }
      throw new HttpException(
        {
          errors: {
            message: 'L’identifiant de la catégorie n’existe pas.'
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
      const categorySocioPro = await this.categorySocioProRepository.findOneBy({id})
      let errors = []
      if(categorySocioPro){
        const deleted = await this.categorySocioProRepository.delete(id);
        
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
            message: 'L’identifiant de la catégorie n’existe pas.'
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
