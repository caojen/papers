# 爬虫工具v2.0

## 使用方法
本工具主要依赖为：
1. 运行环境：``node v14.17.0``，但只要版本不太低就可以；
2. 一个Mysql数据库，最好数据库和爬虫工具放在同一个内网，因为读写I/O很大；
3. 良好的网络(耗费时间最多的原因)。

## 配置步骤
0. ``git clone``本仓库代码
1. 安装node
2. 运行``npm install``
3. 配置MYSQL，请执行以下步骤
   1. 记录MYSQL的相关信息，即ip，端口，用户名，密码
   2. 对应上面四项，分别配置环境变量：`MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASS`
      1. 配置环境变量的方法：
      2. Linux: ``x=y``
      3. Powershell: ``$env:x=y``
   3. 配置环境变量`MYSQL_DATABASE=papers`
   4. 初始化数据库，使用命令：`mysql -u $MYSQL_USER -h $MYSQL_HOST -P $MYSQL_PORT -p < sql/init.sql`. **v2.0的数据库做出了修改，因此需要重新执行这一步。**
   5. 如果无法执行，请自行`nc $MYSQL_HOST $MYSQL_PORT`诊断错误
4. 配置爬虫信息：
   目前，需要爬取的关键字已经存放在数据库中，并且执行了上面的第三步后，就已经初始化了所有需要爬取的关键字。下文有说明如何添加新的关键字。

## 运行
当完成上述配置后，可以使用以下命令运行：
```bash
# 开发模式：
npm run start:dev
# 或者，使用生产模式：
npm run build
npm run start:prod
```

## 爬取与翻译策略
目前，爬取已经成为了定时任务。在每次任务中，对时间范围为“昨天”进行搜索。定时任务将会每两小时触发一次，原因为PubMed的论文是陆续上传的（也就是说，不同时间搜索论文，论文的数量会改变）。可以修改``src/main.ts: line 14``的``cron``表达式来修改触发时间的策略。

另外，每当程序启动时，总是会触发一次爬取任务。

翻译是调用百度翻译api的，翻译的范围为标题和摘要。由于第三方限制，百度翻译api的调用QPS=1，如果超过这个速率，百度翻译api将会直接报错。因此，目前程序中触发“翻译”操作的事件有：
1. 爬取一篇论文完成时。此时，将会尝试调用一次翻译，如果调用失败，那么等待``2``秒(定义在``src/translator.ts: line 69``中)后，再次尝试调用一次。如果仍失败，那么视为翻译失败。
2. 前端尝试获取一篇论文的内容。策略同上。如果翻译失败，那么获取的内容为原文（英文）。

每当论文的标题或摘要被翻译后，翻译的内容将会保存在数据库中，以后如果再次需要获取翻译内容的话，就不再需要重新调用百度翻译api了。（百度翻译api有限额）。

注意，由于QPS=1很低，如果某次前端尝试请求的所有论文都没有被第一步成功翻译的话，那么可能需要等待比较长的时间才可以返回结果。

## 新建关键词
要新建一个关键词，请向后端发送以下请求：
```
POST /search

Content-Type: application/json

body:
{
   "v": "新的关键词"
}
```
关键词被新建后，会在**下一次爬取任务时**被爬取。

## 数据库表说明
+ Table ``search``
  + 用于保存关键字
  + 初始关键字已经定义在``sql/init.sql``中
  + Columns:
    + id: 关键字序号
    + v：关键字内容
+ Table ``paper``
  + 用于保存论文基本信息（不包括摘要）
  + Columns:
    + id: 论文序号
    + origin_id: 论文在PubMed中的原始id
    + type: 论文类型
    + publication: 发表刊物
    + time: 论文发表的时间
    + create_time: 行建立时间
    + search_time: 搜索时指定的时间范围为哪一天
    + sid: References Table ``search``
      + search.id
      + 表明搜索的关键字

+ Table ``author``
  + 用于保存作者信息
  + Columns:
    + id: 作者序号
    + name: 作者名

+ Table ``paper_author``
  + Table ``paper`` 和 Table ``author`` 的多对多关系表
  + Columns:
    + pid: References Table ``paper``
      + paper.id
      + 表明所属论文
    + aid: References Table ``author``
      + author.id
      + 表明所属作者

+ Table ``abstract``
  + 用于保存论文的摘要, 与Table ``paper``是一对一关系
  + Columns:
    + id: 摘要序号
    + pid: Reference Table ``paper``
      + paper.id
      + 表明论文的序号
    + content: 摘要内容

+ Table ``keyword``
  + 用于保存所有论文Keyword
  + Columns:
    + id: keyword序号
    + content: keyword内容
+ Table ``paper_keyword``
  + Table ``paper`` 和 Table ``keyword`` 的多对多关系表
  + Columns:
    + pid: Reference Table ``paper``
      + paper.id
      + 表明所属论文
    + kid: Reference Table ``keyword``
      + keyword.id
      + 表明所属关键字
+ Table ``settings``
  + 一个在**v2.0**中没有使用的表

+ Table ``translation``
  + 保存所有翻译结果
  + Columns:
    + md5sum: 原文的md5摘要结果
    + content: 翻译结果

+ 后端接口文档：
```
https://documenter.getpostman.com/view/10524259/TzeWGnnc
```
