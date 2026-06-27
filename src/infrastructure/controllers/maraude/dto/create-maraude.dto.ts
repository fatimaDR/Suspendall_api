import { Type } from "class-transformer"
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"

export class CreateMaraudeDto {
    
    @IsString()
    @IsOptional()
    description:string

    @IsString()
    @IsNotEmpty()
    name:string

    @IsString()
    @IsOptional()
    endDate:string

    @IsString()
    @IsOptional()
    message:string

    @IsNumber()
    @Type(() => Number)
    @IsOptional()
    businessId: number

    @IsNumber()
    @Type(() => Number)
    @IsOptional()
    partnerId: number

}
