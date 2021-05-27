import { mysqlService } from './mysql.instance';

export class Author {
  id: number;
  name: string;

  constructor(name: string) {
    this.id = -1;
    this.name = name;
  }

  async sync(): Promise<number> {
    if (this.name !== '') {
      // fetch from mysql:
      const sql = `
        select id from author
        where name=?;
      `;
      const res = await mysqlService.query(sql, [this.name]);
      if (res.length === 0) {
        const s = `
          insert into author(name)
          values(?)
        `;
        const res = await mysqlService.query(s, [this.name]);
        const insertId = res.insertId;
        this.id = insertId;
      } else {
        this.id = res[0].id;
      }
    }

    return this.id;
  }
}
