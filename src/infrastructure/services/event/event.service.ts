import { HttpException, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateEventDto } from '../../controllers/event/dto/create-event.dto';
import { UpdateEventDto } from '../../controllers/event/dto/update-event.dto';
import { Event } from 'src/infrastructure/entities/event.entity';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { length } from 'class-validator';
import { Partner } from 'src/infrastructure/entities/partner.entity';
import { EventPresenter } from 'src/infrastructure/controllers/event/event.presenter';
import { MediaService } from '../media/media.service';
import { Product } from 'src/infrastructure/entities/product.entity';
import { CreateProductDto } from 'src/infrastructure/controllers/product/dto/create-product.dto';
import { ProductEvent } from 'src/infrastructure/entities/productEvent.entity';
import { ProductEventPresenter } from 'src/infrastructure/controllers/productEvent/productEvent.presenter';
import { MediaType } from 'src/infrastructure/entities/media.entity';

@Injectable()
export class EventService {
  constructor(
    @Inject('EVENT_REPOSITORY') 
    private eventRepository: Repository<Event>,
    @Inject('PARTNER_REPOSITORY') 
    private partnerRepository: Repository<Partner>,
    @Inject('PRODUCT_REPOSITORY') 
    private productRepository: Repository<Product>,
    @Inject('PRODUCT_EVENT_REPOSITORY') 
    private productEventRepository: Repository<ProductEvent>,
    
    private mediaService: MediaService,
  ){}

  async create(createEventDto: CreateEventDto, file) {
    try {
      const createEvent = await this.eventRepository.create(createEventDto);
      createEvent.partners = []
      for (const partnerId of createEventDto.partnerIds) {
        const partner = await this.partnerRepository.findOne({ where: {id: partnerId}});
        if (partner) {
          createEvent.partners.push(partner);
        }
      }
      
      createEvent.endDate = new Date(createEventDto.endDate);
      createEvent.media = []
      const event = await this.eventRepository.save(createEvent);

      // Add Event photo
      if (file) {
        const media = await this.mediaService.createMedia(event.id, "EVENT", MediaType.Cover, file);
        event.media.push(media)
      }

      return {
        data: {
          event: new EventPresenter(event)
        }
      }

    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

//   async addProduct(eventId: number, createProductDto: CreateProductDto){
//     try {
//       const event = await this.eventRepository.findOne({ 
//         where: { id: eventId},
//         relations: ['productEvent'] 
//       });
  
//       const product = await this.productRepository.create(createProductDto);
//       const productCreated = await this.productRepository.save(product);
      
//       const productEvent = await this.productEventRepository.create();
//       productEvent.product = productCreated;
//       productEvent.quantity = 12;
//       productEvent.event = event;
//       const productEventSaved = await this.productEventRepository.save(productEvent);
  
//       if (productEventSaved) {
//         return { 
//           data: {
//             product_event:  new ProductEventPresenter(productEventSaved) }
//           };
//       }

//       throw new HttpException(
//         {
//           message: "event id not found"
//         },
//         HttpStatus.NOT_FOUND
//       );

//     } catch (error) {
//       if (error.response) throw new HttpException(error.response, error.status);
//       throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
//     }   
   
// }

  async findAll() {
    try{
      const events = await this.eventRepository.find({
        where: {
          endDate: MoreThanOrEqual(new Date())
        },
        relations: ['media', 'productEvent.product', 'partners']
      })
      return {
        data: { events: events.map((event) => new EventPresenter(event))}
      }
    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }  
  }

  async findOne(id: number) {
    try{
      const event = await this.eventRepository.findOne({
        where: {id: id},
        relations: ['media', 'productEvent.product', 'partners']
      })
      if(!event) { 
        throw new HttpException(
          {
            message: "Événement non trouvé avec cet identifiant."
          },
          HttpStatus.NOT_FOUND
        );
      }
      return {
        data: { event: new EventPresenter(event) }
      }
    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    } 
  }

  async update(id: number, updateEventDto: UpdateEventDto) {
    try{
      const event = await this.eventRepository.findOneBy({id})
      if(event){
        updateEventDto.endDate = new Date(updateEventDto.endDate);
        const updated = await this.eventRepository.update(id, updateEventDto)
        if(updated.affected){
          const updated_event = await this.eventRepository.findOne({
            where: {id},
            relations: ['media', 'productEvent.product', 'partners']
          })
          return { 
            data: { event: new EventPresenter(updated_event) },
            message: 'Mise à jour effectuée avec succès.'
          }
        }else{
          // throw new HttpException('Aucune modification apportée.', HttpStatus.NOT_MODIFIED)
          throw new HttpException(
            {
              message: "not modified"
            },
            HttpStatus.NOT_MODIFIED
          );
        }
        
      }
      throw new HttpException(
        {
          message: "Événement non trouvé avec cet identifiant."
        },
        HttpStatus.NOT_FOUND
      );

    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);

      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async remove(id: number) {
    try{
      const event = await this.eventRepository.findOne({
        where: {id},
        relations: ['partners']
      })
      if(!event){
        throw new HttpException(
          {
            message: "Événement non trouvé avec cet identifiant."
          },
          HttpStatus.NOT_FOUND
        );
      } 

      event.partners = null
      await this.eventRepository.save(event)
      const deleted = await this.eventRepository.delete(event.id)
      let errors = []
      if(deleted.affected){
        return {
          message: 'event deleted successfully'
        }
      }else {
        errors.push({
          field: 'delete',
          message: 'not deleted'
        });
      
        throw new HttpException(
          {
            message: "",
            errors: errors
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    } 
  }
}
