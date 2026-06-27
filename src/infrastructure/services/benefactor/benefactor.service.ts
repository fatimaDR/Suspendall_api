import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Benefactor } from 'src/infrastructure/entities/benefactor.entity';
import { format } from 'date-fns';
@Injectable()
export class BenefactorService {

  constructor(
    @Inject('BENEFACTOR_REPOSITORY') 
    private benefactorRepository: Repository<Benefactor>,
  ){}

  async addBenefactor(createUserDto){
    try {

      const benefactorData = {
        isCompany: createUserDto.isCompany,
        entreprise: '',
        sirenNumber: '',
        firstName: '',
        lastName: '',
        birthday: '',
      } 

      if (createUserDto.isCompany) {
        if (createUserDto.entreprise) {
          benefactorData.entreprise = createUserDto.entreprise;
        }
        if (createUserDto.sirenNumber) {
          benefactorData.sirenNumber = createUserDto.sirenNumber;
        }
      }else {
        if (createUserDto.firstName) {
          benefactorData.firstName = createUserDto.firstName;
        }
        if (createUserDto.lastName) {
          benefactorData.lastName = createUserDto.lastName;
        }
        if (createUserDto.birthday) {
          benefactorData.birthday = createUserDto.birthday;
        }
        // benefactorData.firstName = createUserDto.firstNam
        // benefactorData.lastName = createUserDto.lastName
        // benefactorData.birthday = createUserDto.birthday
      }
      
      const createdBenefactor = await this.benefactorRepository.create(benefactorData)
      const benefactor = await this.benefactorRepository.save(createdBenefactor)
      return benefactor;

    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);

      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  findAll() {
    return `This action returns all benefactor`;
  }

  findOne(id: number) {
    return `This action returns a #${id} benefactor`;
  }

  async update(id: number, benefactor_data) {
    try {
      const benefactor = await this.benefactorRepository.findOneBy({id})
      
      if (benefactor.isCompany) {
        console.log(benefactor.isCompany)
        if (benefactor_data.email) benefactor.user.email = benefactor_data.email
        if(benefactor_data.password) benefactor.user.password = benefactor_data.password
        if(benefactor_data.addresse)  benefactor.user.addresse = benefactor_data.addresse
        if(benefactor_data.categoriSocioPro) benefactor.user.category = benefactor_data.categoriSocioPro
        if(benefactor_data.entreprise) benefactor.entreprise = benefactor_data.entreprise
        if(benefactor_data.sirenNumber) benefactor.sirenNumber = benefactor_data.sirenNumber

      } 
      if(!benefactor.isCompany) {
        console.log(benefactor.isCompany)
        if (benefactor_data.firstName) benefactor.user.firstName = benefactor_data.firstName
        if(benefactor_data.lastName) benefactor.user.lastName = benefactor_data.lastName
        if (benefactor_data.email) benefactor.user.email = benefactor_data.email
        if(benefactor_data.password) benefactor.user.password = benefactor_data.password
        if(benefactor_data.addresse)  benefactor.user.addresse = benefactor_data.addresse
        if(benefactor_data.birthday) benefactor.user.birthday = benefactor_data.birthday
        if(benefactor_data.categoriSocioPro) benefactor.user.category = benefactor_data.categoriSocioPro
      }

      await this.benefactorRepository.update(id, benefactor)
      const benefactorCreated = await this.benefactorRepository.findOneBy({id})
      await this.benefactorRepository.save(benefactorCreated)
      return benefactorCreated;

    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);

      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  remove(id: number) {
    this.benefactorRepository.delete(id);
  }
}
