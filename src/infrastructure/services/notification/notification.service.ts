import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateNotificationDto } from '../../controllers/notification/dto/create-notification.dto';
import { UpdateNotificationDto } from '../../controllers/notification/dto/update-notification.dto';
import { Like, Not, Repository } from 'typeorm';
import { NotificationDevices } from 'src/infrastructure/entities/notificationsdevice.entity';
import { Notification } from 'src/infrastructure/entities/notification.entity';
import { User } from 'src/infrastructure/entities/user.entity';
import * as firebase from 'firebase-admin';
// import { BatchResponse } from 'firebase-admin/lib/messaging/messaging-api';
import { BatchResponse } from 'firebase-admin/lib/messaging/messaging-api';
import { chunk, update } from 'lodash';
import { mapLimit } from 'async';
import { title } from 'process';
import { NotificationPresenter } from 'src/infrastructure/controllers/notification/notification.presenter';

export interface ISendFirebaseMessages {
  token: string;
  title?: string;
  message: string;
}

@Injectable()
export class NotificationService {

constructor(
    @Inject('NOTIFS_REPOSITORY')
    private notifsRepository: Repository<NotificationDevices>,
    @Inject('NOTIFICATIONS_REPOSITORY')
    private notificationsRepository: Repository<Notification>,
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
    @Inject('FIREBASE_INIT')
    private firebaseInit
){}

