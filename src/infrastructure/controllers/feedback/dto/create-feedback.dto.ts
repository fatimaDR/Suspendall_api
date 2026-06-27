import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateFeedbackDto {
    @IsNumber()
    @IsNotEmpty()
    note:number

    @IsString()
    @IsOptional()
    comment:string

    // @IsNumber()
    // @IsNotEmpty()
    // profitableId: number

    // @IsNumber()
    // @IsNotEmpty()
    // businessId: number
}
