import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CreateUserNotificationDto } from './dto/create-user-notification.dto';
import { UpdateUserNotificationDto } from './dto/update-user-notification.dto';
import { UserNotificationService } from 'src/infrastructure/services/user-notification/user-notification.service';

@Controller('user-notification')
export class UserNotificationController {
  constructor(private readonly userNotificationService: UserNotificationService) {}

  @Post()
  create(@Body() createUserNotificationDto: CreateUserNotificationDto) {
    return this.userNotificationService.create(createUserNotificationDto);
  }

  @Get()
  findAll() {
    return this.userNotificationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userNotificationService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserNotificationDto: UpdateUserNotificationDto) {
    return this.userNotificationService.update(+id, updateUserNotificationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userNotificationService.remove(+id);
  }
}
