import { mysqlService } from '../mysql.instance';
import { Author } from './author.entity';
import { Keyword } from './keyword.entity';
import { Search } from './search.entity';
import log from '../logger.functions';
import * as htmldecode from 'decode-html';
import { Translator } from '../translator';

/**
 * Table `Article`
 */
export class Article {
  id: number;
  origin_id: number;
  type: string;
  publication: string;
  time: string;
  title: string;
  search_time: Date;

  search: Search;
  authors: Author[];
  abstract: string;
  keywords: Keyword[];

  context: string;

  constructor(
    origin_id: number,
    context: string,
    search_time: Date,
    search: Search,
  ) {
    this.origin_id = origin_id;
    this.context = context;
    this.search_time = search_time;
    this.search = search;

    // init
    this.authors = [];
    this.keywords = [];
  }

  /**
   * To test if origin_id already exists.
   * If exists, return true.
   * @param id origin_id
   */
  static async exists_origin_id(id: number): Promise<boolean> {
    const sql = `
      SELECT 1
      FROM paper
      WHERE origin_id = ?;
    `;
    const res = await mysqlService.query(sql, [id]);
    return res.length !== 0;
  }

  /**
   * Resolve this.context into this.
   * Return true, if resolving done. This means this.sync should be called later to store this into database.
   * Return false, meaning that resolve failed, or origin_id exists.
   */
  async resolve(): Promise<boolean> {
    if (this.context === '') {
      return false;
    }
    try {
      this.type = get_type(this.context);
      this.publication = get_publication(this.context);
      this.time = get_time(this.context);
      const authors = get_authors(this.context);
      for (const author of authors) {
        this.authors.push(await Author.fetch_by_name(author));
      }
      this.title = get_title(this.context);
      this.abstract = get_abstract(this.context);
      const keywords = get_keywords(this.context);
      for (const keyword of keywords) {
        this.keywords.push(await Keyword.fetch_by_content(keyword));
      }
      // fetch translation
      (new Translator(this.title)).fetch();
      (new Translator(this.abstract)).fetch();
    } catch (err) {
      log.error([err]);
      log.error(["error occurred. ignore this. return false"]);
      return false;
    }
    return true;
  }

  /**
   * Sync this into database.
   * Always return true, except the origin_id exists.
   */
  async sync(): Promise<boolean> {
    /**
     * Paper
     */
    if(await Article.exists_origin_id(this.origin_id)) {
      return false;
    }
    const paper_sql = `
      INSERT INTO paper(origin_id, type, publication, time, title, search_time, sid)
      VALUES(?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE id=id;
    `;
    const paper_res = await mysqlService.query(paper_sql, [
      this.origin_id,
      this.type,
      this.publication,
      this.time,
      this.title,
      this.search_time,
      this.search.id,
    ]);
    this.id = paper_res.insertId;
    if(this.id <= 0) {
      // ignore this. return false;
      return false;
    }
    /**
     * Abstract
     */
    const abstract_sql = `
      INSERT INTO abstract(pid, content)
      VALUES(?, ?);
    `;
    await mysqlService.query(abstract_sql, [this.id, this.abstract]);
    /**
     * paper_author
     */
    const author_sql = `
      INSERT INTO paper_author(pid, aid)
      VALUES(?, ?)
      ON DUPLICATE KEY UPDATE pid=pid;
    `;
    for (const author of this.authors) {
      await mysqlService.query(author_sql, [this.id, author.id]);
    }
    /**
     * paper_keyword
     */
    const keyword_sql = `
      INSERT INTO paper_keyword(pid, kid)
      VALUES(?, ?)
      ON DUPLICATE KEY UPDATE pid=pid;
    `;
    for (const keyword of this.keywords) {
      await mysqlService.query(keyword_sql, [this.id, keyword.id]);
    }
    return true;
  }
}

/**
 * Helper functions that resolving the context
 */

function get_type(c: string): string {
  //<div class="publication-type" >Review</div>
  const target = '<div class="publication-type"';
  const end = '/div>';
  const firstIndex = c.indexOf(target);
  if (firstIndex !== -1) {
    const endIndex = c.indexOf(end, firstIndex);
    const begin = firstIndex + target.length;
    const length = endIndex - begin;
    let ret = c.substr(begin, length).trim();
    ret = ret.substr(1, ret.length - 2);
    if (ret.length > 32) {
      ret = '';
    }
    return ret;
  } else {
    return '';
  }
}

