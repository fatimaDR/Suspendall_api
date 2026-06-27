import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common/exceptions/unauthorized.exception';
import { validatePassword } from 'src/functions/functions';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
        usernameField: 'identifier',
        passwordField: 'password'
    });
  }

  async validate(identifier: string, password: string): Promise<any> {
    if (!validatePassword(password)) {
        const response = {
            code: HttpStatus.BAD_REQUEST,
            errors: [{
                field: "password",
                message: "Le mot de passe doit comporter au moins 8 caractères, dont une lettre, un chiffre et un caractère spécial."
            }]
        }
        throw new HttpException(response, HttpStatus.BAD_REQUEST)
    }
    const user = await this.authService.validateUser(identifier, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    // else if(!user.isVerified){
    //     throw new UnauthorizedException('La vérification du compte utilisateur est en attente.');
    // }
    return user;
  }
}