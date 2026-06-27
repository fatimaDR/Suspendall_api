import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put, Query } from '@nestjs/common';
import { CategorySocioProService } from '../../services/category-socio-pro/category-socio-pro.service';
import { CreateCategorySocioProDto } from './dto/create-category-socio-pro.dto';
import { UpdateCategorySocioProDto } from './dto/update-category-socio-pro.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/role.enum';

@Controller('category-socio-pro')
export class CategorySocioProController {
  constructor(private readonly categorySocioProService: CategorySocioProService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Post()
  async create(@Body() createCategorySocioProDto: CreateCategorySocioProDto) {
    return await this.categorySocioProService.create(createCategorySocioProDto);
  }

  @Get()
  async findAll(@Query() query) {
    return await this.categorySocioProService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categorySocioProService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateCategorySocioProDto: UpdateCategorySocioProDto) {
    return await this.categorySocioProService.update(+id, updateCategorySocioProDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.categorySocioProService.remove(+id);
  }
}
