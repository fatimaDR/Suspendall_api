import { IsBoolean, IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class CreateReservationDto {
    
    @IsBoolean()
    @IsNotEmpty()
    collected:boolean

    @IsNumber()
    @IsOptional()
    suspenduId:number

    @IsNumber()
    @IsOptional()
    profitableId: number
}
