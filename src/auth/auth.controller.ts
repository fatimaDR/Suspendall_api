import { Controller, Post, Request, Response, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ){}

    
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req,@Response({passthrough: true}) res) {
    return this.authService.login(req.user, res);
  }
}
