import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Profitable } from 'src/infrastructure/entities/profitable.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProfitableService {

  constructor(
    @Inject('PROFITABLE_REPOSITORY') 
    private profitableRepository: Repository<Profitable>,
  ){}

  async addProfitable(createUserDto){
    try {
      const profitableData = {
        studentCard: createUserDto.studentCard,
      }
      const createdProfitable = await this.profitableRepository.create(profitableData)
      const profitable = await this.profitableRepository.save(createdProfitable)
      return profitable;

    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);

      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
  
  async update(id: number, profitable_data) {
    try {
      
      await this.profitableRepository.update(id, profitable_data)
      const profitable = await this.profitableRepository.findOneBy({id})
      await this.profitableRepository.save(profitable)
      return profitable;

    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);

      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
