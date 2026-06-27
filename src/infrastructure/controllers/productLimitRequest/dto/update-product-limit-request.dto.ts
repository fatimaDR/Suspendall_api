import { PartialType } from '@nestjs/mapped-types';
import { CreateProductLimitRequestDto } from './create-product-limit-request.dto';

export class UpdateProductLimitRequestDto extends PartialType(CreateProductLimitRequestDto) {}
