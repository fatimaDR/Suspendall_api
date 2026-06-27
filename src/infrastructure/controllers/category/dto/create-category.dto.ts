import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { CatType } from "src/infrastructure/entities/category.entity";

export class CreateCategoryDto {
    @IsNotEmpty()
    @IsString()
    name:string
    
    @IsNotEmpty({
        message: 'Le type doit être l’une des valeurs suivantes : PRODUCT, BUSINESS.',
    })
    @IsEnum(CatType)
    type:CatType
}
