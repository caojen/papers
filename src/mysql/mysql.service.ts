import { Injectable, Logger } from '@nestjs/common';
import { Config } from 'src/config/config.entity';

import * as mysql from 'mysql2/promise';

@Injectable()
export class MysqlService {
  private config: Config = null;

  private selectPool: mysql.Pool = null;
  private executePool: mysql.Pool = null;
  private logger: Logger = new Logger(MysqlService.name);

  constructor() {
    this.config = Config.load();
    this.selectPool = mysql.createPool({
      host: this.config.mysql.host,
      port: parseInt(this.config.mysql.port),
      database: this.config.mysql.database,
      password: this.config.mysql.pass,
      user: this.config.mysql.user,
      multipleStatements: false,
      connectionLimit: 20,
      waitForConnections: true,
      queueLimit: 0,
    });
    this.executePool = mysql.createPool({
      host: this.config.mysql.host,
      port: parseInt(this.config.mysql.port),
      database: this.config.mysql.database,
      password: this.config.mysql.pass,
      user: this.config.mysql.user,
      multipleStatements: false,
      connectionLimit: 20,
      waitForConnections: true,
      queueLimit: 0,
    });
  }

  async query(sql: string, params: any[] = []): Promise<any> {
    try {
      if (sql.trim().substr(0, 6).toLocaleLowerCase() === 'select') {
        const res = await this.selectPool.query(sql, params);
        return res[0];
      } else {
        const res = await this.executePool.query(sql, params);
        return res[0];
      }
    } catch (err) {
      this.logger.error(err);
      throw new Error('数据库查询出错');
    }
  }
}
