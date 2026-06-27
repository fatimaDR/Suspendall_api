import { MailerService } from "@nestjs-modules/mailer";
import { ConfigService } from "@nestjs/config";
import { join } from "path";
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

export const mailProviders = [
    {
    provide:'MAIL_SOURCE',
    useFactory: async (config: ConfigService) => {
        const mailSource = new MailerService({
          transport: {
            host: config.get('mail.HOST'),
            secure: false,
            auth: {
              user: config.get('mail.USER'),
              pass: config.get('mail.PASSWORD'),
            },
            tls: {
              rejectUnauthorized: false, // Trust self-signed certificate
            },
          },
          defaults: {
            from: `"Suspendall" <${config.get('mail.FROM')}>`,
          },
          template: {
            dir: join(__dirname, 'templates'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            }          
          },
        }, null);
          
        return mailSource;
      },
      inject: [ConfigService],
    }
];