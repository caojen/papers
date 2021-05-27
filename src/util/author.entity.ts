import { MysqlService } from "src/mysql/mysql.service";

export class Author {
  id: number;
  name: string;

  static mysqlService: MysqlService = null;

  constructor(name: string) {
    this.id = -1;
    this.name = name;
    if(Author.mysqlService === null) {
      Author.mysqlService = new MysqlService();
    }
  }

  async sync(): Promise<number> {
    if(this.name !== '') {
      // fetch from mysql:
      const sql = `
        select id from author
        where name=?;
      `;
      const res = await Author.mysqlService.query(sql, [this.name]);
      if(res.length === 0) {
        const s = `
          insert into author(name)
          values(?)
        `;
        const res = await Author.mysqlService.query(sql, [this.name]);
        const insertId = res.insertId;
        this.id = insertId;
      } else {
        this.id = res[0].id;
      }
    }

    return this.id;
  }
}