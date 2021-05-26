import yaml from 'yaml'
import fs from 'fs'

const cfile = 'config.yaml'

export class Config {
  mysql: {
    host: string,
    port: string,
    user: string,
    pass: string,
    database: string
  };
  search: {
    keywords: string[],
    begindate: string,
    enddate: string,
    interval: number,
    proceed: boolean
  };
  time: {
    thread: number,
    interval: number
  };
  ncbi: {
    prefix: string,
    params: {
      term: string,
      page: string,
      filter: string
    },
    pagesize: number,
    totalResults: string
  };

  private static c: Config = null;

  public static load(): Config {
    if(!Config.c) {
      const s = fs.readFileSync(cfile).toString();
      Config.c = yaml.parse(s);
      Config.c = Config.parseMysql(Config.c);
    }

    return Config.c;
  }

  private static parseMysql(config: Config): Config {
    config.mysql.host = process.env[config.mysql.host];
    config.mysql.pass = process.env[config.mysql.pass];
    config.mysql.database = process.env[config.mysql.database];
    config.mysql.port = process.env[config.mysql.port];
    config.mysql.user = process.env[config.mysql.user];
    return config;
  }
}
