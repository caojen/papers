import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { main } from './util/main.functions';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await main(); // 爬虫入口点
  // await app.listen(3000); // 后端接入点
}
bootstrap();
