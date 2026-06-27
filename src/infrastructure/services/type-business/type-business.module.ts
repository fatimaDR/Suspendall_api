import { Module } from '@nestjs/common';

import { TypeBusinessService } from './type-business.service';
import { TypeBusinessProviders } from 'src/infrastructure/providers/typeBusiness.providers';
import { DatabaseModule } from 'src/database/database.module';
import { TypeBusinessController } from 'src/infrastructure/controllers/type-business/type-business.controller';

@Module({
  controllers: [TypeBusinessController],
  providers: [TypeBusinessService, ...TypeBusinessProviders],
  imports: [DatabaseModule],
  exports: [TypeBusinessService, ...TypeBusinessProviders]
})
export class TypeBusinessModule {}
