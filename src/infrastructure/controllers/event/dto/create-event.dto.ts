import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateEventDto {

    @IsString()
    @IsNotEmpty()
    name:string

    @IsString()
    @IsOptional()
    description:string

    @IsString()
    @IsOptional()
    message:string

    @IsString()
    @IsOptional()
    endDate:Date

    // @IsNumber({},{each: true})
    @IsArray()
    @Type(() => Number)
    @ArrayNotEmpty()
    partnerIds: number[];
}
