import * as crypto from 'crypto';
import { HttpService } from 'src/http/http.service';
import { mysqlService } from './mysql.instance';
import { sleep } from './sleep.function';

const httpService = new HttpService();

export class Translator {
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
      this.output = res[0].content;
      return this.output;
    }
  }

  async fetchNet(): Promise<string> {
    this.output = null;
    const q = encodeURIComponent(this.origin);
    const from = 'auto';
    const to = 'zh';
    const appid = '20210613000861479';
    const key = 'RFbqA20Qk7NVYAOi0n1u';
    const salt = generateSalt();
    const sign = generateSign(appid, this.origin, salt, key);
    const prefix = 'https://fanyi-api.baidu.com/api/trans/vip/translate';
    const url = `${prefix}?q=${q}&from=${from}&to=${to}&appid=${appid}&salt=${salt}&sign=${sign}`;
    
    let response = await httpService.get(url);
    
    let json = JSON.parse(response);
    if(json['error_code']) {
      if(json['error_code'] === '54003') {
        // console.log('54003 limit. sleep.')
        await sleep(2000 + Math.ceil(Math.random() * 20000));
        response = await httpService.get(url);
        json = JSON.parse(response);
        if(!json['error_code']) {
          this.output = '';
          const results = json['trans_result'];
          for(const result of results) {
            this.output += `\n${result['dst']}`;
          }
          this.output = this.output.trim();
        } else {
          // console.log('failed. just null');
          this.output = null;
        }
      } else {
        this.output = null;
      }
    } else {
      this.output = '';
      const results = json['trans_result'];
      for(const result of results) {
        this.output += `\n${result['dst']}`;
      }
      this.output = this.output.trim();
    }
    if(this.output) {
      // save this
      const sql = `
      INSERT INTO translation(md5sum, content)
      VALUES(?, ?)
      `;
      await mysqlService.query(sql, [this.md5sum, this.output]);
    }
    return this.output;
  }
}

function generateSalt() {
  const charset = 'abcdefg123456789';
  const length = charset.length;
  const outlength = 10;
  let ret = '';
  for(let i = 0; i < outlength; i++) {
    ret += charset.charAt(Math.floor(Math.random() * length));
  }
  return ret;
}

function generateSign(appid: string, origin: string, salt: string, key: string) {
  const t = `${appid}${origin}${salt}${key}`;
  const md5 = crypto.createHash('md5');
  md5.update(t);
  const ret = md5.digest('hex');
  return ret;
}
