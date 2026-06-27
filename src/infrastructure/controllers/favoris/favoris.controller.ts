import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CreateFavorisDto } from './dto/create-favoris.dto';
import { UpdateFavorisDto } from './dto/update-favoris.dto';
import { FavorisService } from 'src/infrastructure/services/favoris/favoris.service';
import { User } from 'src/auth/user.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/role.enum';

@Controller('favoris')
export class FavorisController {
  constructor(private readonly favorisService: FavorisService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Benefactor, Role.Profitable)
  @Post(':id')
  async create(
    @Param('id') id: string,
    @User() user
    ) {
    return await this.favorisService.create(+id, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  findAll(@User() user) {
    return this.favorisService.findAll(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.favorisService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFavorisDto: UpdateFavorisDto) {
    return this.favorisService.update(+id, updateFavorisDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Benefactor, Role.Profitable)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @User() user
    ) {
    return await this.favorisService.remove(+id, user.id);
  }
}
