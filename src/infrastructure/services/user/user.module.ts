import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from 'src/infrastructure/controllers/user/user.controller';
import { AssociationModule } from '../association/association.module';
import { BenefactorModule } from '../benefactor/benefactor.module';
import { ProfitableModule } from '../profitable/profitable.module';
import { DatabaseModule } from 'src/database/database.module';
import { userProviders } from 'src/infrastructure/providers/user.providers';
import { JwtModule } from '@nestjs/jwt';
import { MailModule } from 'src/mail/mail.module';
import { jwtConstants } from 'src/auth/constants';
import { BusinessModule } from '../business/business.module';
import { CityModule } from '../city/city.module';
import { UserSettingsModule } from '../user-settings/user-settings.module';
import { NotificationModule } from '../notification/notification.module';
import { MediaModule } from '../media/media.module';
import { CategorySocioPro } from 'src/infrastructure/entities/category-socio-pro.entity';
import { CategorySocioProModule } from '../category-socio-pro/category-socio-pro.module';
import { ReservationModule } from '../reservation/reservation.module';
import { ResetPasswordModule } from '../reset-password/reset-password.module';

@Module({

  controllers: [UserController],
  providers: [UserService, ...userProviders],
  exports: [UserService, ...userProviders],
  imports:[
    DatabaseModule ,
    AssociationModule,
    BenefactorModule, 
    ProfitableModule,
    forwardRef(() => BusinessModule),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1h' },
    }),
    MailModule,
    CityModule,
    CategorySocioProModule,
    MediaModule,
    forwardRef(() => NotificationModule),
    forwardRef(() => UserSettingsModule),
    forwardRef(() => ReservationModule),
    ResetPasswordModule
    
  ]
})
export class UserModule {

}
