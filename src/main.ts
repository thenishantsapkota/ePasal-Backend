import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { AppModule } from './app.module';

dotenv.config({ path: `./.env.${process.env.NODE_ENV}` });

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('GoPhysio App Backend')
    .setDescription('NestJS API for GoPhysio Application')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.enableCors();
  app.useStaticAssets(join(__dirname, '../', 'public'));
  await app.listen(process.env.APP_PORT);
}
bootstrap();
