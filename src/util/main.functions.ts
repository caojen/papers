import { Config } from '../config/config.entity';
import { HttpService } from '../http/http.service';
import { MysqlService } from '../mysql/mysql.service';
import log from '../util/logger.functions';
import { Article } from './article.entity';
import * as arfs from './article.function';

const mysqlService = new MysqlService();
const http = new HttpService();

function getNextDate(date: Date, interval: number) {
  const ret = new Date(date);
  ret.setDate(date.getDate() + interval);
  return ret;
}

function date2string(date: Date) {
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
}

async function fetchAndStore(id: number) {
  if (await Article.existsId(id)) {
    log.warn([id, 'exists. Skip...']);
  }
  const config = Config.load();
  const r = (await http.get(`${config.ncbi.prefix}/${id}`)).toString();
  log.log(['-- fetch', id, 'done']);
  // console.log(r);

  const detail = {
    id,
    type: arfs.get_type(r),
    publication: arfs.get_publication(r),
    time: arfs.get_time(r),
    title: arfs.get_title(r),
    authors: arfs.get_authors(r),
    abstract: arfs.get_abstract(r),
    keywords: arfs.get_keywords(r),
  };
  // console.log(detail);

  const article = new Article(detail);
  const pid = await article.sync();
  log.log(['-- store', id, '=>', pid]);
}

async function thread(
  param: {
    search: string;
    page: number;
    begintime: Date;
    interval: number;
  },
  id = 0,
) {
  const config = Config.load();

  log.log([
    `thread ${id}, search = ${param.search}, page = ${param.page}, begintime = ${param.begintime}, interval = ${param.interval}`,
  ]);
  log.log(['thread', id, 'getting full page']);

  const prefix = config.ncbi.prefix;
  const begin = param.begintime;
  const end = new Date(begin);
  end.setDate(end.getDate() + param.interval - 1);

  let r = await http.gets(prefix, {
    page: param.page,
    search: param.search,
    filter: `dates.${date2string(begin)}-${date2string(end)}`,
  });

  // get total results:
  let totalResults = 0;
  {
    const e_totalResult = new RegExp(
      `${config.ncbi.totalResults}:\\sparseInt\\("\\d+"`,
      'g',
    );
    const str = e_totalResult.exec(r)[0];
    const n = /\d+/g.exec(str)[0];
    totalResults = parseInt(n);
  }

  if (totalResults > 10000) {
    totalResults = 10000;
  }
  const totalPage = Math.ceil(totalResults / config.ncbi.pagesize);
  let curpage = 1;

  // 从数据库的断点续传表中获取最新的page
  {
    const fetch_newpage_sql = `
      select page from settings
      where search = ? and date = ?;
    `;

    const ret = await mysqlService.query(fetch_newpage_sql, [
      param.search,
      date2string(begin),
    ]);
    if (ret.length !== 0) {
      curpage = ret[0].page + 1;
      log.log(['thread', id, 'curpage jump to', curpage]);
      r = await http.gets(prefix, {
        page: curpage,
        search: param.search,
        filter: `dates.${date2string(begin)}-${date2string(end)}`,
      });
    }
  }

  do {
    // r is the page:
    // 1. get all ids:
    const ids = [];
    {
      const e_ids = new RegExp(`${config.ncbi.ids}="\\S+"`, 'g');
      const str = e_ids.exec(r)[0];
      const s = str.substr(config.ncbi.ids.length + 2, str.length - 2);
      const split = s.split(',');
      for (const ss of split) {
        ids.push(parseInt(ss));
      }
    }

    for (const i of ids) {
      log.log(['thread', id, 'fetch and store', i]);
      await fetchAndStore(i);
    }

    // 写入最新的数据：
    const update_newpage_sql = `
      insert into settings(search, date, page)
      values(?, ?, ?)
      on duplicate key update page = ?;
    `;

    await mysqlService.query(update_newpage_sql, [
      param.search,
      date2string(begin),
      curpage,
      curpage,
    ]);

    curpage += 1;
    r = await http.gets(prefix, {
      page: curpage,
      search: param.search,
      filter: `dates.${date2string(begin)}-${date2string(end)}`,
    });
  } while (curpage <= totalPage);
}

export async function main() {
  const config = Config.load();
  const threads = config.time.threads;
  for (const keyword of config.search.keywords) {
    const page = 1;
    let date = new Date(config.search.begindate);
    let end = new Date(config.search.enddate);
    end = getNextDate(end, 1);

    const arr: Promise<any>[] = [];

    while (date < end) {
      for (let i = 0; i < threads && date < end; i++) {
        arr.push(
          thread(
            {
              search: keyword,
              page,
              interval: config.search.interval,
              begintime: date,
            },
            i + 1,
          ),
        );
        date = getNextDate(date, 1);
      }
      Promise.all(arr).then(() => log.log(['所有线程被退出']));
    }
  }

  // todo: continue
}
