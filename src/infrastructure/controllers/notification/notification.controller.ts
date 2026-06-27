import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Put } from '@nestjs/common';
import { NotificationService } from '../../services/notification/notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from 'src/auth/user.decorator';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createNotificationDto: CreateNotificationDto, @User() user) {
    return await this.notificationService.createNotif(createNotificationDto, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getNotificationsByType(
    @Query('type') type: string,
    @User() user
  ) {
    return await this.notificationService.getNotificationsByType(type, user.id);
  }

  // @Get()
  // findAll(
  //   @Query('offset') offset: number,
  //   @Query('limit') limit: number,
  //   @Query('type') type: string,
  //   @Query('filter') filter: string,
  //   @User() user,
  // ) {
    
  //   return this.notificationService.findAll(user.id, offset, limit, type, filter);
  // }

  @UseGuards(JwtAuthGuard)
  @Get('/count')
  async findNotRead(@User() user) {
    return await this.notificationService.findNotRead(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async readNotif(
    @Param('id') id: string,
    @User() user
  ) {
    return await this.notificationService.readNotif(user.id, +id);
  }
  
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto) {
    return this.notificationService.update(+id, updateNotificationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationService.remove(+id);
  }


}
