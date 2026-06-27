import { PartialType } from '@nestjs/mapped-types';
import { CreateTypeBusinessDto } from './create-type-business.dto';

export class UpdateTypeBusinessDto extends PartialType(CreateTypeBusinessDto) {}
