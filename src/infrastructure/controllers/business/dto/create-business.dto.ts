import { IsLatitude, IsLongitude, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateBusinessDto {

    @IsString()
    @IsOptional()
    name:string

    @IsString()
    @IsOptional()
    description:string

    @IsString()
    @IsNotEmpty()
    address:string
    
    // @IsString()
    // @IsOptional()
    // type:string

    // @IsNumber()
    // @IsNotEmpty()
    // type:number

    @IsString()
    @IsNotEmpty()
    sirenNumber:string

    @IsString()
    @IsNotEmpty()
    socialRaison:string

    @IsString()
    @IsOptional()
    rib: string

    @IsNumber()
    @IsNotEmpty()
    iban: number

    @IsNotEmpty()
    @IsLongitude()
    longitude:string

    @IsNotEmpty()
    @IsLatitude()
    latitude:string
}
