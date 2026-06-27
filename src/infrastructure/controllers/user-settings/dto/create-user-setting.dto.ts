import { IsBoolean, IsNotEmpty, IsNumber } from "class-validator"

export class CreateUserSettingDto {

    @IsNotEmpty()
    @IsBoolean()
    isNotifActive: boolean

    // @IsNotEmpty()
    // @IsNumber()
    // userId: number
}
