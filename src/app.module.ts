import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './infrastructure/services/user/user.module';
import { CityModule } from './infrastructure/services/city/city.module';
import { UserController } from './infrastructure/controllers/user/user.controller';
import { BusinessModule } from './infrastructure/services/business/business.module';
import { CategoryModule } from './infrastructure/services/category/category.module';
import { ProductModule } from './infrastructure/services/product/product.module';
import { StockModule } from './infrastructure/services/stock/stock.module';
import { MediaModule } from './infrastructure/services/media/media.module';
import { OpeningHoursModule } from './infrastructure/services/openingHours/opening-hours.module';
import { SettingsModule } from './infrastructure/services/settings/settings.module';
import { ReservationModule } from './infrastructure/services/reservation/reservation.module';
import { EventModule } from './infrastructure/services/event/event.module';
import { NotificationModule } from './infrastructure/services/notification/notification.module';
import { MaraudeModule } from './infrastructure/services/maraude/maraude.module';
import { PartnerModule } from './infrastructure/services/partner/partner.module';
import { FeedbackModule } from './infrastructure/services/feedback/feedback.module';
import { OrderModule } from './infrastructure/services/order/order.module';
import { OrderItemsModule } from './infrastructure/services/orderItems/order-items.module';
import { ProfitableModule } from './infrastructure/services/profitable/profitable.module';
import { BenefactorModule } from './infrastructure/services/benefactor/benefactor.module';
import { AssociationModule } from './infrastructure/services/association/association.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import databaseConfig from './configs/database.config';
import mailConfig from './configs/mail.config';
import { PaymentModule } from './infrastructure/services/payment/payment.module';
// import { StripeModule } from 'nestjs-stripe';
import { AdminModule } from './infrastructure/services/admin/admin.module';
import { SubCategoryModule } from './infrastructure/services/sub-category/sub-category.module';
import { UserSettingsModule } from './infrastructure/services/user-settings/user-settings.module';
import { FavorisModule } from './infrastructure/services/favoris/favoris.module';
import { LikeModule } from './infrastructure/services/like/like.module';
import { TagModule } from './infrastructure/services/tag/tag.module';
import { DealModule } from './infrastructure/services/deal/deal.module';
import { CategorySocioProModule } from './infrastructure/services/category-socio-pro/category-socio-pro.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { TypeBusinessModule } from './infrastructure/services/type-business/type-business.module';
import { UserNotificationModule } from './infrastructure/services/user-notification/user-notification.module';
import { PushNotificationModule } from './infrastructure/services/push-notification/push-notification.module';
import { UserPushNotificationModule } from './infrastructure/services/user-push-notification/user-push-notification.module';
import { DayModule } from './infrastructure/services/day/day.module';
import { ResetPasswordModule } from './infrastructure/services/reset-password/reset-password.module';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ProductLimitRequestModule } from './infrastructure/services/productLimitRequest/product-limit-request.module';




@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig, mailConfig],
      isGlobal: true,
    }),
    UserModule,
    CityModule,
    BusinessModule,
    CategoryModule,
    ProductModule,
    StockModule,
    MediaModule,
    OpeningHoursModule,
    SettingsModule,
    ReservationModule,
    EventModule,
    NotificationModule,
    MaraudeModule,
    PartnerModule,
    FeedbackModule,
    OrderModule,
    OrderItemsModule,
    ProfitableModule,
    BenefactorModule,
    AssociationModule,
    AuthModule,
    MailModule,
    MaraudeModule,
    BusinessModule,
    PartnerModule,
    PaymentModule,
    AdminModule,
    SubCategoryModule,
    UserSettingsModule,
    FavorisModule,
    LikeModule,
    TagModule,
    DealModule,
    CategorySocioProModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    TypeBusinessModule,
    PushNotificationModule,
    UserNotificationModule,
    UserPushNotificationModule,
    DayModule,
    ResetPasswordModule,
    ProductLimitRequestModule,
  ],
  
  controllers: [AppController],
  providers: [
    AppService,
    
  ],
})
export class AppModule {}
