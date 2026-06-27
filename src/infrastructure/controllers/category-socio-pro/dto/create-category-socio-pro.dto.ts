import { IsNotEmpty, IsString } from "class-validator"

export class CreateCategorySocioProDto {
    @IsNotEmpty()
    @IsString()
    name:string
   
}
