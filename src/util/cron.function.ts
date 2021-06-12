import { Config } from 'src/config/config.entity';
import { HttpService } from 'src/http/http.service';
import { Article } from './entity/article.entity';
import { Search } from './entity/search.entity';
import log from './logger.functions';
import { mysqlService } from './mysql.instance';

const http = new HttpService();

export async function cron_main() {
  await main();
}

export async function cron_exit() {
  log.log(['cron exited...']);
}

async function main() {
  // load static config
  const config = Config.load();

  // fetch all `search` that will be used later
  const searches: Search[] = await Search.fetchAll();

  // get the date that will be searched
  // **yesterday**
  const start = getPrevDate(new Date());
  const end = getPrevDate(new Date());

  // for each search in searches:
  for (const s of searches) {
    // prepare to start
    await prepare(s, start, end);
  }
}

async function prepare(search: Search, start: Date, end: Date) {
  const config = Config.load();

  // get the first page to resolve basic information
  const prefix = config.ncbi.prefix;
  const params = {
    page: 1,
    search: search.v,
    filter: `dates.${date2string(start)}-${date2string(end)}`,
  };
  const firstPage = await http.gets(prefix, params);
  const totalResult = getTotalResult(config, firstPage);
  const totalPage = Math.ceil(totalResult / config.ncbi.pagesize);
  // fetch from database.settings, as curPage
  let curPage = await getCurPage(search, start);

  while (curPage <= totalPage) {
    // each thread deal with 10 pages, config.time.threads total.
    const threads: Promise<any>[] = [];
    const pagePerThread = 10;
    for (let i = 0; i < config.time.threads && curPage <= totalPage; i++) {
      let endPage = curPage + pagePerThread;
      if (endPage > totalPage) {
        endPage = totalPage + 1;
      }
      threads.push(thread_main(i + 1, config, search, start, curPage, endPage));
      curPage = endPage;
    }
    // wait threads finish
    Promise.all(threads).then(() => log.log(['所有线程已退出']));
  }

  log.log(['search for', search, start, 'done', curPage, '/', totalPage]);
}

async function thread_main(
  threadid: number,
  config: Config,
  search: Search,
  time: Date,
  beginPage: number,
  endPage: number,
) {
  log.log(['thread', threadid, 'started', search.v, time, beginPage, endPage]);
  // for each page:
  for(let page = beginPage; page < endPage; page++) {
    // fetch the context:
    const params = {
      page,
      search: search.v,
      filter: `dates.${date2string(time)}-${date2string(time)}`
    }
    const context = await http.gets(config.ncbi.prefix, params);
    // get all ids in this page(context)
    const ids = getContextIds(config, context);
    if(ids.length === 0) {
      log.warn(['thread', threadid, '获取页', page, 'id失败']);
    } else {
      log.log(['thread', threadid, 'pages: ', ...ids]);
      for(const id of ids) {
        await fetchAndStore(id, time, search);
      }
    }
  }
}

async function fetchAndStore(id: number, time: Date, search: Search) {
  if(await Article.exists_origin_id(id) === true) {
    log.log([id, 'exists, skip...']);
  }

  const config = Config.load();
  const context = await http.get(`${config.ncbi.prefix}/${id}`);
  const article = new Article(id, context, time, search);
  if(article.resolve()) {
    await article.sync();
  }
}

function getPrevDate(date: Date, interval = 1): Date {
  const ret = new Date(date);
  ret.setDate(date.getDate() - interval);
  return ret;
}

function date2string(date: Date): string {
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
}

function getTotalResult(config: Config, page: string): number {
  const e_totalResult = new RegExp(
    `${config.ncbi.totalResults}:\\s+parseInt\\("\\d+"`,
    'g',
  );
  const str = e_totalResult.exec(page)[0];
  const n = /\d+/g.exec(str)[0];
  let r = parseInt(n);
  if (r > 10000) {
    r = 10000;
  }
  return r;
}

async function getCurPage(search: Search, time: Date) {
  const fetch_newpage_sql = `
    select page from settings
    where search = ? and date = ?;
  `;
  const ret = await mysqlService.query(fetch_newpage_sql, [
    search.v,
    date2string(time),
  ]);
  if (ret.length === 0) {
    return 1;
  } else {
    return ret[0].page + 1;
  }
}

function getContextIds(config: Config, context: string): number[] {
  const e_ids = new RegExp(`${config.ncbi.ids}="\\S+"`, 'g');
  let n = e_ids.exec(context);
  if(n === null) {
    return [];
  }
  const ids = [];
  const str = n[0];
  const s = str.substr(config.ncbi.ids.length + 2, str.length - 2);
  const split = s.split(',');
  for (const ss of split) {
    ids.push(parseInt(ss));
  }
  return ids;
}