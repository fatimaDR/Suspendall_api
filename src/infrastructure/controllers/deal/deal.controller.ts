import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, ParseFilePipeBuilder, Put, Query } from '@nestjs/common';
import { DealService } from '../../services/deal/deal.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/role.enum';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';

@Controller('deal')
export class DealController {
  constructor(private readonly dealService: DealService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Post()
  async create(@Body() createDealDto: CreateDealDto) {
    return await this.dealService.create(createDealDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Benefactor, Role.Profitable, Role.Admin)
  @Get()
  async findAll(@Query() query) {

    return await this.dealService.findAll(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Post('media/:id')
  @UseInterceptors(
      FileInterceptor('file', {
          storage: diskStorage({
              destination: './uploads/deal',
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
      data: await this.dealService.uploadMedia(+id, file)
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Profitable, Role.Benefactor, Role.Admin)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.dealService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDealDto: UpdateDealDto) {
    return await this.dealService.update(+id, updateDealDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.dealService.remove(+id);
  }
}
