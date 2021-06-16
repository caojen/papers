import crypto from 'crypto';
import { mysqlService } from './mysql.instance';

class Translator {
  private origin: string;
  private md5sum: string;
  private output: string;

  constructor(origin: string) {
    this.origin = origin;
    const md5 = crypto.createHash('md5');
    md5.update(this.origin);
    this.md5sum = md5.digest('hex');
  }

  async fetch(): Promise<string> {
    // fetch from mysql:
    const mysql_data = await this.fetchMysql();
    if(mysql_data === null) {
      const net_data = await this.fetchNet();
      if(net_data === null) {
        this.output = this.origin;
      } else {
        this.output = net_data;
      }
    } else {
      this.output = mysql_data;
    }

    return this.output;
  }

  async fetchMysql(): Promise<string> {
    const sql = `
      SELECT content FROM translation
      WHERE md5sum = ?;
    `;

    const res = await mysqlService.query(sql, [this.md5sum]);
    if(res.length === 0) {
      return null;
    } else {
      return res[0].content;
    }
  }

  async fetchNet(): Promise<string> {
    return null;
  }
}
