import { Module, forwardRef } from '@nestjs/common';
import { BusinessService } from './business.service';
import { BusinessController } from '../../controllers/business/business.controller';
import { businessProviders } from 'src/infrastructure/providers/business.providers';
import { DatabaseModule } from 'src/database/database.module';
import { CategoryModule } from '../category/category.module';
import { MailModule } from 'src/mail/mail.module';
import { MediaModule } from '../media/media.module';
import { ProductModule } from '../product/product.module';
import { SubCategoryModule } from '../sub-category/sub-category.module';
import { TagModule } from '../tag/tag.module';
import { StockModule } from '../stock/stock.module';
import { ReservationModule } from '../reservation/reservation.module';
import { OpeningHoursModule } from '../openingHours/opening-hours.module';
import { OrderModule } from '../order/order.module';
import { ProductLimitRequestModule } from '../productLimitRequest/product-limit-request.module';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/auth/constants';

@Module({
  controllers: [BusinessController],
  providers: [BusinessService, ...businessProviders],
  imports:[
    DatabaseModule, 
    forwardRef(() => CategoryModule ),
    MailModule,
    MediaModule,
    ProductModule,
    SubCategoryModule,
    TagModule,
    forwardRef(() =>StockModule),
    ReservationModule,
    forwardRef(() =>OpeningHoursModule) ,
    OrderModule ,
    forwardRef(() =>ProductLimitRequestModule), 
    forwardRef(() =>UserModule),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  exports: [BusinessService, ...businessProviders]
})
export class BusinessModule {}
