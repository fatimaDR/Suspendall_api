import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { OpeningHoursService } from '../../services/openingHours/opening-hours.service';
import { CreateOpeningHourDto } from './dto/create-opening-hour.dto';
import { UpdateOpeningHourDto } from './dto/update-opening-hour.dto';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/role.enum';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { User } from 'src/auth/user.decorator';

@Controller('opening-hours')
export class OpeningHoursController {
  constructor(private readonly openingHoursService: OpeningHoursService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Business)
  @Post()
  create(
    @User() user,
    @Body() createOpeningHourDto: { openingHours: CreateOpeningHourDto[] }
  ) {
    return this.openingHoursService.create(user.id, createOpeningHourDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@User() user) {
    return await this.openingHoursService.findAll(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.openingHoursService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Business)
  @Patch()
  async update( 
    @Body() updateOpeningHourDto,
    @User() user
  ) {
    return await this.openingHoursService.update(user.business.id, updateOpeningHourDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Business)
  @Delete(':id')
  remove(
    @User() user,
    @Param('id') id: string
  ) {
    return this.openingHoursService.remove(user.id, +id);
  }
}
