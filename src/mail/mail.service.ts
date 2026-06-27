import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MailService {
  constructor(
    @Inject('MAIL_SOURCE')
    private mailerService: MailerService
) {}

async send_mail(to, subject, content: any, template?: string) {
  try{

    await this.mailerService.sendMail({
        to: to,
        subject: subject,
        template: template,
        context: content,
    })
  } catch (error) {
      if (error.response) throw new HttpException(error.response, error.status);
        
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
  }
}

async send_file_attachment(to, subject, context, attachmentPath) {
  try {
    const attachment = await fs.promises.readFile(attachmentPath);
    const fileName = path.basename(attachmentPath);
    await this.mailerService.sendMail({
        to: to,
        subject: subject,
        template: 'pdf',
        context: context,
        attachments: [
          {
            filename: fileName,
            content: attachment, 
          },
        ],
    });
  } catch (error) {
    if (error.response) throw new HttpException(error.response, error.status);

    throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
  }
}
  
}
