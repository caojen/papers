import { NestFactory } from '@nestjs/core';
import { CronJob } from 'cron';
import { AppModule } from './app.module';
import { cron_exit, cron_main } from './util/cron.function';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // 触发定时任务
  new CronJob('* * * * * *', cron_main, cron_exit, true);
  await app.listen(3000); // 后端接入点
}
bootstrap();
