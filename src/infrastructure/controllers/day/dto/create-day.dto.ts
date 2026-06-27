import { IsNotEmpty, IsString } from "class-validator";

export class CreateDayDto {
    @IsString()
    @IsNotEmpty()
    name:string
}
