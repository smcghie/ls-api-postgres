import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { RateLimiterGuard } from 'nestjs-rate-limiter';

async function bootstrap() {
  
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CORS_ORIGIN, 
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe())

  app.use(cookieParser());
  
  const PORT = process.env.PORT || 3000
  await app.listen(PORT);
}
bootstrap();
