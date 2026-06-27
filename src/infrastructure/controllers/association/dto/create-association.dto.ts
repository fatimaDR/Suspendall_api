import { IsNotEmpty, IsString } from "class-validator";

export class CreateAssociationDto{
    
    @IsString()
    @IsNotEmpty()
    sirenNumber:string

}
