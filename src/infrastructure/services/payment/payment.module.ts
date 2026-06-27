import { Module } from "@nestjs/common";
import { PaymentService } from "./payment.service";
import { DatabaseModule } from "src/database/database.module";
import { PaymentController } from "src/infrastructure/controllers/payment/payment.controller";
import { paymentProviders } from "src/infrastructure/providers/payment.providers";
import { OrderModule } from "../order/order.module";
import { UserModule } from "../user/user.module";
import { NotificationModule } from "../notification/notification.module";
import { ProductModule } from "../product/product.module";
import { BusinessModule } from "../business/business.module";
import { StockModule } from "../stock/stock.module";
import { BenefactorModule } from "../benefactor/benefactor.module";
import { MailModule } from "src/mail/mail.module";
import { OrderItemsModule } from "../orderItems/order-items.module";

@Module({
    controllers: [PaymentController],
    providers: [PaymentService, ...paymentProviders],
    imports: [
      DatabaseModule, 
      UserModule, 
      NotificationModule, 
      ProductModule, 
      BusinessModule, 
      StockModule, 
      BenefactorModule,
      MailModule,
      OrderItemsModule,
      OrderModule
    ]
  })
  export class PaymentModule {}