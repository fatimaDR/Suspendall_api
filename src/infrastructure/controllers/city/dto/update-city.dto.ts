import { PartialType } from '@nestjs/mapped-types';
import { CreateCityDto } from './create-city.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateCityDto extends PartialType(CreateCityDto) {
    @IsString()
    @IsNotEmpty()
    name:string
}
