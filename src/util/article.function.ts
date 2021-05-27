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
  return ''
}

export function get_time(c: string): string {
  return ''
}

export function get_title(c: string): string {
  return ''
}

export function get_authors(c: string): string[] {
  return []
}

export function get_abstract(c: string): string {
  return ''
}

export function get_keywords(c: string): string[] {
  return []
}
