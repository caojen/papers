# 爬虫工具v1.0

## 使用方法
本工具主要依赖为：
1. 运行环境：``node v14.17.0``，但只要版本不太低就可以；
2. 一个Mysql数据库，最好数据库和爬虫工具放在同一个内网，因为读写I/O很大；
3. 良好的网络。

## 配置步骤
1. 安装node
2. 运行``npm install``，运行后将会自动其他依赖
3. 配置MYSQL，请执行以下步骤
   1. 记录MYSQL的相关信息，即ip，端口，用户名，密码
   2. 对应上面四项，分别配置环境变量：`$MYSQL_HOST`, `$MYSQL_PORT`, `$MYSQL_USER`, `$MYSQL_PASS`
   3. 配置环境变量`$MYSQL_DATABASE=papers`
   4. 初始化数据库，使用命令：`mysql -u $MYSQL_USER -h $MYSQL_HOST -P $MYSQL_PORT -p < sql/init.sql`
   5. 如果无法执行，请自行`nc $MYSQL_HOST $MYSQL_PORT`诊断错误
4. 配置爬虫信息：
   1. 打开``config.yaml``
   2. ``search.keywords``可以配置需要搜索的字段，可以指定多个字段
   3. ``search.begindate, search.enddate``指定从哪到哪，闭区间。
   4. ``search.proceed``指定当搜集完上面的日期区间后，是否继续搜集，直到今天为止。（TODO：该选项未影响程序）

## 运行
当完成上述配置后，可以使用以下命令运行：
```bash
npm run start:dev
# OR
npm run start:prod
```

## 数据库信息说明
数据库初始化文件在``sql/init.sql``中。默认数据库名为``papers``
### Table paper
该表存储了所有论文的基本信息，包括论文的`origin_id`(也就是远程库中这篇论文的id), ``type``(类型), `publication`(出版刊物), `time`(时间), `title`(标题)

### Table author
该表存储了所有的作者。
作者和论文是多对多的关系，因此有另外一个表``paper_author``保存论文的所有作者。

### Table abstract
该表存储了所有的摘要。
虽然摘要和论文是一对一的关系，但是摘要一般比较长，因此将其拆表。

### Table keyword
该表存储了所有的关键字
关键字和论文是多对多的关系，因此还存在另外一个表``paper_keyword``来保存论文的所有关键字

### Table settings
该表是用于记录每个搜索字段每天爬虫运行到哪一页了。
用于断点续传。

# Bugs

1. 在多线程下，日志输出是乱序的
2. 在未知情况下，某个莫名出现的网络错误会导致该线程终止。暂时还没有找到是哪里有问题。

## TODOs
1. 将``search.proceed=true``实现
