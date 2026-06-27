import { HttpCode, HttpException, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { generateBusinessQRCode, generatePassword, validatePassword } from 'src/functions/functions';
import { CreateUserDto } from 'src/infrastructure/controllers/user/dto/create-user.dto';
import { User } from 'src/infrastructure/entities/user.entity';
import { In, Not, Repository } from 'typeorm';
import { BenefactorService } from '../benefactor/benefactor.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { ProfitableService } from '../profitable/profitable.service';
import { AssociationService } from '../association/association.service';
import { UserPresenter } from 'src/infrastructure/controllers/user/user.presenter';
import { Role } from 'src/auth/role.enum';
import { UpdateUserDto } from 'src/infrastructure/controllers/user/dto/update-user.dto';
import { BusinessService } from '../business/business.service';
import { City } from 'src/infrastructure/entities/city.entity';
import * as bcrypt from 'bcrypt';
import { jwtConstants } from 'src/auth/constants';
import { UserSettingsService } from '../user-settings/user-settings.service';
import { UserSetting } from 'src/infrastructure/entities/user-setting.entity';
import { NotificationService } from '../notification/notification.service';
import { MediaService } from '../media/media.service';
import { MediaType } from 'src/infrastructure/entities/media.entity';
import { CategorySocioPro } from 'src/infrastructure/entities/category-socio-pro.entity';
import { NOTIFICATIONTYPE } from 'src/functions/notification.enum';
import { ResetPassword } from 'src/infrastructure/entities/reset-password.entity';
// import * as QRCode from 'qrcode';
import * as dayjs from 'dayjs';
import { env } from 'process';
import { Business } from 'src/infrastructure/entities/business.entity';

@Injectable()
export class UserService {

  constructor(
    @Inject('USER_REPOSITORY') 
    private userRepository: Repository<User>,
    private readonly benefactorService: BenefactorService,
    private readonly profitableService: ProfitableService,
    private readonly associationService: AssociationService,
    private readonly businessService: BusinessService,
    private jwtService: JwtService,
    private mailService: MailService,
    private notificationService: NotificationService,
    private mediaService: MediaService,
    @Inject('BUSINESS_REPOSITORY')
    private businessRepository: Repository<Business>,
    @Inject('CITY_REPOSITORY') 
    private cityRepository: Repository<City>,
    @Inject('RESET_PASSWORD_REPOSITORY')
    private resetPasswordRepository: Repository<ResetPassword>,
    @Inject('USER_SETTINGS_REPOSITORY') 
    private userSettingsRepository: Repository<UserSetting>,

    @Inject('CategorySocioPro_REPOSITORY') 
    private catSocioProRepository: Repository<CategorySocioPro>,
    
  ){}

  async findUser(identifier: string): Promise<any>{
    try {
      return await this.userRepository.findOne({
        where: [
          {
            email: identifier,
          },
          {
            username: identifier,
          },
        ],
      });
      
    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);

      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async create(createUserDto: CreateUserDto) {
    
    try {
      let errors = [];
      let errorsNotFound = [];
      if (createUserDto.birthday && typeof createUserDto.birthday === 'string') {
        const [day, month, year] = createUserDto.birthday.split('-');
        // Padding to ensure 2-digit format
        const dayPadded = day.padStart(2, '0');
        const monthPadded = month.padStart(2, '0');
  
        const isoDateString = `${year}-${monthPadded}-${dayPadded}`;
        const parsedDate = new Date(isoDateString);
        
        if (isNaN(parsedDate.getTime())) {
          errors.push({
            field: "birthday",
            message: "Le format de la date de naissance est incorrect. Veuillez utiliser le format jj-mm-aaaa"
          });
        }
        createUserDto.birthday = parsedDate as any;
      }
      console.log(createUserDto)
      // process.exit()
      // if (createUserDto.birthday) {
      //   const parsed = dayjs(createUserDto.birthday, 'dd-MM-yyyy', true); 
      //   if (!parsed.isValid()) {
      //     errors.push({
      //       field: "birthday",
      //       message: "Le format de la date de naissance est invalide. Format attendu : AAAA-MM-JJ"
      //     });
      //   } else {
      //     createUserDto.birthday = parsed.toDate() as any;
      //   }
      // }

      const existedUser = await this.userRepository.findOneBy({
        email: createUserDto.email
      });
      
      if (existedUser) {
        errors.push({
          field: 'email',
          message: 'Cet e-mail existe déjà'
        });
      }
      
      if ((createUserDto.role != "BUSINESS") && !validatePassword(createUserDto.password)) {
        errors.push({
          field: 'password',
          message: 'Mot de passe invalide'
        });
      }
      

      if (!existedUser && ((createUserDto.role != "BUSINESS" && validatePassword(createUserDto.password)) || createUserDto.role == "BUSINESS")) {
        let createdUser = await this.userRepository.create(createUserDto);  
        if(createUserDto.cityId){
          const city = await this.cityRepository.findOneBy({
            id: createUserDto.cityId,
          });
          
          if (!city) {
              errorsNotFound.push({
              field: 'city',
              message: 'Ville saisie est incorrecte'
            });
          }
          createdUser.city = city
        }

        if(createUserDto.categoriSocioPro){
          const catSocioPro = await this.catSocioProRepository.findOneBy({
            id: createUserDto.categoriSocioPro,
          });
          
          if (!catSocioPro) {
            errorsNotFound.push({
              field: 'catSocioPro',
              message: 'Catégorie Socio Professionnelle saisie est incorrecte'
            });

            // throw new HttpException(
            // {
            //   message: "category id not found"
            // },
            // HttpStatus.NOT_FOUND);
          }
          createdUser.category = catSocioPro
        }

        if (errorsNotFound.length > 0) {
          throw new HttpException(
            {
              message: "",
              errors: errorsNotFound
            },
            HttpStatus.NOT_FOUND,
          );
        }

        switch(createUserDto.role){
          case 'BENEFACTOR':
            const benefactor = await this.benefactorService.addBenefactor(createUserDto)
            createdUser.benefactor = benefactor
            break;
          case 'PROFITABLE': 
            const profitable = await this.profitableService.addProfitable(createUserDto)
            createdUser.profitable = profitable
            break;
          case 'ASSOCIATION': 
            const association = await this.associationService.addAssociation(createUserDto)
            createdUser.association = association
            break;
          case 'BUSINESS':
            const business = await this.businessService.addBusiness(createUserDto)
            createdUser.business = business
            break;
        }
       
        const user = await this.userRepository.save(createdUser);
        // create settings for that user
        const createdSettings = await this.userSettingsRepository.create({
          user: user,
        });
        await this.userSettingsRepository.save(createdSettings);
        
        if(createUserDto.role != "BUSINESS")
          this.sendVerificationMail(user);
        if(createUserDto.role == "BUSINESS"){
          const qrCode = generateBusinessQRCode(user.business.socialRaison, user.business.sirenNumber, user.business.id, user.id);
          console.log(qrCode)
          user.business.qrCode = qrCode;
          await this.businessRepository.save(user.business)
          this.sendCreateBusinessMail(user);
        }
          
        return {
          data: { user: new UserPresenter(user)}
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

  sendVerificationMail(user){
    try{
      const token = this.jwtService.sign({
        userId: user.id, 
        email: user.email, 
        role: user.role
      });            
      const link = process.env.SITE_URL;
      // Send an email
      const mail_to = user.email;
      const mail_subject = "Verify Your Email Address";
      const mail_content = `${link}/api/user/verify?token=${token}`;
      const context = {
        name: user.firstName,
        appName: 'Suspendall',
        verifyLink: mail_content
      }
      console.log(context)
      const mail_template = "verify-account";
      
      this.mailService.send_mail(mail_to, mail_subject, context, mail_template);

    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
    
  }

  sendCreateBusinessMail(user){
    try{           
      // Send an email to business
      const mail_to = user.email;
      const mail_subject = "Bienvenue sur Suspendall";
      const context = {
        appName: 'Suspendall',
      }
      const mail_template = "account-awaiting-approval";
      
      this.mailService.send_mail(mail_to, mail_subject, context, mail_template);

    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
    
  }
  

  sendProvisionalPassword(user, password){
    try{
      const mail_to = user.email;
      const mail_subject = "Provisional Password";
      const mail_content = `this is your provisional password: ${password}`;
      this.mailService.send_mail(mail_to, mail_subject, mail_content);

    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
    
  }
  
  async verify(token: string) {
    const payload = await this.jwtService.verifyAsync(token);
    if (payload) {
      const user = await this.userRepository.findOneBy({id: payload.userId});
      if (!user) {
          // throw new NotFoundException('L’utilisateur demandé est introuvable. Veuillez vérifier les informations fournies.');
          throw new HttpException(
            {
              message: "Utilisateur introuvable."
            },
            HttpStatus.NOT_FOUND
          );
      }
      await this.userRepository.update(user.id, {
        isVerified: true,
        updatedAt: new Date()
      }); 

      return user;
    }
    throw new HttpException(
      {
        message: "Not valid token"
      },
      HttpStatus.NOT_FOUND
    );
    // throw new NotFoundException('Le jeton fourni n’est pas valide.');
    
  }

  async resetPassword(id, password) {
    try {
      
      const user = await this.userRepository.findOneBy({ id });
      let errors = []
      if (user) {
        if (!validatePassword(password)) {
          errors.push({
            field: 'new_password',
            message: 'Vérifier le mot de passe'
          });
        
          throw new HttpException(
            {
              message: "",
              errors: errors
            },
            HttpStatus.BAD_REQUEST,
          );
          
        }

        const resetEntry = await this.resetPasswordRepository.findOne({
          where: { user: { id: user.id } },
          relations: ['user']
        });

        if (!resetEntry || password !== resetEntry.password) {
          throw new HttpException('Mot de passe invalide ou expiré.', HttpStatus.BAD_REQUEST);
        }

        const salt = await bcrypt.genSalt();
        const newpassword = await bcrypt.hash(password, salt);
        const passwordUpdated = await this.userRepository.update(
          user.id,
          {
            password: newpassword,
            updatedAt: new Date(),
          },
        );
        // Delete the reset password record
        await this.resetPasswordRepository.delete({ id: resetEntry.id });
        const message = "Votre mot de passe Suspendall a été réinitialisé."
        await this.notificationService.sendNotifMessage(user.id, user.id, user, NOTIFICATIONTYPE.Security, "Mot de passe", message)
        return {
          message: 'Le mot de passe a été mis à jour.',
        };
      } else {
        throw new HttpException(
          {
            message: 'Utilisateur introuvable.',
          },
          HttpStatus.NOT_FOUND,
        );
      }
    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);

      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async resetPassword_sendToken(email) {
    try {
      const user = await this.userRepository.findOneBy({ email: email });
      if (user) {
        const payload = { id: user.id, email: user.email };
        const token = await this.jwtService.sign(payload, {
          secret: jwtConstants.secret,
          expiresIn: '2h',
        });

        const password = await generatePassword(8)

        const existingReset = await this.resetPasswordRepository.findOne({ where: { user: { id: user.id } } });
        if (existingReset) {
          existingReset.password = password;
          existingReset.updatedAt = new Date();
          await this.resetPasswordRepository.save(existingReset);
        } else {
          const reset = this.resetPasswordRepository.create({ user, password });
          await this.resetPasswordRepository.save(reset);
        }
          
        const mail_to = user.email;
        const mail_subject = "Réinitialisation de votre mot de passe";
        // const mail_content = `
        //   <div>
        //     <h3>Réinitialisation de mot de passe</h3>
        //     <p>Voici votre mot de passe : <strong>${password}</strong></p>
        //   </div>
        // `;
        const mail_content = {
          name: user.firstName,
          appName: 'Suspendall',
          newPassword: password
        }
        const mail_template = "reset-password";
        this.mailService.send_mail(mail_to, mail_subject, mail_content, mail_template);

        return {
          data: {
            token: token,
          },
        };
      } else {
        throw new HttpException(
          {
            message: 'Utilisateur introuvable.'
          },
          HttpStatus.NOT_FOUND,
        );
      }
    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async getMyData(id: number) {
    
    try {
      const user = await this.userRepository.findOne({
        where: { id },
        relations: ['category', 'benefactor', 'profitable', 'business.media', 'business.subCategory.category', 'business.type', 'business.openingHours', 'media', 'business.feedbacks'],
      });
      // console.log(user)
      if (user && (user.role === 'PROFITABLE' || user && user.role === 'BENEFACTOR' || user && user.role === 'BUSINESS')) {
        // console.log(user)
        return {
          data: { user: new UserPresenter(user) },
        };
      }

      throw new HttpException(
        {
          message: 'Utilisateur introuvable.',
        },
        HttpStatus.NOT_FOUND,
      );
    } catch (error) {
      if (error.response) {
        throw new HttpException(error.response, error.status);
      }
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async getUsers(query){
    try{
      const { limit, offset , keyword = '', role } = query;
      const queryBuilder  = await this.userRepository.createQueryBuilder('user')
        .leftJoinAndSelect('user.media', 'media')
        .where('user.isVerified = :isVerified', { isVerified: true })
        // .andWhere('user.role <> :role', { role: Role.Admin })
        .andWhere('user.deleted = :delete', {delete: false});
         
    if ([Role.Benefactor, Role.Business, Role.Profitable].includes(role)) {
      queryBuilder.andWhere('user.role = :role', { role });
    } else {
      // Sinon, exclure les Admins
      queryBuilder.andWhere('user.role <> :role', { role: Role.Admin });
    }
      if (keyword) {
        queryBuilder.andWhere('(user.firstName LIKE :keyword OR user.lastName LIKE :keyword OR user.email LIKE :keyword)', { keyword: `%${keyword}%` }); 
      }
      let totalItems = await queryBuilder.getCount()
      queryBuilder.orderBy('user.createdAt', 'DESC')
      const users =  await queryBuilder.take(limit).skip(offset).getMany();
      
      return {
        data: {
          users: users.map((user) => new UserPresenter(user)),
          totalItems: totalItems
        }
      }
    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  //admin can create users (profitable or benefactor)
  async addUser(createUserDto: CreateUserDto) {
    try {
      const roles = [Role.Benefactor, Role.Profitable]
      let errors = [];
      if(roles.indexOf(createUserDto.role) > -1){

        const existedUser = await this.userRepository.findOneBy({
          email: createUserDto.email
        });
       
        if (existedUser) {
          errors.push({
            field: 'email',
            message: 'Cet e-mail existe déjà'
          });
        }
        
        if (!validatePassword(createUserDto.password)) {
          errors.push({
            field: 'password',
            message: 'invalid password'
          });
        }

        if (!existedUser && validatePassword(createUserDto.password)) {
          createUserDto.isVerified = true
          const createdUser = await this.userRepository.create(createUserDto);  
          
          switch(createUserDto.role){
            case 'BENEFACTOR': 
              const benefactor = await this.benefactorService.addBenefactor(createUserDto)
              createdUser.benefactor = benefactor
              break;
            case 'PROFITABLE': 
              const profitable = await this.profitableService.addProfitable(createUserDto)
              createdUser.profitable = profitable
              break;
          }

          const user = await this.userRepository.save(createdUser);
          this.sendProvisionalPassword(user, createUserDto.password);
          return {
            data: { user: new UserPresenter(user)}
          }

        }
        throw new HttpException(
          {
            message: '',
            errors: errors
          },
          HttpStatus.BAD_REQUEST,
        );

      }else{
        // throw new HttpException('Vous n’êtes pas autorisé à attribuer ce rôle utilisateur.', HttpStatus.BAD_REQUEST);
        errors.push({
          field: 'add user',
          message: 'not allowed to add that user role'
        });
        throw new HttpException(
          {
            message: '',
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

  async deleteUser(id: number) {
    try{
      const user = await this.userRepository.findOneBy({id})
      let errors = []
      if(user){
        const roles = [Role.Benefactor, Role.Profitable]
        if( roles.indexOf(user.role) > -1 ){
          const deleted = await this.userRepository.delete(id)
          if(deleted.affected){
            return {
              message: 'user deleted successfully'
            }
          }else{
            // throw new HttpException('Une erreur inattendue est survenue. Veuillez réessayer plus tard.', HttpStatus.BAD_REQUEST)
            errors.push({
              field: 'delete user',
              message: 'Une erreur inattendue est survenue. Veuillez réessayer plus tard.'
            });
            throw new HttpException(
              {
                message: '',
                errors: errors
              },
              HttpStatus.BAD_REQUEST,
            );
          }
        }
        // throw new HttpException('Vous n’avez pas les permissions nécessaires.', HttpStatus.FORBIDDEN) 
      }
      // throw new NotFoundException()
      throw new HttpException(
        {
          message: "Utilisateur introuvable."
        },
        HttpStatus.NOT_FOUND
      );
      
    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // async updateUserByAdmin(id, updateUserDto: UpdateUserDto){
  //   try {
  //     const user = await this.userRepository.findOneBy({id: id});  
      
  //     if (user && [Role.Benefactor, Role.Profitable].indexOf(user.role) > -1 ) {
  //       const {benefactor, profitable, cityId, ...userData} = updateUserDto
  //       if(cityId){
  //         const city = await this.cityRepository.findOneBy({
  //           id: cityId,
  //         });
          
  //         if (!city) {
  //           throw new HttpException(
  //           {
  //             message: "city id not found"
  //           },
  //           HttpStatus.NOT_FOUND);
  //         }
  //         await this.userRepository.update(id, {
  //           ...userData,
  //           city: {id: cityId},
  //           updatedAt: new Date()
  //         });  
  //       }else{
  //         await this.userRepository.update(id, {
  //           ...userData,
  //           updatedAt: new Date()
  //         });
  //       }

  //       switch(user.role){
  //         case 'BENEFACTOR': 
  //           if(benefactor)
  //           await this.benefactorService.update(user.benefactor.id, benefactor)
  //           break;
  //         case 'PROFITABLE': 
  //           if(profitable)
  //           await this.profitableService.update(user.profitable.id, profitable)
  //           break;
  //       }
  //       const _user = await this.userRepository.findOneBy({id: id}); 
  //       return {
  //         message: "updated",
  //         data: { user: new UserPresenter(_user)}
  //       }
  //     }
  //     // throw new HttpException('Vous n’avez pas les permissions nécessaires., you can edit just profitable and benefactor', HttpStatus.FORBIDDEN)
  //     throw new HttpException(
  //       {
  //         message: "user not found"
  //       },
  //       HttpStatus.NOT_FOUND
  //     );

  //   } catch (error) {
  //     if (error.response) throw new HttpException(error.response, error.status);
  //     throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
  //   }
  // }

  
  async updateMyData(id , updateUserDto: UpdateUserDto){
    try {
      let errors = []
      const user = await this.userRepository.findOneBy({id: id});  
      
      const {benefactor, profitable, business, cityId, categoriSocioPro, email, ...userData} = updateUserDto

      if(cityId){
        const city = await this.cityRepository.findOneBy({
          id: cityId,
        });
        
        if (!city) {
          throw new HttpException(
          {
            message: "L’identifiant de la ville est introuvable."
          },
          HttpStatus.NOT_FOUND);
        }

        await this.userRepository.update(id, {
          ...userData,
          city: {id: cityId},
          updatedAt: new Date()
        }); 
      } 
      // else{
      //   await this.userRepository.update(id, {
      //     ...userData,
      //     updatedAt: new Date()
      //   });
        
      // }

      if(categoriSocioPro){
        const catSocioPro = await this.catSocioProRepository.findOneBy({id: categoriSocioPro})

        if (!catSocioPro) {
          throw new HttpException(
            {
              message: "category socio pro id not found"
            },
            HttpStatus.NOT_FOUND);
        }
        await this.userRepository.update(id, {
          ...userData,
          category: {id: categoriSocioPro},
          updatedAt: new Date()
        }); 
      }

      if (userData.birthday && typeof userData.birthday === 'string') {
        const [day, month, year] = userData.birthday.split('-');
        const dayPadded = day.padStart(2, '0');
        const monthPadded = month.padStart(2, '0');
        const isoDateString = `${year}-${monthPadded}-${dayPadded}`;
        const parsedDate = new Date(isoDateString);
        
        if (isNaN(parsedDate.getTime())) {
          errors.push({
            field: "birthday",
            message: "Le format de la date de naissance est incorrect. Veuillez utiliser le format jj-mm-aaaa"
          });
        }
        userData.birthday = parsedDate as any;
      }
      
      if (errors.length > 0) {
        throw new HttpException(
          {
            message: "",
            errors: errors,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if(email){
        await this.userRepository.update(id, {
          email,
          updatedAt: new Date()
        });
        const message = 'Mise à jour réussie de votre adresse e-mail associée à Suspendall.'
        await this.notificationService.sendNotifMessage(user.id, user.id, user, NOTIFICATIONTYPE.Security, "Votre adresse e-mail", message)
      }
      
      switch(user.role){
        case 'BENEFACTOR': 
          if(benefactor)
          await this.benefactorService.update(user.benefactor.id, benefactor)
          break;
        case 'PROFITABLE': 
          if(profitable)
          await this.profitableService.update(user.profitable.id, profitable)
          break;
        case 'BUSINESS': 
          await this.businessService.update(user.business.id, business)
          break;
      }
      
      const updatedUser = await this.userRepository.update(id, {
        ...userData,
        updatedAt: new Date()
      });
      
      const _user = await this.userRepository.findOne({
        where: { id: id },
        relations: ['category', 'business.subCategory.category']
      }); 
      return {
        message: "Mise à jour effectuée avec succès",
        data: { user: new UserPresenter(_user)}
      }

    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async getUser(id: number){
    try{
      const user = await this.userRepository.findOneBy({id})
      if(user)
        return {
          data: { user: new UserPresenter(user) }
        }
      // throw new NotFoundException()
      throw new HttpException(
        {
          message: "Utilisateur introuvable."
        },
        HttpStatus.NOT_FOUND
      );

    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async addPhoto(current_user_id: number, file) {
    try {
      const user = await this.userRepository.findOne({
        where: {id: current_user_id},
        relations: ['media']
      });
     
      if (user.media) {
        await this.mediaService.removeMedia(user.media.path);
        const update_mediaDto = {
          filename: file.filename,
          originalname: file.originalname,
          mimeType: file.mimetype,
          path: file.path,
          updatedAt: new Date(),
        };
        
        return this.mediaService.updateMedia(user.media.id, update_mediaDto);
      } else {
        const create_mediaDto = {
          moduleId: current_user_id,
          moduleType: 'USER',
          type: 'USER',
          order: 0,
          filename: file.filename,
          originalname: file.originalname,
          mimeType: file.mimetype,
          path: file.path,
        };

        return this.mediaService.createMedia(create_mediaDto.moduleId, create_mediaDto.moduleType, MediaType.Cover, create_mediaDto);
      }
    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);

      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async updatePassword(userId: number, currentPassword: string, newPassword: string) {
    try {
      
      let errors = []
      // Find the user by ID
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        throw new HttpException(
          {
            message: "Utilisateur introuvable."
          },
          HttpStatus.NOT_FOUND
        );
      }

      // Verify the current password
      const isCurrentPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPassword) {
        console.log("rrr")
        errors.push({
          field: 'current_password',
          message: 'Le mot de passe actuel est incorrect.'
        });
      }

      if (!validatePassword(newPassword)) {
        console.log(newPassword)
        errors.push({
          field: 'new_password',
          message: 'Le mot de passe doit contenir au moins 8 caractères, dont une lettre, un chiffre et un caractère spécial.'
        });
      }
      if (errors.length > 0) {
        throw new HttpException(
          {
            message: 'Certaines informations sont incorrectes, veuillez vérifier vos données.',
            errors: errors
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      // Hash the new password
      const salt = await bcrypt.genSalt();
      const hashedNewPassword = await bcrypt.hash(newPassword, salt);
 
      // Update the user's password in the database
      user.password = hashedNewPassword;
      await this.userRepository.save(user);
      
      return {
        data: { 
          code: 200,
          message: "Mot de passe mis à jour avec succès."
        }
      }

    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // async generateBusinessQRCode(socialRaison: string, sirenNumber: string, businessId: number, userId: number): Promise<string> {
    
  //   const now = Date.now(); 
  //   const data = `${socialRaison}-${sirenNumber}-${businessId}-${userId}-${now}`;

  //   try {
  //     const qrCodeDataUrl = Buffer.from(data).toString('base64');
      
  //     return qrCodeDataUrl;
  //   } catch (error) {
  //     throw new Error('Erreur lors de la génération du QR Code');
  //   }
  // }

}
