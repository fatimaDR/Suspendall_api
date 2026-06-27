import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put, Query } from '@nestjs/common';
import { ReservationService } from '../../services/reservation/reservation.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { User } from 'src/auth/user.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/role.enum';

@Controller('reservation')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}


  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Profitable)
  @Post()
  async create(
    @Body() createReservationDto: CreateReservationDto,
    @User() user
    ) {
    return await this.reservationService.create(createReservationDto, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Profitable)
  @Get()
  async findAll(
    @User() user,
    @Query() query,
  ) {
    return await this.reservationService.findAll(user.id, query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Profitable)
  @Get('last')
  async lastReservation(
    @User() user,
  ) {
    return await this.reservationService.lastReservation(user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Profitable)
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query() query,
    @User() user
    ) {
    return this.reservationService.collectOrder(+id, query, user.id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateReservationDto: UpdateReservationDto) {
    return this.reservationService.update(+id, updateReservationDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Profitable)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reservationService.cancelOrder(+id);
  }

  // @Get('recommended/:businessId')
  //   async recommandedForYou(
  //       @Param('businessId') businessId: number,
  //       @Query('limit') limit: number,
  //   ) {
  //       return await this.reservationService.recommandedForYou(businessId, limit);
  //   }
}
