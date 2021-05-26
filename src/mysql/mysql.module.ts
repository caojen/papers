import { Module } from '@nestjs/common';
import { ConfigModule } from 'src/config/config.module';
import { MysqlService } from './mysql.service';

@Module({
  providers: [MysqlService]
})
export class MysqlModule {}
