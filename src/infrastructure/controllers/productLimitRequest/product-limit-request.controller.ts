import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CreateProductLimitRequestDto } from './dto/create-product-limit-request.dto';
import { UpdateProductLimitRequestDto } from './dto/update-product-limit-request.dto';
import { ProductLimitRequestService } from 'src/infrastructure/services/productLimitRequest/product-limit-request.service';
import { RolesGuard } from 'src/auth/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/role.enum';
import { User } from 'src/auth/user.decorator';

@Controller('product-limit-request')
export class ProductLimitRequestController {
  constructor(private readonly productLimitRequestService: ProductLimitRequestService) {}

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.Business)
  // @Post()
  // async create(@Body() createProductLimitRequestDto: CreateProductLimitRequestDto, @User() user) {
  //   return await this.productLimitRequestService.requestProductLimit(user.id, createProductLimitRequestDto);
  // }

  @Get()
  findAll() {
    return this.productLimitRequestService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productLimitRequestService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductLimitRequestDto: UpdateProductLimitRequestDto) {
    return this.productLimitRequestService.update(+id, updateProductLimitRequestDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productLimitRequestService.remove(+id);
  }
}
