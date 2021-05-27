import { MysqlService } from "src/mysql/mysql.service";

export class Keyword {
  static mysqlService: MysqlService = null;

  id: number = -1;
  content: string = null;

  constructor(content: string) {
    this.content = content;
    if(Keyword.mysqlService === null) {
      Keyword.mysqlService = new MysqlService();
    }
  }

  async sync(): Promise<number> {
    const sql = `
      select id from keyword
      where content=?;
    `;

    const res = await Keyword.mysqlService.query(sql, [this.content]);
    if(res.length === 0) {
      const s = `
        insert into keyword(content)
        values(?);
      `;
      const res = await Keyword.mysqlService.query(sql, [this.content]);
      this.id = res.insertId;
    } else {
      this.id = res[0].id;
    }

    return this.id;
  }
}