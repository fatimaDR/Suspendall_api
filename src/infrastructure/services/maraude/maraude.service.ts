import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateMaraudeDto } from '../../controllers/maraude/dto/create-maraude.dto';
import { UpdateMaraudeDto } from '../../controllers/maraude/dto/update-maraude.dto';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { Maraude } from 'src/infrastructure/entities/maraude.entity';
import { MaraudePresenter } from 'src/infrastructure/controllers/maraude/maraudes.presenter';
import { Business } from 'src/infrastructure/entities/business.entity';
import { User } from 'src/infrastructure/entities/user.entity';
import { Association } from 'src/infrastructure/entities/association.entity';
import { Role } from 'src/auth/role.enum';
import { Partner } from 'src/infrastructure/entities/partner.entity';
import { MediaService } from '../media/media.service';
import { ProductMaraude } from 'src/infrastructure/entities/productMaraude.entity';
import { CreateProductDto } from 'src/infrastructure/controllers/product/dto/create-product.dto';
import { Product } from 'src/infrastructure/entities/product.entity';
import { Media, MediaType } from 'src/infrastructure/entities/media.entity';
import { ProductPresenter } from 'src/infrastructure/controllers/product/products.presenter';

@Injectable()
export class MaraudeService {
  constructor(
    @Inject('MARAUDE_REPOSITORY') 
    private maraudeRepository: Repository<Maraude>,
    @Inject('USER_REPOSITORY') 
    private userRepository: Repository<User>,
    @Inject('ASSOCIATION_REPOSITORY') 
    private associationRepository: Repository<Association>,
    @Inject('BUSINESS_REPOSITORY') 
    private businessRepository: Repository<Business>,
    @Inject('PARTNER_REPOSITORY') 
    private partnerRepository: Repository<Partner>,

    @Inject('PRODUCT_REPOSITORY') 
    private productRepository: Repository<Product>,
    
    @Inject('PRODUCT_MARAUDE_REPOSITORY') 
    private productMaraudeRepository: Repository<ProductMaraude>,
    @Inject('MEDIA_REPOSITORY') 
    private mediaRepository: Repository<Media>,

    private mediaService: MediaService,

  ){}
  
