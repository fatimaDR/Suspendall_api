import { Type } from "class-transformer";
import { IsBoolean, IsMilitaryTime, IsNotEmpty, IsNumber, IsOptional, ValidateIf } from "class-validator";


export class CreateOpeningHourDto {

    @IsNumber()
    @IsNotEmpty()
    day: number

    @IsMilitaryTime()
    // @ValidateIf((o) => o.isClosed == false)
    @IsNotEmpty()
    openingTime:String

    @IsMilitaryTime()
    // @ValidateIf((o) => o.isClosed == false)
    @IsNotEmpty()
    closingTime:String

    @IsBoolean()
    @IsNotEmpty()
    isClosed: Boolean
}
