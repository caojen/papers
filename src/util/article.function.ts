// 解析一个文章页面的函数

export function get_type(c: string): string {
  const e = new RegExp("<div\\s+class=\"publication-type\"\\s+>\\S+</div>", 'g');
  const str = e.exec(c)[0];
  if(!str) {
    return ''
  }
  const n = />\S+</g.exec(str)[0];
  if(!n) {
    return ''
  }
  const ret = n.substr(1, n.length - 2);
  return ret;
}

export function get_publication(c: string): string {
  // <meta name="citation_publisher" content="Urologia">

  const e = new RegExp("<meta\\s+name=\"citation_publisher\"\\s+content=\"\\S+\">", 'g');
  const str = e.exec(c)[0];
  if(!str) {
    return '';
  }
  const n = new RegExp("content=\"\\S+\"", 'g');
  const nn = n.exec(str)[0];
  if(!nn) {
    return ''
  }
  const ret = nn.substr(9, nn.length - 10);
  return ret;
}

export function get_time(c: string): string {
  const target = '<span class="secondary-date">';
  const end = '</span>';
  const firstIndex = c.indexOf(target);
  const endIndex = c.indexOf(end, firstIndex);
  const begin = firstIndex + target.length;
  const length = endIndex - begin;
  const ret = c.substr(begin, length).trim();
  return ret;
}

export function get_title(c: string): string {
  const target = '<meta name="citation_title" content="';
  const end = '">';
  const firstIndex = c.indexOf(target);
  const endIndex = c.indexOf(end, firstIndex);
  const begin = firstIndex + target.length;
  const length = endIndex - begin;
  const ret = c.substr(begin, length).trim();
  return ret;
}

export function get_authors(c: string): string[] {
  const target = '<meta name="citation_authors" content="';
  const end = '">';
  const firstIndex = c.indexOf(target);
  const endIndex = c.indexOf(end, firstIndex);
  const begin = firstIndex + target.length;
  const length = endIndex - begin;
  const ret = c.substr(begin, length).trim();
  const split = ret.split(';');
  const r = [];
  for(const s of split) {
    if(s.trim().length > 0) {
      r.push(s.trim());
    }
  }
  return r;
}

export function get_abstract(c: string): string {
  const e = new RegExp("<div\\s+class=\"abstract\\-content\\s+selected\"\\s+id=\"enc\\-abstract\">", 'g');
  const n = e.exec(c);
  if(!n) {
    return '';
  }
  const index = n.index;
  const match = n[0];
  const endIndex = c.indexOf("</div>", index);
  const begin = index + match.length;
  const length = endIndex - begin;
  let ret = c.substr(begin, length).trim();
  ret = ret.replace(/<p>/g, '');
  ret = ret.replace(/<\/p>/g, '');
  ret = ret.trim();
  return ret;
}

export function get_keywords(c: string): string[] {
  const e = new RegExp("<strong\\s+class=\"sub\\-title\">\\s+Keywords:\\s+</strong>");;
  const n = e.exec(c);
  if(!n) {
    return [];
  }
  const index = n.index;
  const match = n[0];
  const endIndex = c.indexOf("</p>", index);
  const begin = index + match.length;
  const length = endIndex - begin;
  const ret = c.substr(begin, length).trim();
  const split = ret.split(';');
  const r:string[] = [];
  for(const s of split) {
    if(s.trim().length > 0) {
      r.push(s.trim());
    }
  }
  if(r.length > 0) {
    const str = r[r.length - 1];
    if(str.charAt(str.length - 1) == '.') {
      const s = str.substr(0, str.length - 1);
      r[r.length - 1] = s;
    }
  }
  return r;
}
