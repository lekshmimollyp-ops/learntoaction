import * as path from 'path';
import * as dotenv from 'dotenv';

// Explicitly load .env from the root (one level up from dist)
const envPath = path.resolve(__dirname, '..', '.env');
const result = dotenv.config({ path: envPath });

console.log('--- ENV DEBUG ---');
console.log('Loading .env from:', envPath);
console.log('Dotenv error:', result.error?.message);
console.log('DATABASE_URL loaded:', !!process.env.DATABASE_URL);
console.log('-----------------');

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
