import { Module } from '@nestjs/common';
import { AssociationService } from './association.service';
import { AssociationController } from '../../controllers/association/association.controller';
import { associationProviders } from 'src/infrastructure/providers/association.providers';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  controllers: [AssociationController],
  providers: [AssociationService, ...associationProviders],
  imports: [DatabaseModule],
  exports: [AssociationService, ...associationProviders]
})
export class AssociationModule {}
