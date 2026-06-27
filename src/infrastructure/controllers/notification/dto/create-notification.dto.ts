import { IsString } from "class-validator";

export class CreateNotificationDto {
    @IsString()
    deviceId: string;

    @IsString()
    deviceType: string;

    @IsString()
    deviceToken: string;
}
