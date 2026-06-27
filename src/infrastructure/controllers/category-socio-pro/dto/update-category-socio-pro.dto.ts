import { PartialType } from '@nestjs/mapped-types';
import { CreateCategorySocioProDto } from './create-category-socio-pro.dto';

export class UpdateCategorySocioProDto extends PartialType(CreateCategorySocioProDto) {}
