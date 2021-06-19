import { HttpException, Injectable } from '@nestjs/common';
import { Config } from './config/config.entity';
import { Search } from './util/entity/search.entity';
import { mysqlService } from './util/mysql.instance';
import { getLatestDate } from './util/settings.function';
import { Translator } from './util/translator';

@Injectable()
export class AppService {
  async addOneSearch(v: string, des: string) {
    const search = new Search(-1, v, des);
    await search.create();
    return {
      msg: '不存在则创建',
      v: search.v,
      id: search.id,
      warn: '该关键字将会在**下一次**爬取时生效'
    }
  }

  async getAllSearch() {
    const ret = [];

    const searches = await Search.fetchAll();
    for(const search of searches) {
      const date = await getLatestDate(search.v);
      ret.push({
        sid: search.id,
        v: search.v,
        des: search.des,
        date
      });
    }

    return ret;
  }

  async getContent(sid: number, pageSize: number, offset: number) {
    const config = Config.load();
    const search = new Search(sid);
    const exists = await search.fetch();
    if(!exists) {
      throw new HttpException({
        msg: 'sid不存在'
      }, 406);
    }

    const date = await getLatestDate(search.v);
    if(date === undefined) {
      return {
        total: 0,
        papers: [],
        des: search.des,
        v: search.v,
        date
      }
    }
    const total_sql = `
      select count(*) as total from paper
      where search_time > ? and sid = ?;
    `;
    const total_res = await mysqlService.query(total_sql, [date, sid]);
    const total = total_res[0].total;

    const select_sql = `
      select paper.id as pid, paper.title as title, paper.type as type, paper.publication as publication, paper.time as time,
        abstract.content as abstract, paper.origin_id as origin_id
      from paper
        left join abstract on paper.id = abstract.pid
      where search_time >= ? and sid = ?
      limit ?, ?;
    `;

    const ret = {
      total,
      papers: [],
      des: search.des,
      v: search.v,
      date
    }
    
    let index = offset + 1;

    const select_res = await mysqlService.query(select_sql, [date, sid, offset, pageSize]);
    for(const s of select_res) {
      const paper = {
        index,
        id: s.pid,
        origin_title: s.title,
        title: await (new Translator(s.title)).fetch(),
        type: s.type,
        publication: s.publication,
        time: s.time,
        abstract: await (new Translator(s.abstract)).fetch(),
        authors: [],
        url: `${config.ncbi.prefix}/${s.origin_id}`,
        keywords: []
      }
      index += 1;
      const author_sql = `
        select author.name as name
        from paper
          join paper_author on paper.id = paper_author.pid
          join author on paper_author.aid = author.id
        where paper.id = ?;
      `;

      const author_res = await mysqlService.query(author_sql, [s.pid]);
      for(const a of author_res) {
        paper.authors.push(a.name);
      }

      const keyword_sql = `
        select keyword.content
        from paper
          join paper_keyword on paper.id = paper_keyword.pid
          join keyword on paper_keyword.kid = keyword.id
        where paper.id = ?;
      `;
      const keyword_res = await mysqlService.query(keyword_sql, [s.pid]);
      for(const k of keyword_res) {
        paper.keywords.push(k.content);
      }
      ret.papers.push(paper);
    }
    return ret;
  }
}
