import { IsNotEmpty, IsNumber } from "class-validator"

export class CreateFavorisDto {
    @IsNumber()
    @IsNotEmpty()
    userId: number

    @IsNumber()
    @IsNotEmpty()
    businessId: number
}
