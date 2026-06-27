import { Body, Controller, Delete, Get, HttpException, HttpStatus, NotFoundException, Param, ParseFilePipeBuilder, Patch, Post, Put, Query, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from 'src/infrastructure/services/user/user.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/role.enum';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from 'src/auth/user.decorator';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from 'src/auth/constants';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { Response } from 'express';

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private jwtService: JwtService
    ) {}

    @Post('register')
    create(@Body() createUserDto: CreateUserDto) {
        return this.userService.create(createUserDto)
    }

    // connected user can get his data
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Benefactor, Role.Profitable, Role.Business)
    @Get('me')
    async getMyData(@User() user){
        
        if (!user || !user.id) {
            throw new HttpException('L’utilisateur demandé est introuvable. Veuillez vérifier les informations fournies.', HttpStatus.UNAUTHORIZED);
        }
        return await this.userService.getMyData(user.id)
    }

    @Get('verify')
    async verify(@Query('token') token: string, @Res() res: Response) {
        try {
            const verifiedUser = await this.userService.verify(token);
            const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                <title>Verification Success</title>
                <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f5f5f5;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                }
                .container {
                    background-color: white;
                    padding: 30px 50px;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    text-align: center;
                }
                h1 {
                    color: #4CAF50;
                }
                p {
                    color: #333;
                    font-size: 16px;
                }
                </style>
            </head>
            <body>
                <div class="container">
                <h1>✅ E-mail vérifié !</h1>
                <p>Votre compte a été activé avec succès. Bienvenue sur Suspendall !</p>
                </div>
            </body>
            </html>
            `;
            res.setHeader('Content-Type', 'text/html');
            return res.send(htmlContent);
            // return { message: 'L’utilisateur a été vérifié avec succès.' };
        } catch (error) {
            if (error instanceof NotFoundException) {
            throw new NotFoundException('L’utilisateur demandé est introuvable. Veuillez vérifier les informations fournies.');
            } else {
                throw error;
            }
        }
    }

    // get user details
    @UseGuards(JwtAuthGuard)
    @Get(':id')
    getUser(@Param('id') id: number){
        return this.userService.getUser(+id)
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin)
    @Get()
    getUsers(@Query() query){
        return this.userService.getUsers(query)
    }

    //admin can create users (profitable or benefactor)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin)
    @Post()
    addUser(@Body() createUserDto: CreateUserDto){
        return this.userService.addUser(createUserDto)
    }

    @UseGuards(JwtAuthGuard)
    @Put('update-password')
    async updatePassword(
        @User() user, 
        @Body() body: { current_password: string; new_password: string 
        }) {
        
        return await this.userService.updatePassword(user.id, body.current_password, body.new_password);
    }

    // connected user can update his data
    @UseGuards(JwtAuthGuard)
    @Put('me')
    updateMyData(@User() user, @Body() updateUserDto: UpdateUserDto){

        return this.userService.updateMyData(user.id , updateUserDto)
    }


    // @UseGuards(JwtAuthGuard, RolesGuard)
    // @Roles(Role.Admin)
    // @Put(':id')
    // updateUserByAdmin(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto){
        
    //     return this.userService.updateUserByAdmin(+id, updateUserDto)
    // }

    //admin can delete users (profitable or benefactor)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin)
    @Delete(':id')
    deleteUser(@Param('id') id: string){
        return this.userService.deleteUser(+id)
    }

    @Patch('reset-password')
    async resetPassword(@Body() body: any) {
        
        const {new_password, token} = body;
        try {
            const payload = await this.jwtService.verifyAsync(
                token,
                {
                secret: jwtConstants.secret
                }
            );
            const user = payload;
            return this.userService.resetPassword(user.id, body.new_password)
        } catch {
            throw new HttpException('Vous n’êtes pas autorisé à effectuer cette action.', HttpStatus.UNAUTHORIZED)
        }
    }

    @Patch('reset-password/send-token')
    resetPassword_sendOtp(@Body() body: any) 
    {
        const {email} = body;
        return this.userService.resetPassword_sendToken( email )
    }

    // Connected user can change or add photo
    @UseGuards(JwtAuthGuard)
    @Post('photo')
    @UseInterceptors(
        FileInterceptor('file', {
          storage: diskStorage({
            destination: './uploads/user',
          }),
        }),
    )
    async uploadPhoto(
        @User() user,
        @UploadedFile(
            new ParseFilePipeBuilder()
              .addFileTypeValidator({
                fileType: /(jpg|jpeg|png)$/,
              })
              .build({
                fileIsRequired: true,
              }),
          )
          file?: Express.Multer.File,
        ) {

        if (file) {
            file.path = path.normalize(file.path).replace(/\\/g, '/'); 
        }
        return {
            data: await this.userService.addPhoto(user.id, file),
        };
    }

   
}
