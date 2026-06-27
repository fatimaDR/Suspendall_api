import { IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';
import { UpdateProfitableDto } from '../../profitable/dto/update-profitable.dto';
import { UpdateBenefactorDto } from '../../benefactor/dto/update-benefactor.dto';
import { UpdateBusinessDto } from '../../business/dto/update-business.dto';
import { UpdateAssociationDto } from '../../association/dto/update-association.dto';
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto){
        
    @IsEmail()
    @IsOptional()
    email:string
    
    @IsString()
    @IsOptional()
    firstName:string
    
    @IsString()
    @IsOptional()
    lastName:string

    @IsString()
    @IsOptional()
    username:string
    
    @IsNumber()
    @IsOptional()
    postalCode:number

    @IsNumber()
    @IsOptional()
    cityId:number

    @IsNumber()
    @IsOptional()
    categoriSocioPro:number

    @IsString()
    @IsOptional()
    phone:string

    @IsOptional()
    profitable: UpdateProfitableDto

    @IsOptional()
    benefactor: UpdateBenefactorDto

    @IsOptional()
    business: UpdateBusinessDto

    @IsOptional()
    association: UpdateAssociationDto
}