import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put, Query } from '@nestjs/common';
import { FeedbackService } from '../../services/feedback/feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Role } from 'src/auth/role.enum';
import { Roles } from 'src/auth/roles.decorator';
import { User } from 'src/auth/user.decorator';
import { query } from 'express';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Profitable, Role.Benefactor)
  @Post(':id')
  addFeedback(
    @Body() createFeedbackDto: CreateFeedbackDto,
    @Param('id') id: string,
    @User() user
    ) {
    return this.feedbackService.addFeedback(+id, user.id, createFeedbackDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findAll(@Param('id') id: string,) {
    return await this.feedbackService.findAll(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(Role.Admin)
  @Get('admin/list')
  async allFeedbacks(
    @Query() query 
  ) {
    return await this.feedbackService.allFeedbacks(query);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.feedbackService.findOne(+id);
  // }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Benefactor, Role.Profitable)
  @Put(':id')
  update(
    @Param('id') id: string, 
    @Body() updateFeedbackDto: UpdateFeedbackDto,
    @User() user
  ) {
    return this.feedbackService.update(+id, user.id, updateFeedbackDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Benefactor, Role.Profitable)
  @Delete(':id')
  remove(@Param('id') id: string, @User() user) {
    return this.feedbackService.remove(+id, user.id);
  }
}