  async create(createMaraudeDto: CreateMaraudeDto, userId, file) {
    
    try {
      
      const user = await this.userRepository.findOne({ 
        where: { id: userId},
      });
      const roles = [Role.Association, Role.Admin];
      if(roles.indexOf(user.role) > -1) {
        const maraudeCreated =  await this.maraudeRepository.create(createMaraudeDto);
        const business = await this.businessRepository.findOne({
          where: { id:  createMaraudeDto.businessId, isActive: true},
        });
        if (createMaraudeDto.businessId) {
          maraudeCreated.business = business;
        }
        maraudeCreated.user = user;
        maraudeCreated.media = [];
        const partner = await this.partnerRepository.findOne({
          where: { id: createMaraudeDto.partnerId },
        });
        if (createMaraudeDto.partnerId) {
          // Assign the partner to the maraudeCreated entity
          maraudeCreated.partner = partner;
        }
        maraudeCreated.endDate = new Date(createMaraudeDto.endDate);
        const maraude = await this.maraudeRepository.save(maraudeCreated);
        // Add Maraude photo
        if (file) {
          const media = await this.mediaService.createMedia(maraude.id, "MARAUDE", MediaType.Cover, file);
          maraude.media.push(media)
        }
        
        return { 
          data: { maraude: new MaraudePresenter(maraude)  } 
        };
      }
      
      throw new HttpException(
        {
          errors: {
            message: 'L’utilisateur demandé est introuvable. Veuillez vérifier les informations fournies.'
          }
        },
        HttpStatus.NOT_FOUND,
      );
      
    } catch (error) {
      if (error.response) throw new HttpException(error.message, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
    
  }

//   async addProduct(maraudeId: number, createProductDto: CreateProductDto){
//     try {
//       const maraude = await this.maraudeRepository.findOne({ 
//         where: { id: maraudeId},
//         relations: ['productMaraude', 'media'] 
//       });
  
//       const product = await this.productRepository.create(createProductDto);
//       const productCreated = await this.productRepository.save(product);
  

//       if (maraude && productCreated) {

//         const productMaraude = await this.productMaraudeRepository.create();

//         productMaraude.product = productCreated;
//         productMaraude.quantity = 12;
//         productMaraude.maraude = maraude;
//         const productMaraudeSaved = await this.productMaraudeRepository.save(productMaraude);

//         if (productMaraudeSaved) {
//           return { data: { product:  new ProductPresenter(product) } };
//         }
//       }
      
//       throw new HttpException(
//         {
//           message: "L’identifiant de la maraude ou du produit est introuvable."
//         },
//         HttpStatus.NOT_FOUND
//       );

//     } catch (error) {
//       if (error.response) throw new HttpException(error.response, error.status);
//       throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
//     }   
   
// }

  async findAll() {

    try {
      // const maraude = await this.maraudeRepository.find();
      let maraudes = []
      maraudes = await this.maraudeRepository.createQueryBuilder('maraude')
      .leftJoinAndSelect('maraude.user','user')
      .leftJoinAndSelect('user.city','city')
      .leftJoinAndSelect('maraude.media','maraudeMedia')
      .leftJoinAndSelect('maraude.business','maraudeBusiness')
      .leftJoinAndSelect('maraude.partner','maraudePartner')
      .where('user.isVerified = true')
      .andWhere('maraudeBusiness.isActive = true')
      .andWhere('maraude.endDate >= CURRENT_DATE')
      .orderBy('maraude.id')
      .getMany()
      return {
        data: {
          maraudes: maraudes.map(
            (maraude) => new MaraudePresenter(maraude),
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
      const maraude = await this.maraudeRepository.findOne({ 
        where: [
          { id: id ,
            endDate: MoreThanOrEqual(new Date())  
          }
        ] ,
        relations: ['media', 'business', 'partner']
      });
      if (!maraude) {
        throw new HttpException(
          {
            errors: {
              maraude_id: 'maraude id does not exist'
            }
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return { 
        data: {
          maraude: new MaraudePresenter(maraude)
        } 
      };

    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
    
  }

  async update(id: number, updateMaraudeDto: UpdateMaraudeDto) {
    try {
      const existedMaraude = await this.maraudeRepository.findOne({ where: { id: id }});
      if (!existedMaraude) {
        throw new HttpException(
          {
            errors: {
              massage: 'maraude id does not exist'
            }
          },
          HttpStatus.NOT_FOUND,
        );
      }else {
        await this.maraudeRepository.update(id, updateMaraudeDto);
        const getMaraude = await this.maraudeRepository.findOne({
          where: { id: id },
          relations: ['media', 'business', 'partner']
        });
        return { 
          data: {
            Maraude: new MaraudePresenter(getMaraude) }
          }
      };

    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async remove(id: number) {
    try {
      const maraude = await this.maraudeRepository.findOne({where: { id: id }});

      if (maraude) {
       await this.maraudeRepository.delete(id);
        return { message: `La maraude n°${id} a été supprimée.`  }
      }

      throw new HttpException({
        message: "Une erreur inattendue est survenue. Veuillez réessayer plus tard."
      }, HttpStatus.NOT_FOUND)

    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async addMedia(maraudeId: number, id: number, type: MediaType, file){
    try {
     
      const maraude = await this.maraudeRepository.findOne({
        where: { id: maraudeId},
        relations: ['productMaraude', 'media', 'business', 'partner']
      });
      
      if (file && maraude.user.id === id) {
        const media = await this.mediaService.createMedia(maraude.id, "MARAUDE", type, file);
        maraude.media.push(media)
        return { 
          data: {
            Maraude: new MaraudePresenter(maraude) }
          }
      }

      throw new HttpException({
        message: "L’identifiant du fichier ou de la maraude n’existe pas."
      }, HttpStatus.NOT_FOUND)

    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
