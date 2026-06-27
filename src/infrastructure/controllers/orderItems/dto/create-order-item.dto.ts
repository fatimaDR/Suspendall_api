import { IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class CreateOrderItemDto {

    @IsOptional()
    @IsNumber()
    productPrice:number

    @IsNotEmpty()
    @IsNumber()
    quantity:number

    @IsOptional()
    @IsNumber()
    orderId:number

    @IsNotEmpty()
    @IsNumber()
    productId: number

    @IsOptional()
    @IsNumber()
    productMaraudeId: number

    @IsOptional()
    @IsNumber()
    productEventId: number

    @IsOptional()
    @IsNumber()
    suspendu: number

}
