import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreatePushNotificationDto } from 'src/infrastructure/controllers/push-notification/dto/create-push-notification.dto';
import { UpdatePushNotificationDto } from 'src/infrastructure/controllers/push-notification/dto/update-push-notification.dto';
import { PushNotificationPresenter } from 'src/infrastructure/controllers/push-notification/pushNotification.presenter';
import { UserPushNotificationPresenter } from 'src/infrastructure/controllers/push-notification/user-push-notification.presenter';
import { PushNotification } from 'src/infrastructure/entities/push-notification.entity';
import { UserPushNotification } from 'src/infrastructure/entities/user-push-notification.entity';
import { User } from 'src/infrastructure/entities/user.entity';
import { Repository } from 'typeorm';


@Injectable()
export class PushNotificationService {

  constructor(
    
    @Inject('PUSH_NOTIFICATION_REPOSITORY')
    private notificationRepository: Repository<PushNotification>,

    @Inject('USER_REPOSITORY') 
    private userRepository: Repository<User>,

    @Inject('USER_PUSH_NOTIFICATION_REPOSITORY') 
    private userPushNotificationRepository: Repository<UserPushNotification>,

    @Inject('PUSH_NOTIFICATION_REPOSITORY') 
    private pushNotificationRepository: Repository<PushNotification>,

  ){}

  create(createPushNotificationDto: CreatePushNotificationDto) {
    return 'This action adds a new notificationType';
  }

  async findAll(userId: number) {
    try {
      const user = await this.userRepository.findOne(
        { where: { id:  userId},
        relations: ['userPushNotifications']
        }
      )
      
      const userNotifications = await this.userPushNotificationRepository.find(
        {
          where: { user: { id: user.id } },
          relations: ['pushNotification', 'user']
        }
      )  
      
      const pushNotifs = userNotifications.map((userNotification) => new UserPushNotificationPresenter(userNotification));

      return {
        data: {
          push_notifications: pushNotifs,
        },
      };

    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async NotifsSettings(userId: number) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new HttpException(
          { message: "L'utilisateur est introuvable" },
          HttpStatus.NOT_FOUND
        );
      }

      const notifications = await this.pushNotificationRepository.createQueryBuilder('notification')
        .leftJoinAndSelect(
          'notification.userPushNotifications',
          'userPushNotification',
          'userPushNotification.userId = :userId',
          { userId }
        )
        .where('notification.role = :role', { role: user.role })
        .orderBy('notification.id', 'ASC')
        .getMany();

      // Formater avec isActive
      const formatted = notifications.map((notif) => {
        const userNotif = notif.userPushNotifications?.[0];
        return {
          id: notif.id,
          title: notif.title,
          description: notif.description,
          tag: notif.tag,
          role: notif.role,
          isActive: userNotif ? userNotif.isActive : false,
        };
      });

      return {
        data: {
          notifications: formatted,
        },
      };

    } catch (error) {
      if (error.response)
        throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
}





  async activatePushNotification(userId, pushNotificationId: number) {
    try {
      
      const user = await this.userRepository.findOne({ 
        where: { id: userId},
      });
      
      if (!user) {
        throw new HttpException(
          {
            message: 'Utilisateur introuvable'
          },
          HttpStatus.NOT_FOUND,
        );
      }
      let message = "";
      let userPushNotification = await this.userPushNotificationRepository.findOne({
        where: {
          user: { id: user.id },
          pushNotification: { id: pushNotificationId },
        },
      });
      // If not found, create a new entry
      if (!userPushNotification) {
        userPushNotification = this.userPushNotificationRepository.create({
          user,
          pushNotification: { id: pushNotificationId } as PushNotification,
          isActive: true,
        });
        message =  "La notification a été créée avec succès." ;
      
      } else {
        userPushNotification.isActive = !userPushNotification.isActive; 
        message =  "La notification a été modifié avec succès." ;
      }
      await this.userPushNotificationRepository.save(userPushNotification);
      return {
        data: {
          message: message
        }
      }

    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
    
  }

  findOne(id: number) {
    return `This action returns a #${id} notificationType`;
  }

  update(id: number, updatePushNotificationDto: UpdatePushNotificationDto) {
    return `This action updates a #${id} notificationType`;
  }

  remove(id: number) {
    return `This action removes a #${id} notificationType`;
  }
}
