import { PartialType } from '@nestjs/mapped-types';
import { CreateProfitableDto } from './create-profitable.dto';

export class UpdateProfitableDto extends PartialType(CreateProfitableDto) {}
