import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { LikeService } from '../../services/like/like.service';
import { CreateLikeDto } from './dto/create-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';
import { User } from 'src/auth/user.decorator';
import { Business } from 'src/infrastructure/entities/business.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Role } from 'src/auth/role.enum';
import { Roles } from 'src/auth/roles.decorator';

@Controller('like')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Benefactor, Role.Profitable)
  @Post(':id')
  create(
    @Param('id') BusinessId: string,
    @User() user
    ) {
    return this.likeService.addLike(+BusinessId, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async findAll(@User() user) {
    return await this.likeService.findAll(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.likeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLikeDto: UpdateLikeDto) {
    return this.likeService.update(+id, updateLikeDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Benefactor, Role.Profitable)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @User() user
    ) {
    return await this.likeService.remove(+id, user.id);
  }
}
