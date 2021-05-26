import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { MysqlModule } from './mysql/mysql.module';
import { HttpModule } from './http/http.module';

@Module({
  imports: [ConfigModule, MysqlModule, HttpModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
