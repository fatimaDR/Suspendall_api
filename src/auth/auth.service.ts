import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { UserService } from 'src/infrastructure/services/user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    
    constructor(
        private readonly jwtService: JwtService,
        private userService: UserService
    ){}

    async validateUser(identifier: string, pass: string): Promise<any> {
        const user = await this.userService.findUser(identifier);
        if (!user) {
            throw new HttpException(
            { message: 'Email ou mot de passe incorrects' },
            HttpStatus.UNAUTHORIZED,
            );
        }

        if(user) {
            const isMatch = await bcrypt.compare(pass, user.password);
            if (!isMatch) {
                throw new HttpException(
                { message: 'Email ou mot de passe incorrects' },
                HttpStatus.UNAUTHORIZED,
                );
            }
            // if (isMatch) {
            const { password, ...result } = user;
            return  result;
            // }
            // return null
        }
    }

    async login(user: any, res) {
        if (user.isActive == false) {
            throw new HttpException(
                {
                  message: "Le compte utilisateur est désactivé."
                },
                HttpStatus.NOT_FOUND
            );
        }
        if (!user.isVerified) {
            throw new HttpException(
                {
                  message: "Votre compte n’est pas encore activé. Veuillez vérifier votre e-mail pour finaliser l’activation."
                },
                HttpStatus.NOT_FOUND
            );
        }
        const payload = {user};
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload,{
                secret: jwtConstants.secret,
                expiresIn: '30d',
            }),
            this.jwtService.signAsync(payload,{
                secret: jwtConstants.secret,
                expiresIn: '30d',
            })
        ])
        res.status(HttpStatus.OK);
        return {
            code: HttpStatus.OK,
            data:{
                role: user.role,
                isVerified: user.isVerified,
                accessToken: accessToken,
                refreshToken: refreshToken
            }
        };
        
    }
}
