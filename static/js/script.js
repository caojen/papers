const prefix = 'http://127.0.0.1:3000/api';

function buildContentSearches(data) {
  console.log(data)
  $('#content').empty();
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
    html += `<td><button onclick="console.log(${value.sid})">详情</button></td>`
    html += '</tr>'
  });
  html += `</table>`;
  console.log(html);
  $('#content').append(html);
}

function loadSearches() {
  $.get(`${prefix}/search`, (data, status) => {
    buildContentSearches(data);
  });
}
