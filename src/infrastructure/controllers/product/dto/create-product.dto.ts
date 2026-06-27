import { Type } from "class-transformer"
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"

export class CreateProductDto {

    @IsString()
    @IsNotEmpty()
    title:string

    @IsNumber()
    @IsNotEmpty()
    price:number

    @IsString()
    @IsOptional()
    description:string

    @IsBoolean()
    @Type(() => Boolean)
    @IsOptional()
    available:boolean

    @IsNumber()
    @Type(() => Number)
    @IsOptional()
    quantity:number

    @IsArray()
    @IsOptional()
    tags: [];

    @IsNumber()
    @Type(() => Number)
    @IsOptional() 
    subCategory: number;

}
