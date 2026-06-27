import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Association } from 'src/infrastructure/entities/association.entity';
import { Repository } from 'typeorm';


@Injectable()
export class AssociationService {
  constructor(
    @Inject('ASSOCIATION_REPOSITORY') 
    private associationRepository: Repository<Association>,
  ){}

  async addAssociation(createUserDto){
    try {
      const associationData = {
        sirenNumber: createUserDto.sirenNumber, 
        phone: createUserDto.phone
      }
      const createdAssociation = await this.associationRepository.create(associationData)
      const association = await this.associationRepository.save(createdAssociation)
      return association;

    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);

      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async update(id: number, association_data) {
    try {
      
      await this.associationRepository.update(id, association_data)
      const object = await this.associationRepository.findOneBy({id})
      await this.associationRepository.save(object)
      return object;

    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);

      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

}
