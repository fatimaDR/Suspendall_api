import { IsNotEmpty, IsNumber, IsOptional, IsString, isNotEmpty } from "class-validator";

export class CreateProfitableDto{
    
    @IsString()
    @IsNotEmpty()
    studentCard:string
}
