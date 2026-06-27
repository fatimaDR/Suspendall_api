import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { mailProviders } from './mail.providers';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

@Module({
  controllers: [],
  providers: [MailService, ...mailProviders],
  exports: [MailService, ...mailProviders],
  imports: [
    MailerModule.forRoot({
      transport: {
        service: 'gmail', 
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
})
export class MailModule {}
