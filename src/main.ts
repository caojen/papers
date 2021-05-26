
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpService } from './http/http.service';

async function main() {
  const http = new HttpService();
  const r = await http.get('https://pubmed.ncbi.nlm.nih.gov', {
    page: 1,
    search: 'cancer',
    filter: 'dates.2021/5/1-2021/5/10'
  });
  console.log(r.toString());
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  main();         // 爬虫入口点
  await app.listen(3000);
}
bootstrap();
