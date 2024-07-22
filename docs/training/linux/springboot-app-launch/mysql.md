---
title: Mysql 数据库编译安装
description: MySQL是一款流行的开源关系型数据库管理系统（RDBMS），适用于从小型网站到大型企业级应用的各种场景。它以GNU通用公共许可证发行，实现成本效益。MySQL具备高性能、高可靠性和强大的可伸缩性，支持多线程、跨平台操作，及多种存储引擎，适应不同数据处理需求。其优势在于开源免费、社区活跃、易于学习与使用，且能有效处理大量并发连接，提供丰富的SQL功能及安全性保障，成为Web开发和数据存储领域的首选方案。
categories:
  - Linux 企业级运维
outline: [ 2,3 ]
date: 2024-05-05
tags:
  - Mysql
  - 编译安装
  - 运维
head:
  - - meta
    - name: keywords
      content: Linux企业级运维, 编译安装, MYSQL, Linux, Nginx, Minio, SpringBoot, Redis
cover: https://cdn.imufeng.cn/mblog/de6d10ef17dcb6f1d9902dc612375980.png
---

# 第二步 Mysql 数据库编译安装

## 一、简介

MySQL是最流行的关系型数据库管理系统之一，由瑞典 MySQL AB 公司开发，目前属于 Oracle 公司。因其性能高、可靠性强和易用性高而在各种应用中得到广泛应用。

MYSQL 的编译安装使用 CMAKE 来完成，它是一款跨平台的开源的构建系统，用于管理软件的编译过程。它可以通过简单的配置文件（CMakeLists.txt）来描述项目的构建过程，生成适合本地平台的原生构建文件。它比传统的编译安装更加灵活和方便。

之前有写过 MYSQL for Windows 直装教程：[Mysql for Windows 安装及初始化 ](https://www.imufeng.cn/training/software/mysql-for-win-install.html)，但是企业级服务器部署中，为了提高性能并满足自定义配置，基本是要求编译安装。

## 二、环境准备

MYSQL 编译安装对系统要求较高，推荐 4C8G 60G 配置。本次演示使用 AlmaLinux9 + mysql 8.0.37，系统配置为 16C 32G。可能好还需要提前配置阿里云 YUM 源等。

## 三、安装

### 2.1 下载

安装包下载页面：[MySQL :: Download MySQL Community Server](https://dev.mysql.com/downloads/mysql/) ，本文章以 MYSQL-8.0.37 举例，下载文件带boost的源码包：`mysql-boost-8.0.37.tar.gz` ，推荐解压到 `/usr/src` ，解压后目录结构如下：

```text
boost            Doxyfile-ignored     libchangestreams  packaging          sql-common
client           Doxyfile.in          libmysql          plugin             storage
cmake            doxygen_resources    libservices       README             strings
CMakeLists.txt   extra                LICENSE           router             support-files
components       include              man               run_doxygen.cmake  testclients
config.h.cmake   INSTALL              mysql-test        scripts            unittest
configure.cmake  libbinlogevents      MYSQL_VERSION     share              utilities
Docs             libbinlogstandalone  mysys             sql                vio
```

### 2.2 编译检查

Mysql 编译安装使用 CMAKE 构建工具，CMAKE 是依赖于c语言的，所以我们首先必须安装 CMAKE 及其依赖：

```bash
 yum -y install cmake gcc g++ gcc-toolset-12 
 
```

CMAKE 安装之后，即可开始编译安装，编译安装选项不是固定的，你完全可以按照阅读官方文档[MySQL 8 Build Options](https://dev.mysql.com/doc/mysqld-version-reference/en/build-options.html) 并自行增删，这就是编译安装最大的魅力所在。以下是我的编译安装选项

```bash
cmake3 -DCMAKE_INSTALL_PREFIX=/usr/local/mysql/ \
-DMYSQL_DATADIR=/usr/local/mysql/data \
-DDEFAULT_CHARSET=utf8mb4 \
-DDEFAULT_COLLATION=utf8mb4_general_ci \
-DWITH_EXTRA_CHARSETS=all \
-DWITH_MYISAM_STORAGE_ENGINE=1 \
-DWITH_INNOBASE_STORAGE_ENGINE=1 \
-DWITH_MEMORY_STORAGE_ENGINE=1 \
-DWITH_READLINE=1 \
-DWITH_INNODB_MEMCACHED=1 \
-DWITH_DEBUG=OFF \
-DWITH_ZLIB=bundled \
-DENABLED_LOCAL_INFILE=1 \
-DENABLED_PROFILING=ON \
-DMYSQL_MAINTAINER_MODE=OFF \
-DMYSQL_TCP_PORT=3306 \
-DDOWNLOAD_BOOST=1 \
-DWITH_BOOST=/usr/src/mysql-8.0.37/boost  \
-DFORCE_INSOURCE_BUILD=1
```

其他教程可能会给出一堆的 yum 安装，但是其中可能会有一些不需要的依赖，所以一般都是在执行 CMAKE 编译检查命令时，遇到报错缺少依赖再去安装，如下图：

![image-20240612162753836](https://cdn.imufeng.cn/mblog/ad341fa229ccf953b20b7b77c41131dd.png)

根据图片我们可以发现，系统缺少 `libtirpc-devel`  软件包，此时即可按照提示安装该软件包后重新执行 CMAKE 命令。经过我的测试，以下依赖需要安装：

```bash
 yum -y install openssl-devel ncurse-devel libtirpc-devel rpcgen 
```

只要看到如下内容，即可证明通过了编译安装检查，接下来你就可以开始安装了。

```
-- Configuring done (2.3s)
-- Generating done (2.7s)
-- Build files have been written to: /usr/src/mysql-8.0.37
```

### 2.3 开始安装

编译安装是个很久很漫长的过程，一定要注意留足60G左右的存储空间，否则可能会编译一个小时提示空间不足。如果你的配置足够高，可以为 make 添加 -j 选项来开启多线程，这里选择使用16线程来编译。

执行命令：`make -j16 && make install`

然后就是漫长的等待了。

## 四、启动

### 4.1 配置文件

配置文件：`/etc/my.cnf`

```ini
[mysqld]

user = mysql
basedir = /usr/local/mysql
datadir=/data/mysql_dev # 不指定就在 $basedir/data 下
lower_case_table_names=1 # 忽略大小写
```

这么多就够了。

### 4.2 用户和用户组

```bash
groupadd mysql
# 不创建HOME目录，并不允许登录
useradd -M -g mysql -s /sbin/nologin -d /usr/local/mysql mysql

chown -R mysql.mysql /usr/local/mysql
```

### 4.3 环境变量

推荐为 MYSQL 添加一个系统环境变量，编辑`/etc/profile`，并写入如下内容：

```bash
export PATH=$PATH:/usr/local/mysql/bin/
```

### 4.4 初始化

```
cd /usr/local/mysql/

./bin/mysqld --user=mysql --initialize -defaults-file=/etc/my.cnf
```

执行命令后，会获得一个临时密码，此密码强制要求登录后修改。

### 4.5 启动

启动命令：`mysqld &`

## 五、连接测试

Mysql 服务启动后，即可进行连接：`./mysql -uroot -ppassWord`

以下命令修改密码：

```mysql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'PASSWORD';
```

## 参考资料

- [MySQL 教程 | 菜鸟教程 (runoob.com)](https://www.runoob.com/mysql/mysql-tutorial.html)
- [MySQL 8 Build Options](https://dev.mysql.com/doc/mysqld-version-reference/en/build-options.html) 