  async createNotif(createNotificationDto: CreateNotificationDto, userid: number) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userid },
        relations: { notifications: true },
      });
      let userDevice 
      userDevice = user.notifications;
      const device = this.notifsRepository.create(createNotificationDto);
      const deviceIds = userDevice.map((device) => device.deviceId);
      if (deviceIds.includes(device.deviceId)) {
        const getDevice = await this.notifsRepository.findOneBy({
          deviceId: device.deviceId,
        });
        if (getDevice.deviceToken != device.deviceToken) {
          await this.notifsRepository.update(
            {
              deviceId: device.deviceId,
            },
            {
              deviceToken: device.deviceToken,
            },
          );
          await this.notifsRepository
            .createQueryBuilder()
            .update(NotificationDevices)
            .set({ disconnectedAt: null })
            .where({ id: getDevice.id })
            .execute();
          return {
            message: 'Enregistrement du jeton de notification réussi.',
          };
        } else {
          await this.notifsRepository
            .createQueryBuilder()
            .update(NotificationDevices)
            .set({ disconnectedAt: null })
            .where({ id: getDevice.id })
            .execute();
          return {
            message: 'Enregistrement du jeton de notification réussi.',
          };
        }
      } else {
        device.createdAt = new Date();
        device.user = user;
        await this.notifsRepository.save(device);
        return {
          message: 'Enregistrement du jeton de notification réussi.',
        };
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }


  async readNotif(userId: number, id: number) {
    try {
      
      const notification = await this.notificationsRepository.findOne({
        where: { id: id, toId: userId  }
      });

      if (!notification) {
        throw new HttpException('Notification introuvable ou n’appartient pas à l’utilisateur.', HttpStatus.NOT_FOUND);
      }
      
      await this.notificationsRepository
        .createQueryBuilder()
        .update(Notification)
        .set({ isRead: true })
        .where({ id: id })
        .execute();
      
      return { 
        data: { message: 'La notification a été marquée comme lue avec succès.' }
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findAll(userid: number, offset: number, limit: number, type: string, filter: string) {
    // try {
      
    //   const notifsArray = [];
    //   const user = await this.userRepository.findOneBy({ id: userid });
    //   if (user) {
    //     let whereQuery: {
    //       toId: number;
    //       type?: string;
    //       isRead?: boolean; // Optional isRead property
    //     } = {
    //       toId: userid,
    //     };
    //     if(type){
    //       whereQuery.type = type
    //     }
    //     if(filter && filter != "all"){
    //       const is_read_val = filter == 'not_read' ? false : true
    //       whereQuery.isRead = is_read_val
    //     }
    //     if (type) {
    //       const notifications = await this.notificationsRepository.findAndCount({
    //         where: whereQuery,
    //         order: { id: 'DESC' },
    //         skip: offset,
    //         take: limit,
    //       });
    //       console.log(notifications)
    //       for (const element of notifications[0]) {
    //         const from = await this.userRepository.findOne({
    //           where: { id: element.fromId },
    //         });
    //         // if (from) {
    //           // if (element.type === 'DEAL') {
    //           //   const deal = await this.dealRepository.findOneBy({
    //           //     id: element.eventId,
    //           //   });
    //           //   if (deal) element['deal'] = new DealPresenter(deal);
    //           // }
    //           // if (element.type === 'MESSAGE') {
    //           //   const message = await this.messagesRepository.findOneBy({
    //           //     id: element.eventId,
    //           //   });
    //           //   if (message) element['message'] = message;
    //           // }
    //           // notifsArray.push(
    //           //   // new NotificationPresenter(element, from, user),
    //           // );
    //         // }
    //       }
    //       return {
    //         data: { totalItems: notifications[1], notifications: notifsArray },
    //       };
    //     } else {
          
    //       const notifs = await this.notificationsRepository.findAndCount({
    //         where: whereQuery,
    //         order: { id: 'DESC' },
    //         skip: offset,
    //         take: limit,
    //       });
    //       for (const element of notifs[0]) {
    //         const from = await this.userRepository.findOne({
    //           where: { id: element.fromId },
    //         });
    //         // if (from) {
    //           // if (element.type === 'DEAL') {
    //           //   const deal = await this.dealRepository.findOneBy({
    //           //     id: element.eventId,
    //           //   });
    //           //   if (deal) element['deal'] = new DealPresenter(deal);
    //           // }
    //           // if (element.type === 'MESSAGE') {
    //           //   const message = await this.messagesRepository.findOneBy({
    //           //     id: element.eventId,
    //           //   });
    //           //   if (message) element['message'] = message;
    //           // }
    //           // notifsArray.push(
    //           //   new NotificationPresenter(element, from, profile),
    //           // );
    //         // }
    //       }
    //       return {
    //         data: { totalItems: notifs[1], notifications: notifsArray },
    //       };
    //       // const notifications = Promise.all(
    //       //   notifs[0].map(async (notif) => {
    //       //     const from = await this.profileRepository.findOne({
    //       //       where: { id: notif.fromId },
    //       //     });
    //       //     if (from) {
    //       //       if (notif.type === 'DEAL') {
    //       //         const deal = await this.dealRepository.findOneBy({
    //       //           id: notif.eventId,
    //       //         });
    //       //         if (deal) notif['deal'] = new DealPresenter(deal);
    //       //       }
    //       //       if (notif.type === 'MESSAGE') {
    //       //         const message = await this.messagesRepository.findOneBy({
    //       //           id: notif.eventId,
    //       //         });
    //       //         if (message) notif['message'] = message;
    //       //       }
    //       //       return new NotificationPresenter(notif, from, profile);
    //       //     }
    //       //   }),
    //       // );
    //       // return {
    //       //   data: { totalItems: notifs[1], notifications: await notifications },
    //       // };
    //     }
    //   }
    // } catch (error) {
    //   throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    // }
  }

  // Method to get notifications filtered by type
  async getNotificationsByType(type: string, userId: number) {
    try {
        const notifications = await this.notificationsRepository.find({
        where: { 
          type: type, 
          toId: userId 
        },
        order: {
          createdAt: 'DESC'  
        }
      });
      
      if (notifications) {
        const notifs = notifications.map( (notif) => new NotificationPresenter(notif))
        return {data: 
          {
            notifications: notifs
          } 
        }
      }
    } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
      


  }

  async findNotRead(userid: number) {
    try {
      const count = [];
      const user = await this.userRepository.findOneBy({ id: userid });
      if (user) {
        const notifications = await this.notificationsRepository.find({
          where: { toId: userid, isRead: false, deleted: false },
        });
        for (const element of notifications) {
          const getUsers = await this.userRepository.findOne({
            where: { id: element.fromId },
          });
          if (getUsers) {
            count.push(getUsers);
          }
        }
        return { data: { count: count.length } };
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  public async sendAll(
    messages: firebase.messaging.TokenMessage[],
    dryRun?: boolean,
  ): Promise<BatchResponse> {
    return firebase.messaging().sendAll(messages, dryRun);
  }

  public async sendFirebaseMessages(
    firebaseMessages: ISendFirebaseMessages[],
    dryRun?: boolean,
    data?: any,
  ): Promise<BatchResponse> {
    const batchedFirebaseMessages = chunk(firebaseMessages, 500);
    const batchResponses = await mapLimit<
      ISendFirebaseMessages[],
      BatchResponse
    >(
      batchedFirebaseMessages,
      3,
      //process.env.FIREBASE_PARALLEL_LIMIT, // 3 is a good place to start
      async (
        groupedFirebaseMessages: ISendFirebaseMessages[],
      ): Promise<BatchResponse> => {
        try {
          const tokenMessages: firebase.messaging.TokenMessage[] =
            groupedFirebaseMessages.map(({ message, title, token }) => ({
              notification: { body: message, title },
              token,
              data: { data: JSON.stringify(data) },
            }));

          for (const element of tokenMessages) {
            console.log({ token: element });
          }
          
          return await this.sendAll(tokenMessages, dryRun);
          // return firebase.messaging().sendAll(tokenMessages, dryRun);
        } catch (error) {
          return {
            responses: groupedFirebaseMessages.map(() => ({
              success: false,
              error,
            })),
            successCount: 0,
            failureCount: groupedFirebaseMessages.length,
          };
        }
      },
    );
    return batchResponses.reduce(
      ({ responses, successCount, failureCount }, currentResponse) => {
        currentResponse.responses.map(async (response, index) => {
          if (!response['success']) {
            await this.notifsRepository.delete({
              deviceToken: Like(firebaseMessages[index].token),
            });
          }
        });
        
        return {
          responses: responses.concat(currentResponse.responses),
          successCount: successCount + currentResponse.successCount,
          failureCount: failureCount + currentResponse.failureCount,
        };
      },
      {
        responses: [],
        successCount: 0,
        failureCount: 0,
      } as unknown as BatchResponse,
    );
  }

  async getUserDeviceToken(userId: number) {
    try {
      const notifications = [];
      const notifs = await this.notifsRepository.find({
        where: { user: { id: userId } },
      });
      for (const element of notifs) {
        if (Number.isNaN(element.disconnectedAt.valueOf())) {
          notifications.push(element);
        }
      }
      if (notifications) return notifications.map((notif) => notif.deviceToken);
      else return null;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async addNotifEvents(notif) {
    return await this.notificationsRepository.save(notif);
  }

  async sendNotifMessage(fromid: number, toid: number, item: any, type: string, title: string, message: string) {
    const from = await this.userRepository.findOne({
      where: { id: fromid },
    });
    const to = await this.userRepository.findOne({
      where: { id: toid },
    });
    const tokens = await this.getUserDeviceToken(toid);
    const notif = {
      fromId: from.id,
      toId: to.id,
      eventId: item.id,
      type: type,
      title: title,
      message: message,
      createdAt: new Date(),
    };
    const data = {
      type: type,
      item: {item: item, from: from, is: true },
    };
    await this.addNotifEvents(notif);
    const sendnotif = [];
    Promise.all(
      tokens.filter((token) => {
        sendnotif.push({
          token: token,
          title: "NEW NOTIFICATION",
          message: message,
        });
      }),
    );
    const send = await this.sendFirebaseMessages(sendnotif, false, data);
    console.log(send)
    return send;
  }

  create(createNotificationDto: CreateNotificationDto) {
    return 'This action adds a new notification';
  }

  findOne(id: number) {
    return `This action returns a #${id} notification`;
  }

  update(id: number, updateNotificationDto: UpdateNotificationDto) {
    return `This action updates a #${id} notification`;
  }

  remove(id: number) {
    return `This action removes a #${id} notification`;
  }
}
