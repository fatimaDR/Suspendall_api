import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { AdminService } from '../../services/admin/admin.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { BusinessService } from 'src/infrastructure/services/business/business.service';
import { User } from 'src/auth/user.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/role.enum';
import { query } from 'express';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly businessService: BusinessService,
    private readonly adminService: AdminService
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get('me')
  async getDetailAdmin(@User() user){
    return await this.adminService.getDetailAdmin(user.id)
  }

  @UseGuards(JwtAuthGuard)
  @Roles(Role.Admin)
  @Get('business/:id')
  async businesDetails(@Param('id') id: string){
    return this.businessService.businessDetailsAdmin(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(Role.Admin)
  @Get('businesses')
  async findAllBusinesses(@Query() query){
    return await this.adminService.findAllBusinesses(query);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(Role.Admin)
  @Get('list/businesses')
  async sampleBusiesses(@Param('id') id: string){
    return await this.adminService.sampleBusiesses();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Patch('activated-user/:id')
  async userActiveted(@Param('id') id: string){
    return await this.adminService.userActiveted(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get('revenue')
  async dashboardByAdmin(@User() user){
    return await this.adminService.dashboardByAdmin();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get('charts')
  async chartsByAdmin(@Query() query){
    return await this.adminService.chartsByAdmin(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get('statistics')
  async statistics(@Query() query){
    return await this.adminService.statistics(query);
  }
  
  @Patch('business/:id/product-limit')
  @Roles(Role.Admin)
  async updateBusinessProductLimit(
    @Param('id') id: string,
    @Body('limit') limit: number,
  ) {
    return await this.adminService.updateProductLimit(+id, limit);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Patch('product-limit/:id/approve')   
  async handleBusinessRequest(@Param('id') id: string, @Body('aprove') aprove: boolean,){
    return await this.adminService.handleBusinessRequest(+id, aprove);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get('product-limits')   
  async BusinessRequetList(@Query() query){
    return await this.adminService.BusinessRequetList(query);
  }

}
