const prefix = 'http://127.0.0.1:3000/api';

function loadSearches() {
  $.get(`${prefix}/search`, (data, status) => {
    buildContentSearches(data);
  });
}

function removeContent() {
  $('#content').empty();
}

function removePagination() {
  $('#pagination').empty();
}

function showPagination(sid, pageSize, offset, total) {
  removePagination();
  let curPage = Math.floor(offset / pageSize) + 1;
  const totalPage = Math.floor(total / pageSize) + 1;
  if(curPage > totalPage) {
    curPage = totalPage;
  }

  let html = '';
  html += `<div><p>第${curPage}页/共${totalPage}页</p></div>`
  html += `<div><button disabled=${curPage === 1} onclick=buildContentDetail(${sid}, ${pageSize}, ${offset-pageSize})>上一页</button></div>`
  html += `<div><button disabled=${curPage === totalPage} onclick=buildContentDetail(${sid}, ${pageSize}, ${offset+pageSize})>下一页</button></div>`
  console.log(html);
  $('#pagination').append(html);
}

function htmlize(mystring) {
  return mystring.replace(/&/g, "&amp;")
    .replace(/>/g, "&gt;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, '<br>')
}

function buildContentSearches(data) {
  console.log(data)
  removeContent();
  let html = '<table>';
  html += '<tr><th>项目</th><th>搜索关键字</th><th>最新时间</th><th>操作</th></tr>';
  $.each(data, (index, value) => {
    html += '<tr>';
    html += `<td>${value.des}</td>`;
    html += `<td>${value.v}</td>`;
    if(value.date) {
      const date = new Date(value.date);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      html += `<td>${month}.${day}</td>`;
    } else {
      html += `<td>无记录</td>`
    }
    html += `<td><button onclick="buildContentDetail(${value.sid}, 10, 0)">详情</button></td>`
    html += '</tr>'
  });
  html += `</table>`;

  $('#content').append(html);
}

function buildContentDetail(sid, pageSize, offset) {
  console.log(sid, pageSize, offset);
  removeContent();
  $('#content').text('获取数据中，请稍等。后端可能需要进行翻译，因此花费时间可能比较久，请耐心等候......');
  $.get(`${prefix}/content?sid=${sid}&pageSize=${pageSize}&offset=${offset}`, (data, status) => {
    let html = '<table>';
    const des = data.des;
    const v = data.v;
    const date = new Date(data.date);
    if(data.total > 0) {
      showPagination(sid, pageSize, offset, data.total);
    }
    if(date) {
      const month = date.getMonth() + 1;
      const day = date.getDate();
      html += `<tr><th><span class="strongtext">${des}方向: ${month}.${day} 共计 ${data.total} 篇</span></th></tr>`
      $.each(data.papers, (index, value) => {
        console.log(value);
        html += '<tr"><td class="content_td">';
        html += '<div>';

        html += `<p class="content_origin_title">【${value.index}】 ${value.origin_title}</p>`;
        html += `<p class="content_title"><strong>标题</strong>：${value.title}</p>`;
        let authors = '';
        for(let i = 0; i < value.authors.length; i++) {
          if(i != 0) {
            authors += ', ';
          }
          authors += value.authors[i];
        }
        html += `<p class="content_author"><strong>作者</strong>：${authors}</p>`;
        html += `<p class="content_publication"><strong>刊物</strong>：<span style="font-style:italic">${value.publication}<span></p>`;
        html += `<p><strong>链接</strong>：<a href=${value.url} target="_blank">${value.url}</a></p>`

        let keywords = '';
        for(let i = 0; i < value.keywords.length; i++) {
          if(i != 0) {
            keywords += '; ';
          }
          keywords += value.keywords[i];
        }

        html += `<p><strong>关键字</strong>：${keywords}</p>`;

        value.abstract = htmlize(value.abstract);
        html += `<p class="content_abstract"><strong>摘要</strong>：<br>${value.abstract}</p>`;

        html += '</div>';
        html += "</td></tr>";
      })
    }
    html += '</table>';
    removeContent();
    $('#content').append(html);
  });
}
