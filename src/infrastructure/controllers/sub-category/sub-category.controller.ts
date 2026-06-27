import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put, UseInterceptors, UploadedFile, ParseFilePipeBuilder, Query } from '@nestjs/common';
import { CreateSubCategoryDto } from './dto/create-sub-category.dto';
import { UpdateSubCategoryDto } from './dto/update-sub-category.dto';
import { SubCategoryService } from 'src/infrastructure/services/sub-category/sub-category.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/role.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';

@Controller('sub-category')
export class SubCategoryController {
  constructor(private readonly subCategoryService: SubCategoryService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Post()
  async create(@Body() createSubCategoryDto: CreateSubCategoryDto) {
    return await this.subCategoryService.create(createSubCategoryDto);
  }

  @Get()
  async findAll(@Query() query) {
    return await this.subCategoryService.findAll(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.subCategoryService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateSubCategoryDto: UpdateSubCategoryDto) {
    return await this.subCategoryService.update(+id, updateSubCategoryDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.subCategoryService.remove(+id);
  }

  // Add media to subcategory
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Post('media/:subCatId')
  @UseInterceptors(
      FileInterceptor('file', {
          storage: diskStorage({
              destination: './uploads/subCategory',
          }),
      }),
  )
  async uploadPhoto(
    @Param('subCatId') id: string,
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
      data: await this.subCategoryService.uploadMedia(+id, file)
    };
  }
}
