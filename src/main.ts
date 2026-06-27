import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
var hbs = require('express-hbs');

async function bootstrap() {

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');
  // app.useGlobalPipes(new ValidationPipe());

app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
    exceptionFactory: (validationErrors = []) => {
      const errorMap = new Map<string, string[]>();
      for (const err of validationErrors) {
        if (err.constraints) {
          const messages = Object.values(err.constraints);
          if (!errorMap.has(err.property)) {
            errorMap.set(err.property, []);
          }
          errorMap.get(err.property).push(...messages);
        }
      }

      const errors = Array.from(errorMap.entries()).map(([field, messages]) => ({
        field,
        message: messages.join('. '), // Tu peux customiser le séparateur ici
      }));

      return new BadRequestException({ message: '', errors });
    },
  }),
);

  // GENERATE PDF
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.engine('hbs', hbs.express4({
    partialsDir: join(__dirname, '..', 'views/partials')
  }));
  app.set('view engine', 'hbs');
  app.set('views',join(__dirname, '..', 'views'));
  app.enableCors();

  await app.listen(3000);
  
}
bootstrap();
