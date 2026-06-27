import { IsNumber, IsOptional } from "class-validator";

export class CreateSettingDto {

    @IsNumber()
    @IsOptional()
    reservationProductLimit: number

    @IsNumber()
    @IsOptional()
    nextReservationTimeLimit: number

    @IsNumber()
    @IsOptional()
    reservationValidationTime: number
    
}
