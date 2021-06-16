import { NestFactory } from '@nestjs/core';
import { CronJob } from 'cron';
import { AppModule } from './app.module';
import { cron_exit, cron_main } from './util/cron.function';
import { sleep } from './util/sleep.function';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // const t = new Translator('apple');
  // await t.fetch();
  // 启动时自动触发一次任务
  cron_main();
  await sleep(2000);
  // 触发定时任务
  new CronJob('0 0 */2 * * *', cron_main, cron_exit, true);
  // cron_main();

  // 允许跨域：
  app.enableCors({
    origin: '*'
  });

  app.use('/', express.static('static'));

  app.setGlobalPrefix('api');
  await app.listen(3000); // 后端接入点
}
bootstrap();
