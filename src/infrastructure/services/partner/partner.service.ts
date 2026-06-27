import { HttpException, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePartnerDto } from '../../controllers/partner/dto/create-partner.dto';
import { UpdatePartnerDto } from '../../controllers/partner/dto/update-partner.dto';
import { Repository } from 'typeorm';
import { Partner } from 'src/infrastructure/entities/partner.entity';
import { PartnerPresenter } from 'src/infrastructure/controllers/partner/partner.presenter';
// import { map } from 'rxjs';

@Injectable()
export class PartnerService {

  constructor(
    @Inject('PARTNER_REPOSITORY') 
    private partnerRepository: Repository<Partner>,

  ){}

  async create(createPartnerDto: CreatePartnerDto) {
    try {
      const partner = await this.partnerRepository.create(createPartnerDto);
      const partnerCreated = await this.partnerRepository.save(partner);
      let errors = []
      if (!partnerCreated) {
        errors.push({
          field: 'partner create',
          message: 'partner not cretead'
        });
      
        throw new HttpException(
          {
            message: "",
            errors: errors
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      
      return { 
        data: {
          partner: new PartnerPresenter(partnerCreated)
          }
      };

    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
    
  }

  async findAll() {
    try {
      const partners = await this.partnerRepository.find();

      return {
        data: {
          partners: partners.map(
            (partner) => new PartnerPresenter(partner),
          ),
        },
      };

    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findOne(id: number) {
    try {
      const partner = await this.partnerRepository.findOne({ where: { id: id }});
      if (!partner) {
        throw new HttpException(
          {
            errors: {
              message: 'partner id does not exist'
            }
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return { 
        data: {
          partner: new PartnerPresenter(partner) 
        }
      }

    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async update(id: number, updatePartnerDto: UpdatePartnerDto) {
    try {
      const existPartner = await this.partnerRepository.findOne({where: { id: id }});
      if (!existPartner) {
        throw new HttpException(
          {
            errors: {
              message: 'partner id does not exist'
            }
          },
          HttpStatus.NOT_FOUND,
        );
      }else{
        await this.partnerRepository.update(id, updatePartnerDto);
        const partner = await this.partnerRepository.findOne({where: { id: id }});
        return { 
          data: {
            partner: new PartnerPresenter(partner) }
          } ;
      }
      
    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async remove(id: number) {
    try {
      
      const partner = await this.partnerRepository.findOne({where: { id: id }});
      if(partner){
        await this.partnerRepository.delete(id);
        return { message: `partner ${id} deleted`  }
      }
      
      throw new HttpException(
        {
          errors: {
            message: 'partner id does not exist'
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
