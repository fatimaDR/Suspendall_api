import { IsNotEmpty, IsString } from "class-validator";

export class CreateTypeBusinessDto {

    @IsNotEmpty()
    @IsString()
    name:string
}
