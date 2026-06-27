import { Injectable } from '@nestjs/common';
import { CreateUserNotificationDto } from 'src/infrastructure/controllers/user-notification/dto/create-user-notification.dto';
import { UpdateUserNotificationDto } from 'src/infrastructure/controllers/user-notification/dto/update-user-notification.dto';

@Injectable()
export class UserNotificationService {
  create(createUserNotificationDto: CreateUserNotificationDto) {
    return 'This action adds a new userNotification';
  }

  findAll() {
    return `This action returns all userNotification`;
  }

  findOne(id: number) {
    return `This action returns a #${id} userNotification`;
  }

  update(id: number, updateUserNotificationDto: UpdateUserNotificationDto) {
    return `This action updates a #${id} userNotification`;
  }

  remove(id: number) {
    return `This action removes a #${id} userNotification`;
  }
}
