DROP DATABASE IF EXISTS `papers`;

CREATE DATABASE IF NOT EXISTS `papers`;

USE `papers`;

CREATE TABLE IF NOT EXISTS `search` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `v` VARCHAR(1024) NOT NULL,
  PRIMARY KEY(`id`),
  UNIQUE INDEX search_unique_value(`v`)
)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

-- 创建论文表，保存论文基本信息
CREATE TABLE IF NOT EXISTS `paper` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `origin_id` INT(11) NOT NULL COMMENT '在网站上的id',
  `type` VARCHAR(32) NOT NULL COMMENT '类型',
  `publication` VARCHAR(256) NOT NULL COMMENT '发表刊物',
  `time` VARCHAR(128) NOT NULL COMMENT '发表时间',
  `title` VARCHAR(2048) NOT NULL COMMENT '论文标题',
  `create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `search_time` TIMESTAMP NOT NULL COMMENT '搜索时指定的时间',
  `sid` INT(11) NOT NULL COMMENT '对应的search表的id',
  PRIMARY KEY (`id`),
  UNIQUE INDEX paper_origin_id_unique_index(`origin_id`),
  FOREIGN KEY(`sid`) REFERENCES `search`(`id`)
)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

-- 创建作者表
CREATE TABLE IF NOT EXISTS `author` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(64) NOT NULL COMMENT '作者名',
  PRIMARY KEY(`id`)
)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

-- 创建 论文-作者 多对多关系
CREATE TABLE IF NOT EXISTS `paper_author` (
  `pid` INT(11) NOT NULL,
  `aid` INT(11) NOT NULL,
  index paper_author_index(`pid`, `aid`)
)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

-- 分表：保存论文摘要(一一对应)，不直接保存到paper表中
CREATE TABLE IF NOT EXISTS `abstract` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `pid` INT(11) NOT NULL COMMENT '外键：来自paper表',
  `content` TEXT,
  PRIMARY KEY(`id`),
  FOREIGN KEY(`pid`) REFERENCES `paper`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

-- 创建关键词表
CREATE TABLE IF NOT EXISTS `keyword` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `content` VARCHAR(1024) NOT NULL,
  PRIMARY KEY(`id`)
)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

-- 创建 论文-关键词 多对多关系
CREATE TABLE IF NOT EXISTS `paper_keyword` (
  `pid` INT(11) NOT NULL,
  `kid` INT(11) NOT NULL,
  index paper_keyword_index(`pid`, `kid`)
)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

-- 创建 设置表, 用于缓存全局状态
CREATE TABLE IF NOT EXISTS `settings` (
  `k` VARCHAR(32) NOT NULL,
  `v` VARCHAR(1024) NOT NULL,
  PRIMARY KEY(`k`)
)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

-- 创建 翻译内容表
-- 调用baidu api, 每次调用后的结果都存放在这里，避免重复调用
CREATE TABLE IF NOT EXISTS `translation` (
  `md5sum` CHAR(32) NOT NULL,
  `content` TEXT NOT NULL
)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;
