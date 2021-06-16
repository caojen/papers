# 爬虫工具v1.0

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
   1. 打开``config.yaml``
   2. ``search.keywords``可以配置需要搜索的字段，可以指定多个字段
   3. ``search.begindate, search.enddate``指定从哪到哪，闭区间。
   4. ``search.proceed``指定当搜集完上面的日期区间后，是否继续搜集，直到今天为止。~~（TODO：该选项未影响程序）~~

## 运行
当完成上述配置后，可以使用以下命令运行：
```bash
npm run start:dev
# OR
npm run build
npm run start:prod
```
