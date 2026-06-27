import { IsNotEmpty, IsString } from "class-validator";

export class CreateTagDto {

    @IsNotEmpty()
    @IsString()
    label: string
}
