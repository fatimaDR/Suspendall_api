import { Controller, Get,Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Role } from 'src/auth/role.enum';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';

@Controller('association')
export class AssociationController {
  constructor() {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Association)
  @Get()
  getAssociation(@Request() req) {
    return req.user;
  }

}
