import { HttpException, HttpStatus, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import {  Brackets, ILike, Like, Repository } from 'typeorm';
import { Business } from 'src/infrastructure/entities/business.entity';
import { BusinessPresenter } from 'src/infrastructure/controllers/business/business.presenter';
import { Category } from 'src/infrastructure/entities/category.entity';
import { MailService } from 'src/mail/mail.service';
import { User } from 'src/infrastructure/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { MediaService } from '../media/media.service';
import { MediaPresenter } from 'src/infrastructure/controllers/media/media.presenter';
import { Product } from 'src/infrastructure/entities/product.entity';
import { CreateProductDto } from 'src/infrastructure/controllers/product/dto/create-product.dto';
import { generateBusinessQRCode, generatePassword, getBusinessDistance } from 'src/functions/functions';
import { CategoryService } from '../category/category.service';
import { Feedback } from 'src/infrastructure/entities/feedback.entity';
import { SuspenduPresenter } from 'src/infrastructure/controllers/stock/SuspenduPresenter';
import { SubCategory } from 'src/infrastructure/entities/sub-category.entity';
import { Tag } from 'src/infrastructure/entities/tag.entity';
import { count } from 'console';
import { Stock } from 'src/infrastructure/entities/stock.entity';
import { Reservation } from 'src/infrastructure/entities/reservation.entity';
import { FeedbackPresenter } from 'src/infrastructure/controllers/feedback/feedbacks.presenter';
import { ProductPresenter } from 'src/infrastructure/controllers/product/products.presenter';
import { ReservationService } from '../reservation/reservation.service';
import { OpeningHour } from 'src/infrastructure/entities/opening-hour.entity';
import { Order } from 'src/infrastructure/entities/order.entity';
import { OrderPresenter } from 'src/infrastructure/controllers/oder/order.presenter';
import { startOfMonth, startOfWeek } from 'date-fns';
import { OrderOfBusinessPresenter } from 'src/infrastructure/controllers/oder/orderOfBusiness.presenter';
import * as dayjs from 'dayjs';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';


@Injectable()
export class BusinessService {
  
  constructor(
    @Inject('BUSINESS_REPOSITORY')
    private businessRepository: Repository<Business>,

    @Inject('SUB_CATEGORY_REPOSITORY') 
    private subCategoryRepository: Repository<SubCategory>,

    private mailService: MailService,
    
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
    
    private mediaService: MediaService,

    @Inject('PRODUCT_REPOSITORY') 
    private productRepository: Repository<Product>,

    @Inject(forwardRef(() => CategoryService))
    private categoryService: CategoryService,

    @Inject('TAG_REPOSITORY') 
    private tagRepository: Repository<Tag>,

    @Inject('STOCK_REPOSITORY')
    private stockRepository: Repository<Stock>,

    @Inject('OPENING_HOURS_REPOSITORY')
    private openingHoursRepository: Repository<OpeningHour>,

    @Inject('RESERVATION_REPOSITORY') 
    private reservationRepository: Repository<Reservation>,

    @Inject('ORDER_REPOSITORY')
    private readonly orderRepository: Repository<Order>,

    private reservationService: ReservationService,

    private jwtService: JwtService,

  ){}

  async addMedia(id, type, file){
    try{
      let errors = []
      if (file) {
        const user = await this.userRepository.findOne({
          where: {id},
          relations: ['business.media']
        })
        let media
        const existed_media = await user.business.media.filter((media) => {
          return media.type == type
        })

        if(existed_media.length > 0){
          media = await this.mediaService.updateMedia(existed_media[0].id, file)
        }else{
          media = await this.mediaService.createMedia(user.business.id, "BUSINESS", type, file)
        }
          
        return {
          data: { media: (media) ? new MediaPresenter(media) : {}}
        }
      }
      errors.push({
        field: 'file',
        message: 'Le fichier est requis.'
      });
    
      throw new HttpException(
        {
          message: "",
          errors: errors
        },
        HttpStatus.BAD_REQUEST,
      );
      // throw new HttpException('La requête est incorrecte ou mal formée.', HttpStatus.BAD_REQUEST)

    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async addBusiness(createUserDto){
    try {
      let subCategory;
      // let subCategories = []
      if(createUserDto.subCategory){
        // for(let subCatId of createUserDto.subCategories){
        subCategory = await this.subCategoryRepository.findOneBy({
          id: createUserDto.subCategory,
        });
        if (!subCategory) {
          throw new HttpException(
          {
            message: "L’identifiant de la sous-catégorie n’existe pas."
          },
          HttpStatus.NOT_FOUND);
        }
        // subCategories.push(subCategory)
        // } 
      }

      const businessData = {
        description: createUserDto.description, 
        address: createUserDto.address, 
        type: createUserDto.type, 
        sirenNumber: createUserDto.sirenNumber,
        socialRaison: createUserDto.socialRaison,
        name: createUserDto.name,
        rib: createUserDto.rib,
        iban: createUserDto.iban,
        latitude: parseFloat(createUserDto.latitude) ? createUserDto.latitude : "", 
        longitude: parseFloat(createUserDto.longitude) ? createUserDto.longitude : ""
      }
      const createdBusiness = await this.businessRepository.create(businessData)
      createdBusiness.subCategory = subCategory
      // createdBusiness.subCategories = subCategories
      const business = await this.businessRepository.save(createdBusiness)
      return business ;

    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async update(id: number, business_data) {
    try {
      let subCategory;
      const { ...updatedData } = business_data;

      if(business_data.subCategory){
        subCategory = await this.subCategoryRepository.findOneBy({
          id: business_data.subCategory,
        });
        if (!subCategory) {
          throw new HttpException(
          {
            message: "L’identifiant de la sous-catégorie n’existe pas."
          },
          HttpStatus.NOT_FOUND);
        }

        updatedData.subCategory = subCategory
      }

      updatedData.rib = business_data.rib;
      updatedData.iban = business_data.iban;

      await this.businessRepository.update(id, updatedData)
      const object = await this.businessRepository.findOne({
        where: {
          id: id
        },
        relations: ['user', 'subCategory', 'type']
      })
      // object.subCategory = subCategory
      await this.businessRepository.save(object)
      return new BusinessPresenter(object) ;

    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);

      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async validateAccount(id: number){
    try{
      const business = await this.businessRepository.findOne({
        where: {id: id},
        relations: ['user', 'subCategory']
      });
      console.log(business)
      if(business){
        business.isActive = true;
        business.user.isVerified = true;
        const password = await generatePassword(8)
        const salt = await bcrypt.genSalt();
        const hashed_password = await bcrypt.hash(password, salt);
        business.user.password = hashed_password;

        await this.businessRepository.save(business)
        await this.userRepository.save(business.user)
        const mail_template = "validate-account";
        const context = {
          password: password,
          appName: 'Suspendall',
        };
        this.mailService.send_mail(
          business.user.email,
          "Validation de votre compte",
          context,
          mail_template
        )
        console.log(business)
        // process.exit()
        return {
          message: "Le commerce a été validé avec succès.",
          business: new BusinessPresenter(business)
        }
      }
      throw new HttpException(
        {
          message: "Le commerce demandé est introuvable."
        },
        HttpStatus.NOT_FOUND
      );
      
    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findBusinessesAroundMe(query){
   
    let businesses = []
    let data = []
    let subCats = []
    if(parseFloat(query.lat) && parseFloat(query.lng)){
      if (query.subCategories) {
        for (let subCat_id of query.subCategories) {
          const subCat = await this.subCategoryRepository.findOneBy({id: subCat_id})
          
          subCats.push(subCat);
        }
        businesses = await this.businessRepository.find({
          where: {
            subCategory: subCats,
            user: {isVerified: true},
            isActive: true
          },
          relations: ['subCategories', 'user', 'media', 'products'],
        })  
      }else{
        businesses = await this.businessRepository.createQueryBuilder('business')
          .leftJoinAndSelect('business.user','user')
          .leftJoinAndSelect('user.city','city')
          .leftJoinAndSelect('business.media','businessMedia')
          .leftJoinAndSelect('business.subCategory','businessSubCategory')
          // .addSelect(`6371 * acos(cos(radians(${query.lat})) * cos(radians(business.latitude)) * cos(radians(${query.lng}) - radians(business.longitude)) + sin(radians(${query.lat})) * sin(radians(business.latitude)))`,'distance')
          .where('user.isVerified = true')
          .andWhere('business.isActive = true')
          // .having(`distance <=${query.distance ? query.distance : 20 }`)
          // .orderBy('distance')
          .getMany()  
      }
      for (const business of businesses) {
        const distance = getBusinessDistance(query, business);
        const feedbacks = await this.getAverageFeedbacks(business.id);
        const lowestPrice = business.products.reduce((prev, current) =>
          prev.price < current.price ? prev : current
        );  
        const the_distance = query.distance ? query.distance : 20
        if (distance <= the_distance) {
          data.push({
            ...new BusinessPresenter(business),
            distance: distance,
            averageRating: feedbacks,
            price: lowestPrice.price
          })
        }
      }
      return {
        data: { businesses: data }
      }
    } 
  }

  async businessActiveted(businessId: number) {
    try {
      const business = await this.businessRepository.findOne({
        where: {
          id: businessId,
        }
      });

      if (!business) {
        throw new HttpException(
          {
            message: 'Le commerce demandé est introuvable.'
          },
          HttpStatus.NOT_FOUND,
        );
      }
      let message = "";
      if (!business.isActive) {
        business.isActive = true; 
        message = "Le commerce a été activé avec succès.";
      } else {
        business.isActive = false; 
        message = "Le commerce a été désactivé avec succès.";
      }
  
      // Save the updated business entity, including the isActive property
      await this.businessRepository.save(business);
      
      return {
        message: message,
        data: { business: new BusinessPresenter(business) }
      }

    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async addProducts(createProductDto: CreateProductDto, userId: number){
    try {

      const business = await this.businessRepository.findOne({
        where: {
          user: {id: userId} 
        },
        relations: ['user', 'subCategory', 'products', 'media']
      });

      let errors = []
      if (!business) {
        errors.push({
          field: 'business id',
          message: 'Impossible de lire les propriétés'
        });
      }

      if (business.user.id === userId && business) {
        // Vérifier si le nombre de produits atteint la limite
        const hasReachedLimit = business.isProductLimited && business.products.length >= 1;
        if (hasReachedLimit) {
          throw new HttpException(
          {
            errors: [
              {
                field: 'products',
                message:
                  'Vous avez atteint le nombre de produits actuellement autorisé. Pour ajouter d\'autres produits, veuillez contacter l\'administrateur afin d\'augmenter votre limite.',
              },
            ],
          },
          HttpStatus.BAD_REQUEST,
          );
        }
        const subCategory = createProductDto.subCategory ? await this.subCategoryRepository.findOne({ where: { id: createProductDto.subCategory } }) : undefined;

        const product = this.productRepository.create({
          ...createProductDto,
          subCategory,
        });
        // const product = await this.productRepository.create(createProductDto);

        if (createProductDto.tags) {
          const tags: Tag[] = await this.tagRepository.findByIds(
            createProductDto.tags,
          );
          product.tags.push(...tags);
        }
        const productCreated = await this.productRepository.save(product);
        const getProduct = await this.productRepository.findOne({ 
          where: {id: productCreated.id},
          relations: ['subCategory.category']
        });
        if (!getProduct) {
          errors.push({
            field: 'product',
            message: 'Le produit n\'a pas été créé.'
          });
        }
        business.products.push(getProduct) ;

        if (business.products.length === 1 && business.isProductLimited === false) {
          business.isProductLimited = true;
        }
        
        const businessProduct = await this.businessRepository.save(business);
        if (businessProduct) {
          return {
            data: {
              product: new ProductPresenter(getProduct)
            },
            message: "Le produit a été créé avec succès."
          }
        }
      }
      
      throw new HttpException(
        {
          message: "",
          errors: errors
        },
        HttpStatus.BAD_REQUEST,
      );
    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  remove(id: number) {
    this.businessRepository.delete(id);
  }

  // Search of business by name or subcategory
  async findAll(data, userId: number) {
    try {
      const user = await this.userRepository.findOneBy({ id: userId})
      const {
        keyword, offset, limit, lat, lng, SW_lat, SW_lng, NE_lat, NE_lng, subCategories
      } = data
      let subCats = []
      if (subCategories) {
        if (typeof subCategories === 'string') {
          subCats = subCategories.split(',').map(Number);
        } else if (Array.isArray(subCategories)) {
          subCats = subCategories.map(Number);
        }
      }
      // if (subCategories) {
      //   for (let subCat_id of subCategories) {
      //     const subCat = await this.subCategoryRepository.findOneBy({id: subCat_id})
      //     if (subCat) {
      //       subCats.push(subCat);
      //     }
      //   }
      // }
      const queryBuilder = await this.businessRepository.createQueryBuilder('business')
        .leftJoinAndSelect('business.user','user')
        .leftJoinAndSelect('business.likes', 'likes')
        .leftJoinAndSelect('likes.user', 'userLike')
        .leftJoinAndSelect('user.city','city')
        .leftJoinAndSelect('business.media','businessMedia')
        .leftJoinAndSelect('business.products', 'businessProducts')
        .leftJoinAndSelect('businessProducts.media', 'productMedia')
        .leftJoinAndSelect('business.subCategory','businessSubCategory')
        .leftJoinAndSelect('business.openingHours','openingHours')
        .leftJoinAndSelect('openingHours.day','day')
        .leftJoinAndSelect('businessSubCategory.category','category')
        .leftJoinAndSelect('category.media','categoryMedia')
        .where('user.isVerified = true')
        .andWhere('business.isActive = true');

        if (subCats.length > 0) {
          // console.log(subCategories)
          // for(const subCatId of subCategories){
          //   subCats.push(subCatId)
          // }
          // queryBuilder.andWhere('businessSubCategory.id IN (:subCategories)', { subCategories: subCats });
          queryBuilder.andWhere('businessSubCategory.id IN (:...subCats)', { subCats });
        }

        if(SW_lat && SW_lng && NE_lat && NE_lng){

          const corners_coordinates = `${NE_lat} ${NE_lng}, ${NE_lat} ${SW_lng}, ${SW_lat} ${SW_lng}, ${SW_lat} ${NE_lng}, ${NE_lat} ${NE_lng}`
          queryBuilder.andWhere('ST_CONTAINS(ST_GEOMFROMTEXT(:polygon), POINT(business.latitude, business.longitude)) = 1', { polygon: `POLYGON((${corners_coordinates}))` });
        }
        if(keyword){
          console.log(keyword)
          queryBuilder.andWhere('(business.socialRaison Like :keyword )', { keyword: `%${keyword}%` })
        }
        const businesses = await queryBuilder.take(limit).skip(offset).getMany();
        
        let businessData = []
        let suspendedProducts
        for(const business of businesses) {
          const feedbacks = await this.getAverageFeedbacks(business.id)
          const distance = getBusinessDistance(data, business);
          // const the_distance = dist ? dist : 20
          if (user.role === 'PROFITABLE') {
            suspendedProducts = await this.calculateSuspendu(business.id)
          }
          let isFavorite = false;
          if (business.likes.length > 0) {
            for (const like of business.likes) {
              if (like.user.id === user.id) {
                isFavorite = true
                break;
              }
            }
          }
          businessData.push({
            ...new BusinessPresenter(business) ,
            averageRating: feedbacks,
            distance: distance,
            like: isFavorite,
            price: (business.products.length > 0) ? (business.products.reduce((prev, current) => prev.price < current.price ? prev : current)).price : 0,
            suspendedProducts: suspendedProducts
          })
          
          // if (user.role === 'PROFITABLE') {
          //   businessData.push({
          //     suspendedProducts: await this.calculateSuspendu(business.id)
          //   })
          // }
        }
        return {
          data: {
            businesses: businessData
          }
        } 
    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
   
  }

  async businessDetailsAdmin(businessId: number){
    
    try {
      let products = [];
      const business = await this.businessRepository.findOne(
        {
          where: { id: businessId},
          relations: ['user', 'subCategory', 'products', 'media', 'openingHours', 'feedbacks']
        }
      );

      if (!business) 
        throw new HttpException(
          {
            message: 'Le commerce demandé est introuvable.'
          },
          HttpStatus.NOT_FOUND,
        );

      products = business.products;
      return {
        data: { 
          business: new BusinessPresenter(business),
          nombre_produits: products.length
        }
      }
    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
      
  }

  async businessDetails(businessId: number, query, userId){
    
    const user = await this.userRepository.findOneBy({id: userId})
    let business 
    business = await this.businessRepository.createQueryBuilder('business')
      .leftJoinAndSelect('business.user','user')
      .leftJoinAndSelect('user.city','city')
      .leftJoinAndSelect('business.products','products')
      .leftJoinAndSelect('business.media','businessMedia')
      .leftJoinAndSelect('products.media', 'productMedia')
      .leftJoinAndSelect('business.subCategory','businessSubCategory')
      .leftJoinAndSelect('businessSubCategory.category', 'category')
      .leftJoinAndSelect('business.openingHours','businessOH')
      .where('user.isVerified = true')
      .andWhere('business.isActive = true')
      .andWhere(`business.id = ${businessId}`)
      .getOne()
    if (business) {
      const distance = getBusinessDistance(query, business)
      if (user.role === "PROFITABLE") {
        return {
          data: { 
            business: new BusinessPresenter(business),
            distance: distance,
            averageRating: await this.getAverageFeedbacks(business.id),
            suspendus: await this.calculateSuspendu(business.id)
          }
        }
      }else {
        return {
          data: { 
            business: new BusinessPresenter(business),
            distance: await distance,
            averageRating: await this.getAverageFeedbacks(business.id),
            price: (business.products.length > 0) ? (business.products.reduce((prev, current) => prev.price < current.price ? prev : current)).price : 0 
          }
        }
      }
      
    }
    throw new HttpException(
      {
        errors: {
          message: 'Le commerce demandé est introuvable.'
        }
      },
      HttpStatus.NOT_FOUND,
    );  
  }

  // access by profitable
  async listSuspendu(businessId){
    try {
      let suspendus = []
      const business = await this.businessRepository.findOne({
          where: { id: businessId},
          relations: ['suspendus.product.media']
        })
      
      if (!business) {
        throw new HttpException(
          {
            errors: {
              message: 'Le commerce demandé est introuvable.'
            }
          },
          HttpStatus.NOT_FOUND,
        );  
      }
      
      for (const suspendu of business.suspendus) {
        if (!(suspendu.quantity === 0)) {
          suspendus.push({
            ...new SuspenduPresenter(suspendu)
          })
        }
      }
      return {
        data: { suspendus : suspendus } 
      }
    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async getAverageFeedbacks(businessId: number){
    const business = await this.businessRepository.findOne({ 
      where: {
        id: businessId
      },
      relations: ['feedbacks']
    })
   
    if (business) {
      let feedbacks = []
      feedbacks = business.feedbacks
      if(feedbacks.length > 0) {
        const feedbacksSum = feedbacks.reduce((sum, feedback) => sum + feedback.note, 0);
        const average = feedbacksSum / feedbacks.length;

        return average;
      } 
      return 0; 
    }
    throw new HttpException(
      {
        errors: {
          message: 'Le commerce demandé est introuvable.'
        }
      },
      HttpStatus.NOT_FOUND,
    );  
  }

  // Liste suspendu non récupérer
  async calculateSuspendu(businessId: number) {
    const business = await this.businessRepository.findOne(
      {
        where: { id: businessId},
        relations: ['suspendus']
      }
    );

    if (!business) {
      throw new NotFoundException('Le commerce demandé est introuvable. Veuillez vérifier l’identifiant ou réessayer plus tard.');
    }
    const totalQuantity = business.suspendus.reduce((sum, suspendu) => sum + suspendu.quantity, 0);
    return totalQuantity;
  }

  async calculatePricePerWeekAndMonth(businessId: number) {
    try {
      const business = await this.businessRepository.findOne({
        where: {
          id: businessId,
        },
        relations: ['suspendus.product', 'suspendus.benefactor'] 
      });

      if (!business) {
        throw new HttpException(
          { errors: { message: 'Le commerce demandé est introuvable.' } },
          HttpStatus.NOT_FOUND,
        );
      }
      
      const now = dayjs();
      const startOfWeek = now.startOf('week').toDate(); // Lundi
      const endOfWeek = now.endOf('week').toDate();     // Dimanche
      const startOfMonth = now.startOf('month').toDate(); 

      let totalWeekPrice = 0;
      let totalMonthPrice = 0;
      let totlaPrice = 0;
      // business.suspendus.forEach(stock => {
      //   if (stock.createdAt >= oneWeekAgo) {
      //     console.log(oneWeekAgo)
      //     totalWeekPrice += stock.total ;
      //   }

      //   if (stock.createdAt >= oneMonthAgo) {
      //     console.log(oneMonthAgo)
      //     totalMonthPrice += stock.total;
      //   }

      //   totlaPrice+= stock.total;
      // });
      for (const stock of business.suspendus) {
        
        if (stock.benefactor !== null) {
          const price = stock.total  ;
          const createdAt = new Date(stock.createdAt);

          if (createdAt >= startOfWeek && createdAt <= endOfWeek) {
          totalWeekPrice += price;
        }
        //Mois actuel (du 1er jusqu'à aujourd'hui)
        if (createdAt >= startOfMonth) {
          totalMonthPrice += price;
        }

          totlaPrice += price;
        }
      }
      return {data: {
        revenue: { week: totalWeekPrice, month: totalMonthPrice, totalAmount:  totlaPrice }  }
      };

    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // les statistiques d'une stock
  async getStockStatistics(businessId: number){
    try {
      let suspended = 0;
      let reserved = 0;
      let collected = 0;
      let delay_average = 0;

      const business = await this.businessRepository.findOne({
        where: {
          id: businessId,
        },
        relations: ['suspendus'] 
      });

      if (business) {
        business.suspendus.forEach(stock => {
          if (stock.quantity >= 1) {
            suspended += stock.quantity ;
          }
        });

        reserved = await this.getReservedStock(business.id)
        collected = await this.recoveredStock(business.id)
        delay_average = await this.averageRecoveryTimeInMinutes(business.id)
        return {
          data: { 
            stats: {
              suspended_not_collected: suspended,
              reserved: reserved,
              collected: collected,
              delay_average: delay_average
            }
          }
        }
      }

      throw new HttpException(
        {
          errors: {
            message: 'Le commerce demandé est introuvable.'
          }
        },
        HttpStatus.NOT_FOUND,
      );  

    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }

  }

  // Stock réservé(à récupérer)
  async getReservedStock(businessId: number){
    try {
      const business = await this.businessRepository.findOne({
        where: {
          id: businessId,
        },
        relations: ['suspendus.reservations'] 
      });

      if (!business) {
        throw new HttpException(
          {
            errors: {
              message: 'Le commerce demandé est introuvable.'
            }
          },
          HttpStatus.NOT_FOUND,
        );
      }

      let reservation = 0;

      if (business && business.suspendus?.length) {
        for (const suspendu of business.suspendus) {
          const nonCollectedCount = suspendu.reservations?.filter(r => r.collected === false)?.length || 0;
          reservation += nonCollectedCount;
          // reservation += suspendu.reservations?.length || 0;
        }
        return reservation;
      }
        // return {
        //   data: { reservedStock: reservation }
        // }

    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // Stock récupéré
  async recoveredStock(businessId: number){
    try {
      const business = await this.businessRepository.findOne({
        where: {
          id: businessId,
        },
        relations: ['suspendus.reservations'] 
      });

      let recovered = 0;

      if (business) {
        for(let suspendu of business.suspendus){
          for (let reservation of suspendu.reservations) {
            const collectedCount = suspendu.reservations?.filter(r => r.collected === true)?.length || 0;
            recovered += collectedCount;
          }
        }
        return recovered
        // return {
        //   data: { recoveredStock: recovered }
        // }
      }
      throw new HttpException(
        {
          errors: {
            message: 'Le commerce demandé est introuvable.'
          }
        },
        HttpStatus.NOT_FOUND,
      );  

    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async giveADonation(businessId: number, gifts){
    try {
      const business = await this.businessRepository.findOne({
        where: {
          id: businessId,
        },
        relations: ['products'] 
      });
      
      let order ;
      if (business) {
        for(const gift of gifts['gifts']){
          const product = await this.productRepository.findOneBy({
            id: gift.productId
          })
          if (!product) {
            throw new HttpException('Produit introuvable.', HttpStatus.NOT_FOUND)
          }
  
          if (product.quantity < gift.quantity) {
            throw new HttpException('La quantité disponible est insuffisante pour ce don.', HttpStatus.BAD_REQUEST)
          }

          // Vérifier si le produit appartient bien au business
          const isProductInBusiness = business.products.some(
            (element) => element.id === product.id
          );
          if (isProductInBusiness) {
            const dataOrder = {
              subTotal: product.price,
              total: product.price,
              status: 'paied',
              benefactor: null,
            }
            order = await this.orderRepository.create(dataOrder)
            await this.orderRepository.save(order)
            const data = {
              quantity: gift.quantity,
              productPrice: product.price,
              total: product.price * gift.quantity,
              product: product,
              business: business,
              benefactor: null,
              order: order
            };
            
            const createSuspendu = await this.stockRepository.create(data);
            // await this.stockRepository.save(createSuspendu);

            product.quantity -= gift.quantity
            await this.productRepository.save(product)
            await this.stockRepository.save(createSuspendu);
            // total += gift.quantity;
          }
        }
        return {data: { message: "Votre don a été enregistré avec succès." }}
      }

      throw new HttpException(
        {
          errors: {
            message: 'Le commerce demandé est introuvable.'
          }
        },
        HttpStatus.NOT_FOUND,
      );  

    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // Delai moyen de récupération
  async averageRecoveryTimeInMinutes(businessId: number): Promise<number> {
    try {
      const business = await this.businessRepository.findOne({
        where: { id: businessId },
        relations: ['suspendus.reservations']
      });

      if (!business) {
        throw new HttpException(
          { errors: { message: 'Le commerce demandé est introuvable.' } },
          HttpStatus.NOT_FOUND,
        );
      }

      let totalDelayInMs = 0;
      let count = 0;

      for (const suspendu of business.suspendus ?? []) {
        for (const reservation of suspendu.reservations ?? []) {
          if (reservation.collected && reservation.createdAt && reservation.collectedAt) {
            const diffMs = new Date(reservation.collectedAt).getTime() - new Date(reservation.createdAt).getTime();
            if (diffMs > 0) {
              totalDelayInMs += diffMs;
              count++;
            }
          }
        }
      }

      if (count === 0) return 0;

      const avgMs = totalDelayInMs / count;
      const avgMinutes = Math.round(avgMs / (1000 * 60));

      return avgMinutes;

    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }



  // Get comments
  async getComments(businessId: number, userId: number) {
    try {
      const user = await this.userRepository.findOne({
        where: {id: userId},
        relations: ['business.media']
      })

      if (!user) {
        throw new HttpException(
          { message: 'Utilisateur introuvable.' },
          HttpStatus.NOT_FOUND
        );
      }

      if (user.role === 'BUSINESS' && user.business.id !== businessId) {
        throw new HttpException(
          { message: 'Accès interdit à ce commerce.' },
          HttpStatus.FORBIDDEN
        );
      }
      const business = await this.businessRepository
      .createQueryBuilder('business')
      .leftJoinAndSelect('business.feedbacks', 'feedback')
      .leftJoinAndSelect('feedback.user', 'user')
      .leftJoinAndSelect('user.media', 'media')
      .where('business.id = :businessId', { businessId })
      .orderBy('feedback.createdAt', 'DESC') 
      .getOne();
      
      if (!business) {
        throw new HttpException(
          {
            message: 'Le commerce demandé est introuvable.'
          },
          HttpStatus.NOT_FOUND,
        );
      }
      
      if (business.feedbacks) {
        return {
          data: {
            Comments: business.feedbacks.map( (feedback) => new FeedbackPresenter(feedback))
          }
        }
      }
      
    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async checkFeedback(businessId: number, userId: number) {
    try {
      const business = await this.businessRepository.findOne({
        where: { id: businessId },
        relations: ['feedbacks.user'],
      });

      if (!business) {
        throw new NotFoundException('Commerce introuvable.');
      }

      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['profitable', 'benefactor'],
      });

      if (!user) {
        throw new NotFoundException('Utilisateur introuvable.');
      }

      if (user.role === 'BUSINESS') {
        return {
          result: false,
        };
      }

      const access = await this.hasUserAccessToBusiness(businessId, userId);
      console.log(access)
      // process.exit()
      if (access) {
        return {
          statusCode: 200,
          message: 'Vous êtes invité(e) à partager votre avis.',
        };
      }

      if (user.role === 'PROFITABLE') {
        throw new HttpException(
          {
            statusCode: 403,
            message: 'Vous devez avoir passé une commande dans ce commerce pour pouvoir laisser un commentaire.',
          },
          HttpStatus.FORBIDDEN,
        );
      }

      if (user.role === 'BENEFACTOR') {
        throw new HttpException(
          {
            statusCode: 403,
            message: 'Vous devez avoir passé une commande dans ce commerce pour pouvoir laisser un commentaire.',
          },
          HttpStatus.FORBIDDEN,
        );
      }

      // Rôle non reconnu ou aucune interaction
      throw new HttpException(
        {
          statusCode: 403,
          message: 'Vous n’avez encore eu aucune interaction avec ce commerce.',
        },
        HttpStatus.FORBIDDEN,
      );

    } catch (error) {
      if (error.response) {
        throw new HttpException(error.response, error.status);
      }
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  async hasUserAccessToBusiness(businessId: number, userId: number): Promise<boolean> {

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profitable', 'benefactor'],
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    if (user.role === 'BENEFACTOR') {
      const result = await this.orderRepository.createQueryBuilder('order')
        .innerJoin('order.stocks', 'stock')
        .innerJoin('stock.business', 'business')
        .where('order.benefactor = :benefactorId', { benefactorId: user.benefactor.id })
        .andWhere('business.id = :businessId', { businessId })
        .getExists(); 

      return result;
    }

    if (user.role === 'PROFITABLE') {
      const result = await this.reservationRepository.createQueryBuilder('reservation')
        .innerJoin('reservation.suspendu', 'stock')
        .innerJoin('stock.business', 'business')
        .where('reservation.profitable = :profitableId', { profitableId: user.profitable.id })
        .andWhere('business.id = :businessId', { businessId })
        .getExists();

      return result;
    }

    return false;
  }


  // Product list of business id
  async listProducts(businessId: number, offset?: number, limit?: number) {
    try {
      const products = await this.productRepository.find({
        relations: ['business.media', 'subCategory', 'tags.media', 'media'],
        where: {
          business: { id: businessId, isActive: true } ,
          available: true
        },
        skip: offset || 0,
        take: limit || 10,
      });

      if (products) {
        return {
          data: {
            products: products.map( (product) => new ProductPresenter(product) )
          }
        }
      }
      throw new HttpException(
        {
          message: "Aucun produit n’a été trouvé."
        },
        HttpStatus.NOT_FOUND);

    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // Liste des produits du business filtré par AVAILABLE / SUSPENDED / RESERVED / COLLECTED
  async productsOfBusiness(userId: number, type: string){
    try {
      const business = await this.businessRepository.findOne({
        where: {
          user: {id: userId}
        },
        relations: ['products']
      })
      let products;
      if (!business) {
        throw new HttpException(
          {
            message: 'Le commerce demandé est introuvable.'
          },
          HttpStatus.NOT_FOUND,
        );
      }

      if (type === "AVAILABLE") {
        products = await this.productRepository.createQueryBuilder('product')
        .leftJoinAndSelect('product.media','media')
        .leftJoinAndSelect('product.subCategory', 'subCategory')
        .leftJoinAndSelect('subCategory.category', 'category')
        .leftJoinAndSelect('product.business','business')
        .where('business.id = :businessId', { businessId: business.id })
        .andWhere('product.available = :available', { available: true })
        .getMany();
      }

      if (type === "SUSPENDED") {
        products = await this.productRepository.createQueryBuilder('product')
          .leftJoinAndSelect('product.media','media')
          .leftJoinAndSelect('product.subCategory', 'subCategory')
          .leftJoinAndSelect('subCategory.category', 'category')
          .leftJoinAndSelect('product.business','business')
          .leftJoinAndSelect('product.suspendus', 'suspendus')
          .where('business.id = :businessId', { businessId: business.id })
          .andWhere('suspendus.business.id = :businessId', { businessId: business.id })
          .andWhere('suspendus.quantity > 0') 
          .getMany();
      }

      if (type === "RESERVED") {
        products = await this.productRepository.createQueryBuilder('product')
        .leftJoinAndSelect('product.media','media')
        .leftJoinAndSelect('product.subCategory', 'subCategory')
        .leftJoinAndSelect('subCategory.category', 'category')
        .leftJoinAndSelect('product.business','business')
        .leftJoinAndSelect('product.suspendus', 'suspendus')
        .leftJoinAndSelect('suspendus.reservations', 'reservations')
        .where('business.id = :businessId', { businessId: business.id })
        .andWhere('suspendus.business.id = :businessId', {businessId: business.id} )
        .andWhere('reservations.collected = :isCollected', { isCollected: false })
        .getMany();
      }

      if (type === "COLLECTED") {
        products = await this.productRepository.createQueryBuilder('product')
        .leftJoinAndSelect('product.media','media')
        .leftJoinAndSelect('product.subCategory', 'subCategory')
        .leftJoinAndSelect('subCategory.category', 'category')
        .leftJoinAndSelect('product.business','business')
        .where('business.id = :businessId', { businessId: business.id })
        .leftJoinAndSelect('product.suspendus', 'suspendus')
        .leftJoinAndSelect('suspendus.reservations', 'reservations')
        .andWhere('suspendus.businessId = :businessId', {businessId: business.id} )
        .andWhere('reservations.collected = :isCollected', { isCollected: true })
        .getMany();
      }

      return { 
        data: {
          products: products.map((product) => new ProductPresenter(product))
        }
      }

    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async ordersOfBusiness(userId: number, query?: { subCategories; period: number }) {
    try {
      const user = await this.userRepository.findOne({
        where: {id: userId} ,
        relations: ['business']
      })
      let businessId = user.business.id
      
      if (user) {
        const orders = this.orderRepository.createQueryBuilder('order')
          .leftJoinAndSelect('order.benefactor', 'benefactor')
          .leftJoinAndSelect('benefactor.user', 'user')
          .leftJoinAndSelect('order.orderItems', 'orderItem')
          .leftJoinAndSelect('orderItem.business', 'business')
          // .leftJoinAndSelect('order.stocks', 'stocks')
          // .leftJoinAndSelect('stocks.business', 'businesses')
          .leftJoinAndSelect('orderItem.product', 'product')
          .leftJoinAndSelect('product.subCategory', 'subCategory')
          .where("business.id = :businessId", { businessId })
          .andWhere(
            new Brackets(qb => {
              qb.where("order.benefactor IS NULL")
                .orWhere("order.benefactor IS NOT NULL");
            })
          );
                  
        let subCatIds = []
        if (query.subCategories) {
          for(const subCatId of query.subCategories){
            subCatIds.push(subCatId)
          }
          orders.andWhere("subCategory.id IN (:SubCategories)", { SubCategories: subCatIds });
        }

        if(query.period){
          const currentDate = new Date();
          if (query.period == 7) { 
            const startDate = startOfWeek(currentDate);
            orders.andWhere('order.createdAt >= :startDate', { startDate });
          }
          if (query.period == 30) {
            const startDate = startOfMonth(currentDate);
            orders.andWhere('order.createdAt >= :startDate', { startDate });
          }
        }
        orders.orderBy('order.createdAt', 'DESC') 
        const allOrders = await orders.getMany();
        console.log(allOrders)
        return {
          // data: { orders: allOrders.map((order) => new OrderPresenter(order) )  }
          data: { orders: allOrders.map((order) => new OrderOfBusinessPresenter(order) )  } 
        }
    }

    throw new HttpException(
      {
        errors: {
          message: 'L’identifiant de l’utilisateur n’existe pas.'
        }
      },
      HttpStatus.NOT_FOUND,
    );  
      
    } catch (error) {
      if(error.response) throw new HttpException(error.response, error.status)
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async refreshQrFromToken(token: string) {
    try {
      
      let payload ;
      payload = await this.jwtService.verify(token); 
      const businessId = payload.user.business.id;
      if (!businessId) {
        throw new HttpException('ID introuvable dans le token.', HttpStatus.BAD_REQUEST);
      }

      const business = await this.businessRepository.findOne({
        where: { id: businessId },
        relations: ['user']
      });

      if (!business) {
        throw new HttpException('Commerce introuvable.', HttpStatus.NOT_FOUND);
      }
      
      const qrCodeData = generateBusinessQRCode(business.socialRaison, business.sirenNumber, business.id, business.user.id)

      business.qrCode = qrCodeData;
      await this.businessRepository.save(business);
      return {
        data: {
          business: new BusinessPresenter(business)
        },
      };
    } catch (error) {
      if(error.response) throw new HttpException(error.response, error.status)
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }


  async getBusinessByQrCode(qrCode: string): Promise<string> {
    if (!qrCode) {
      throw new HttpException('QR Code manquant.', HttpStatus.BAD_REQUEST);
    }
    
    const decoded = Buffer.from(qrCode, 'base64').toString('utf-8');
    const parts = decoded.split('-');
    const businessId = Number(parts[2]); // à adapter selon format réel
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
      relations: ['user']
    });

    if (!business) {
      throw new HttpException('Commerce introuvable.', HttpStatus.NOT_FOUND);
    }

    const logoUrl = `${process.env.SITE_URL}/images/logo_512.png`;

    return `
  <html lang="fr">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${business.socialRaison} | Suspendall</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f0f4f8; /* Couleur de fond douce */
          color: #222;
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }

        .container {
          background: white;
          border-radius: 12px;
          padding: 50px 30px 40px;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
          text-align: center;
          max-width: 480px;
          width: 90%;
        }

        img.logo {
          height: 60px;
          margin-bottom: 25px;
        }

        h1 {
          color: #2F80ED; /* Couleur primaire de Suspendall */
          font-size: 28px;
          margin-bottom: 12px;
        }

        p {
          font-size: 20px;
          margin: 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <img src="${logoUrl}" alt="Logo Suspendall" class="logo" />
        <h1>${business.socialRaison}</h1>
        <p>${business.sirenNumber}</p>
      </div>
    </body>
  </html>
`;
  }

  async businessByQRCode(id: number, qrcode: string){
    try {
      // console.log('qrcode')
      const user = await this.userRepository.findOneBy({id: id})
      let business 
      business = await this.businessRepository.createQueryBuilder('business')
      .leftJoinAndSelect('business.user', 'user')
      .leftJoinAndSelect('user.media', 'userMedia')
      .leftJoinAndSelect('user.city', 'city')
      .leftJoinAndSelect('business.media', 'media')
      .leftJoinAndSelect('business.subCategory', 'subCategory')
      .leftJoinAndSelect('business.feedbacks', 'feedbacks')
      .leftJoinAndSelect('business.products', 'products')
      .leftJoinAndSelect('products.subCategory', 'productSubCategory')
      .leftJoinAndSelect('products.media', 'productMedia')
      .leftJoinAndSelect('business.likes', 'likes')
      .leftJoinAndSelect('business.openingHours', 'openingHours')
      .leftJoinAndSelect('openingHours.day', 'day')
      .leftJoinAndSelect('likes.user', 'likeUser')
      .where('user.isVerified = true')
      .andWhere('business.isActive = true')
      .andWhere('business.qrCode = :qrcode', { qrcode })
      .getOne()
      let data = []
      let suspendedProducts
      if (business) {
        let isFavorite = false;
        if (business.likes.length > 0) {
          for (const like of business.likes) {
            if (like.user && like.user.id === business.user.id) {
              isFavorite = true
              break;
            }
          }
          
        }
        const feedbacks = await this.getAverageFeedbacks(business.id)
        if (user.role === 'PROFITABLE') {
          suspendedProducts = await this.calculateSuspendu(business.id)
        }
        
          // new BusinessPresenter(business),
          // like: isFavorite,
          // suspendedProducts: suspendedProducts,
          // averageRating: feedbacks,
          // price: (business.products.length > 0) ? (business.products.reduce((prev, current) => prev.price < current.price ? prev : current)).price : 0,
          // data.sort((a, b) => b.feedbacks - a.feedbacks);
        business = { 
          ...new BusinessPresenter(business) ,
          like: isFavorite,
          suspendedProducts: suspendedProducts,
          averageRating: feedbacks,
          price: (business.products.length > 0) ? (business.products.reduce((prev, current) => prev.price < current.price ? prev : current)).price : 0,
        }
        return {
          data: { business: business }
        }
        
      }
      throw new HttpException(
        {
          errors: {
            message: 'Le commerce demandé est introuvable.'
          }
        },
        HttpStatus.NOT_FOUND,
      );  

    } catch (error) {
      if(error.response) throw new HttpException(error.response, error.status)
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    } 
  }
}
