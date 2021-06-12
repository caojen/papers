import { mysqlService } from '../mysql.instance';

export class Keyword {
  id: number;
  content: string;

  constructor(id = -1, content = '') {
    this.id = id;
    this.content = content;
  }

  static async fetch_by_content(content: string): Promise<Keyword> {
    const k = new Keyword(-1, content);
    await k.sync_by_content();
    return k;
  }

  /**
   * Sync by this.id.
   * Based on this.id, fetch this.content, then return true.
   * If this.id == -1, or such row doesnot exist, return false;
   */
  async sync_by_id(): Promise<boolean> {
    if (this.id === -1) {
      return false;
    }
    const sql = `
            SELECT content
            FROM keyword
            WHERE id = ?;
        `;
    const res = await mysqlService.query(sql, [this.id]);
    if (res.length === 0) {
      return false;
    } else {
      this.content = res[0].content;
      return true;
    }
  }

  async sync_by_content(): Promise<boolean> {
    if (this.content === '') {
      return false;
    }

    const select_sql = `
            SELECT id
            FROM keyword
            WHERE content = ?;
        `;
    const sres = await mysqlService.query(select_sql, [this.content]);
    if (sres.length === 0) {
      const insert_sql = `
                INSERT INTO keyword(content)
                VALUES(?);
            `;
      const ires = await mysqlService.query(insert_sql, [this.content]);
      this.id = ires.insertId;
    } else {
      this.id = sres[0].id;
    }
    return true;
  }
}
