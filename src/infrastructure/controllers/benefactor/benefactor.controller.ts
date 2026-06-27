import { Controller, Get, Request, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { BenefactorService } from '../../services/benefactor/benefactor.service';
import { UpdateBenefactorDto } from './dto/update-benefactor.dto';
import { Role } from 'src/auth/role.enum';
import { RolesGuard } from 'src/auth/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('benefactor')
export class BenefactorController {
  constructor(private readonly benefactorService: BenefactorService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Benefactor)
  @Get()
  getBenefactor(@Request() req) {
    return req.user;
  }

  @Get()
  findAll() {
    return this.benefactorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.benefactorService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.benefactorService.remove(+id);
  }
}
