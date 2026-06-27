import { IsBoolean, IsNotEmpty, IsNumber, IsOptional } from "class-validator"

export class CreateOrderDto {
    @IsNotEmpty()
    @IsNumber()
    totalPrice:number

    @IsNotEmpty()
    @IsNumber()
    tva:number

    @IsNotEmpty()
    @IsNumber()
    stripe:number

    @IsOptional()
    @IsNumber()
    lbs:number

    @IsNotEmpty()
    @IsBoolean()
    payed:boolean

    @IsNotEmpty()
    @IsNumber()
    benefactorId: number
}