function get_publication(c: string): string {
  // <meta name="citation_publisher" content="Urologia">
  const target = '<meta name="citation_publisher" content="';
  const end = '">';
  const firstIndex = c.indexOf(target);
  if (firstIndex !== -1) {
    const endIndex = c.indexOf(end, firstIndex);
    const begin = firstIndex + target.length;
    const length = endIndex - begin;
    const ret = c.substr(begin, length).trim();
    return ret;
  } else {
    return '';
  }
}

function get_time(c: string): string {
  let ret = '';
  const target = '<span class="secondary-date">';
  const end = '</span>';
  const firstIndex = c.indexOf(target);
  if (firstIndex !== -1) {
    const endIndex = c.indexOf(end, firstIndex);
    const begin = firstIndex + target.length;
    const length = endIndex - begin;
    ret = c.substr(begin, length).trim();
    if (ret.length > 128) {
      ret = '';
    }
  }

  if (ret === '') {
    // <span class="cit">2021 May 3;88(5):260.</span>
    const target = '<span class="cit">';
    const end = '</span>';
    const firstIndex = c.indexOf(target);
    if (firstIndex !== -1) {
      const endIndex = c.indexOf(end, firstIndex);
      const begin = firstIndex + target.length;
      const length = endIndex - begin;
      ret = c.substr(begin, length).trim();
      if (ret.length > 128) {
        ret = '';
      }
    }
  }

  if (ret === '') {
    // datetime="2021-05-19"
    const target = 'datetime="';
    const firstIndex = c.indexOf(target);
    if (firstIndex !== -1) {
      const begin = firstIndex + target.length;
      ret = c.substr(begin, 10).trim();
    }
  }

  return ret;
}

function get_title(c: string): string {
  const target = '<meta name="citation_title" content="';
  const end = '">';
  const firstIndex = c.indexOf(target);
  const endIndex = c.indexOf(end, firstIndex);
  const begin = firstIndex + target.length;
  const length = endIndex - begin;
  const ret = c.substr(begin, length).trim();
  return ret;
}

function get_authors(c: string): string[] {
  const target = '<meta name="citation_authors" content="';
  const end = '">';
  const firstIndex = c.indexOf(target);
  const endIndex = c.indexOf(end, firstIndex);
  const begin = firstIndex + target.length;
  const length = endIndex - begin;
  const ret = c.substr(begin, length).trim();
  const split = ret.split(';');
  const r = [];
  for (const s of split) {
    if (s.trim().length > 0) {
      r.push(s.trim());
    }
  }
  return r;
}

function get_abstract(c: string): string {
  const e = new RegExp(
    '<div\\s+class="abstract\\-content\\s+selected"\\s+id="enc\\-abstract">',
    'g',
  );
  const n = e.exec(c);
  if (!n) {
    return '';
  }
  const index = n.index;
  const match = n[0];
  const endIndex = c.indexOf('</div>', index);
  const begin = index + match.length;
  const length = endIndex - begin;
  let ret = c.substr(begin, length).trim();

  // remove all <...> html elements
  ret = ret.replace(/<.*?>/g, '').trim();
  // remove all &..; html elements
  // ret = unescape(ret).trim();
  ret = htmldecode(ret);
  return ret;
}

function get_keywords(c: string): string[] {
  const e = new RegExp(
    '<strong\\s+class="sub\\-title">\\s+Keywords:\\s+</strong>',
  );
  const n = e.exec(c);
  if (!n) {
    return [];
  }
  const index = n.index;
  const match = n[0];
  const endIndex = c.indexOf('</p>', index);
  const begin = index + match.length;
  const length = endIndex - begin;
  const ret = c.substr(begin, length).trim();
  const split = ret.split(';');
  const r: string[] = [];
  for (const s of split) {
    if (s.trim().length > 0) {
      r.push(s.trim());
    }
  }
  if (r.length > 0) {
    const str = r[r.length - 1];
    if (str.charAt(str.length - 1) == '.') {
      const s = str.substr(0, str.length - 1);
      r[r.length - 1] = s;
    }
  }
  return r;
}
