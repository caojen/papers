import { mysqlService } from './mysql.instance';

export class Keyword {
  id = -1;
  content: string = null;

  constructor(content: string) {
    this.content = content;
  }

  async sync(): Promise<number> {
    const sql = `
      select id from keyword
      where content=?;
    `;

    const res = await mysqlService.query(sql, [this.content]);
    if (res.length === 0) {
      const s = `
        insert into keyword(content)
        values(?);
      `;
      const res = await mysqlService.query(s, [this.content]);
      this.id = res.insertId;
    } else {
      this.id = res[0].id;
    }

    return this.id;
  }
}
