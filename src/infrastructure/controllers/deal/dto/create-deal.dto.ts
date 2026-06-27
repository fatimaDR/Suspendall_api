import { IsArray, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateDealDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    link: string;

    @IsOptional()
    @IsString()
    opportunity: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsOptional()
    @IsString()
    from: Date;

    @IsOptional()
    @IsString()
    to: Date;

    @IsOptional()
    @IsString()
    moduleType:string

    @IsNumber()
    @IsNotEmpty()
    categoryId: number;

    // @IsArray()
    // @IsNotEmpty()
    // media: [];

    @IsNumber()
    @IsNotEmpty()
    productId: number;
}
