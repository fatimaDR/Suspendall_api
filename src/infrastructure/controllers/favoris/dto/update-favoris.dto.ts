import { PartialType } from '@nestjs/mapped-types';
import { CreateFavorisDto } from './create-favoris.dto';

export class UpdateFavorisDto extends PartialType(CreateFavorisDto) {}
