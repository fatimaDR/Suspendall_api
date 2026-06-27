import { IsOptional, IsString } from "class-validator";

export class CreateProductLimitRequestDto {

    @IsOptional()
    @IsString()
    message?: string;
}
