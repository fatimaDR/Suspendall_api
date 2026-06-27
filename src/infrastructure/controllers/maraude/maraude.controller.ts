import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UploadedFile, ParseFilePipeBuilder, UseInterceptors, Put } from '@nestjs/common';
import { MaraudeService } from '../../services/maraude/maraude.service';
import { CreateMaraudeDto } from './dto/create-maraude.dto';
import { UpdateMaraudeDto } from './dto/update-maraude.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/role.enum';
import { User } from 'src/auth/user.decorator';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { Product } from 'src/infrastructure/entities/product.entity';
import { CreateProductDto } from '../product/dto/create-product.dto';
import { MediaType } from 'src/infrastructure/entities/media.entity';

@Controller('maraude')
export class MaraudeController {
  constructor(private readonly maraudeService: MaraudeService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Association)
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/maraude',
      }),
    }),
  )
  async create(
    @User() user, 
    @Body() createMaraudeDto: CreateMaraudeDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png)$/,
        })
        .build({
          fileIsRequired: false,
        }),
    ) file?: Express.Multer.File,
  ) {
    return await this.maraudeService.create(createMaraudeDto, user.id, file);
  }

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.Admin, Role.Association)
  // @Post('addProduct/:id')
  // async addProduct(@Param('id') id, @Body() createProductDto: CreateProductDto){
  //   return await this.maraudeService.addProduct(id, createProductDto);
  // }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Association)
  @Get()
  findAll() {
    return this.maraudeService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Association)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.maraudeService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Association)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateMaraudeDto: UpdateMaraudeDto) {
    return await this.maraudeService.update(+id, updateMaraudeDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Association)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.maraudeService.remove(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin, Role.Association)
    @Put('media/:id')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads/maraude',
            }),
        }),
    )
    async addMedia(
        @Param('id') id: string,
        @User() user,
        @Body() body: {type: MediaType},
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
        const {type} = body
        return await this.maraudeService.addMedia(+id, user.id, type, file)
    }

}
