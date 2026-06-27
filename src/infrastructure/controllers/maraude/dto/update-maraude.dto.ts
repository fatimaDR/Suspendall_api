import { PartialType } from '@nestjs/mapped-types';
import { CreateMaraudeDto } from './create-maraude.dto';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateMaraudeDto extends PartialType(CreateMaraudeDto) {
    // @IsString()
    // @IsOptional()
    // description:string

    // @IsString()
    // @IsNotEmpty()
    // name:string

    // @IsString()
    // @IsOptional()
    // endDate:string

    // @IsString()
    // @IsOptional()
    // message:string

    // @IsNumber()
    // @IsNotEmpty()
    // businessId:number
    
    
    // @IsNumber()
    // @IsOptional()
    // userId:number
    
    // @IsNumber()
    // @IsOptional()
    // associationId:number

    // @IsNumber()
    // @IsOptional()
    // partnerId:number
}
