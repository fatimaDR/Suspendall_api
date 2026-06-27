import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put, Query } from '@nestjs/common';
import { CreateTypeBusinessDto } from './dto/create-type-business.dto';
import { UpdateTypeBusinessDto } from './dto/update-type-business.dto';
import { TypeBusinessService } from 'src/infrastructure/services/type-business/type-business.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/role.enum';
import { RolesGuard } from 'src/auth/roles.guard';

@Controller('type-business')
export class TypeBusinessController {
  constructor(private readonly typeBusinessService: TypeBusinessService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Post()
  async create(@Body() createTypeBusinessDto: CreateTypeBusinessDto) {
    return await this.typeBusinessService.create(createTypeBusinessDto);
  }

  @Get()
  async findAll(@Query() query) {
    return await this.typeBusinessService.findAll(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.typeBusinessService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateTypeBusinessDto: UpdateTypeBusinessDto) {
    return await this.typeBusinessService.update(+id, updateTypeBusinessDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.typeBusinessService.remove(+id);
  }
}
