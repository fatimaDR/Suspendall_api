import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { CreatePushNotificationDto } from './dto/create-push-notification.dto';
import { UpdatePushNotificationDto } from './dto/update-push-notification.dto';
import { PushNotificationService } from 'src/infrastructure/services/push-notification/push-notification.service';
import { User } from 'src/auth/user.decorator';

@Controller('push-notification')
export class PushNotificationController {
  constructor(private readonly pushNotificationService: PushNotificationService) {}

  @Post()
  create(@Body() createPushNotificationDto: CreatePushNotificationDto) {
    return this.pushNotificationService.create(createPushNotificationDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async findAll(@User() user) {
    
    return await this.pushNotificationService.findAll(user.id);
    
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('settings')
  async NotifsSettings(@User() user) {
    
    return await this.pushNotificationService.NotifsSettings(user.id);
    
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pushNotificationService.findOne(+id);
  }

  // Activate a push notification
  @UseGuards(JwtAuthGuard)
  @Patch('activate/:id')
  async activatePushNotification(
    @Param('id') id: string, 
    @User() user
  ) {
   
    return await this.pushNotificationService.activatePushNotification(user.id, +id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNotificationTypeDto: UpdatePushNotificationDto) {
    return this.pushNotificationService.update(+id, updateNotificationTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pushNotificationService.remove(+id);
  }
}
