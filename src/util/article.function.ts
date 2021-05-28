// 解析一个文章页面的函数

export function get_type(c: string): string {
  //<div class="publication-type" >Review</div>
  const target = '<div class="publication-type"';
  const end = '/div>';
  const firstIndex = c.indexOf(target);
  if(firstIndex !== -1) {
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

export function get_publication(c: string): string {
  // <meta name="citation_publisher" content="Urologia">

  const target = '<meta name="citation_publisher" content="';
  const end = '">';
  const firstIndex = c.indexOf(target);
  if(firstIndex !== -1) {
    const endIndex = c.indexOf(end, firstIndex);
    const begin = firstIndex + target.length;
    const length = endIndex - begin;
    const ret = c.substr(begin, length).trim();
    return ret;
  } else {
    return '';
  }
}

export function get_time(c: string): string {
  let ret = '';
  const target = '<span class="secondary-date">';
  const end = '</span>';
  const firstIndex = c.indexOf(target);
  if(firstIndex !== -1) {
    const endIndex = c.indexOf(end, firstIndex);
    const begin = firstIndex + target.length;
    const length = endIndex - begin;
    ret = c.substr(begin, length).trim();
    if (ret.length > 32) {
      ret = '';
    }
  }

  if(ret === '') {
    // <span class="cit">2021 May 3;88(5):260.</span>
    const target = '<span class="cit">';
    const end = ';';
    const firstIndex = c.indexOf(target);
    if(firstIndex !== -1) {
      const endIndex = c.indexOf(end, firstIndex);
      const begin = firstIndex + target.length;
      const length = endIndex - begin;
      ret = c.substr(begin, length).trim();
      if (ret.length > 32) {
        ret = '';
      }
    }
  }

  if(ret === '') {
    // datetime="2021-05-19"
    const target = 'datetime="';
    const firstIndex = c.indexOf(target);
    if(firstIndex !== -1) {
      const begin = firstIndex + target.length;
      ret=c.substr(begin, 10).trim();
    }
  }

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
  for (const s of split) {
    if (s.trim().length > 0) {
      r.push(s.trim());
    }
  }
  return r;
}

export function get_abstract(c: string): string {
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
  ret = ret.replace(/<p>/g, '');
  ret = ret.replace(/<\/p>/g, '');
  ret = ret.trim();
  return ret;
}

export function get_keywords(c: string): string[] {
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
