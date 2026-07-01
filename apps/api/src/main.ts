import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors();
  app.setGlobalPrefix('api');

  const uploadDir = config.get<string>('UPLOAD_DIR', './uploads');
  app.useStaticAssets(join(process.cwd(), uploadDir), { prefix: '/uploads' });

  const port = config.get<number>('PORT', 3000);
  await app.listen(port);
  console.log(`Publish API running on http://localhost:${port}/api`);
}

bootstrap();
