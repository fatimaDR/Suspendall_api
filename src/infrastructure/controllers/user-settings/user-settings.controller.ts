import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put, Query } from '@nestjs/common';
import { UserSettingsService } from '../../services/user-settings/user-settings.service';
import { CreateUserSettingDto } from './dto/create-user-setting.dto';
import { UpdateUserSettingDto } from './dto/update-user-setting.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/role.enum';
import { User } from 'src/auth/user.decorator';

@Controller('user-settings')
export class UserSettingsController {
  constructor(private readonly userSettingsService: UserSettingsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.Benefactor, Role.Profitable, Role.Business)
  @Patch('active-notification')
  async notificationActived(@User() user){
    return await this.userSettingsService.notificationActived(user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  async editSettings(
    @Body() createUserSettingDto: CreateUserSettingDto,
    @User() user
    ) {
    return await this.userSettingsService.editSettings(user.id, createUserSettingDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('me')
  async deleteUser(@User() user){
    return await this.userSettingsService.deleteMyAccount(user.id)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Business)
  @Get('orders')
  async MyOrders(
    @Query() query,
    @User() user
    ) {
    return await  this.userSettingsService.MyOrders(user.id, query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Business)
  @Get('history')
  async MyHistory(
    @Query() query,
    @User() user
    ) {
    return await  this.userSettingsService.MyHistory(user.id, query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Business)
  @Get('donation')
  async BusinessDonation(
    @Query() query,
    @User() user
    ) {
    return await  this.userSettingsService.BusinessDonation(user.id, query);
  }

  // @Get()
  // findAll() {
  //   return this.userSettingsService.findAll();
  // }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userSettingsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserSettingDto: UpdateUserSettingDto) {
    return this.userSettingsService.update(+id, updateUserSettingDto);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.userSettingsService.remove(+id);
  // }
}
