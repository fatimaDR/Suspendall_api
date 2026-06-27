import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, UseInterceptors, UploadedFile, ParseFilePipeBuilder } from '@nestjs/common';
import { ProductService } from '../../services/product/product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Role } from 'src/auth/role.enum';
import { Roles } from 'src/auth/roles.decorator';
import { User } from 'src/auth/user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Get('business/:businessId')
  // async findAll(
  //   @Param('businessId') businessId: string,
  //   @Query('offset') offset: number,
  //   @Query('limit') limit: number
  //   ) {
  //     return await this.productService.findAll(+businessId, offset, limit);
  // }

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.Benefactor)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.productService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Business)
  @Patch(':id')
  update(
    @Param('id') id: string, 
    @Body() updateProductDto: UpdateProductDto,
    @User() user
    ) {
    return this.productService.update(+id, updateProductDto, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Business)
  @Delete(':id')
  async remove(
      @Param('id') id: string, 
      @User() user
    ) {
    return await this.productService.remove(+id, user.id);
  }


  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Business)
  @Post('media/:id')
  @UseInterceptors(
      FileInterceptor('file', {
          storage: diskStorage({
              destination: './uploads/product',
          }),
      }),
  )
  async uploadPhoto(
    @Param('id') id: string,
      @UploadedFile(
        new ParseFilePipeBuilder()
            .addFileTypeValidator({
                fileType: /(jpg|jpeg|png)$/,
            })
            .build({
                fileIsRequired: false,
            }),
      )
          file?: Express.Multer.File,
  ) {

    if (file) {
      file.path = path.normalize(file.path).replace(/\\/g, '/'); 
    }
    return {
      data: await this.productService.uploadMedia(+id, file)
    };
  }
}
