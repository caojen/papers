import { MysqlService } from "src/mysql/mysql.service";
import { Author } from "./author.entity";
import { Keyword } from "./keyword.entity";
import log from './logger.functions'

export class Article {
  static mysqlService: MysqlService = null;
  pid?: number;

  id: number; // origin_id
  type: string;
  publication: string;
  time: string;
  title: string;
  authors: string[];
  abstract: string;
  keywords: string[];

  // constructor(id: number) {
  //   if(Article.mysqlService == null) {
  //     Article.mysqlService = new MysqlService();
  //   }
  //   this.id = id;
  // }

  constructor(detail: any) {
    if(Article.mysqlService == null) {
      Article.mysqlService = new MysqlService();
    }
    this.id = detail.id;
    this.type = detail.type;
    this.publication = detail.publication;
    this.time = detail.time;
    this.title = detail.title;
    this.authors = detail.authors;
    this.abstract = detail.abstract;
    this.keywords = detail.keywords;
  }

  static async existsId(origin_id: number) {
    if(Article.mysqlService == null) {
      Article.mysqlService = new MysqlService();
    }
    const sql = `
      select 1 from paper
      where origin_id=?;
    `;

    const res = await Article.mysqlService.query(sql, [origin_id]);
    return res.length !== 0;
  }

  // to test if id is exists
  async exists(): Promise<Boolean> {
    const sql = `
      select id from paper
      where origin_id = ?;
    `;

    const res = await Article.mysqlService.query(sql, [this.id]);
    if(res.length === 0) {
      return false;
    } else {
      this.pid = res[0].id;
      return true;
    }
  }
  async sync(): Promise<number> {
    if(await this.exists()) {
      log.warn([this.pid, 'exists. Skip...']);
      return this.pid;
    }
    const paper = `
      insert into paper(origin_id, type, publication, time, title)
      values(?, ?, ?, ?, ?);
    `
    const res = await Article.mysqlService.query(paper, [this.id, this.type, this.publication, this.time, this.title]);
    this.pid = res.insertId;
    for(const author of this.authors) {
      const a = new Author(author);
      const aid = await a.sync();
      const sql = `
        insert into paper_author(pid, aid)
        values(?, ?);
      `;
      await Article.mysqlService.query(sql, [this.pid, aid]);
    }

    const abstract = `
      insert into abstract(pid, content)
      values(?, ?);
    `;

    await Article.mysqlService.query(abstract, [this.pid, this.abstract]);
    for(const keyword of this.keywords) {
      const k = new Keyword(keyword);
      const kid = await k.sync();
      const sql = `
        insert into paper_keyword(pid, kid)
        values(?, ?);
      `;

      await Article.mysqlService.query(sql, [this.pid, kid]);
    }
    return this.pid;
  }
}