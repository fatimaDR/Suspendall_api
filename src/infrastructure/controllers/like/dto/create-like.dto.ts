import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateLikeDto {

    @IsNumber()
    @IsNotEmpty()
    businessId: number

    @IsNumber()
    @IsNotEmpty()
    userId: number
}
