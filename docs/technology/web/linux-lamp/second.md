---
tags: 
  - Linux
  - 架构
  - 运维
  - LAMP
hidden: true
category: Linux 运维
---

# 第二步 编译安装mariadb数据库环境


## 1、Mariadb数据库概述

Mariadb是开源的关系型数据库服务器软件

- 目前由SUN公司开发和维护

- 官方站点：https://mariadb.org/

Mariadb的特点

- 多线程、多用户

- 基于客户/服务器架构

- 简单易用

- 查询速度快

- 安全可靠

## 2、安装前准备工作

```
[root@localhost packages]# dnf remove -y mariadb mariadb-server		#卸载已安装的mariadb服务

[root@localhost packages]# yum install -y cmake gcc-c++  libstdc++-*  ncurses-devel libaio* bison ncurses-devel openssl-devel openssl gcc-c++ cmake 

[root@localhost packages]# mkdir -p /usr/local/mysql				#创建需要的文件夹
[root@localhost packages]# mkdir -p /var/run/mysqld
[root@localhost packages]# mkdir -p /var/lib/mysql

[root@localhost packages]# which nologin							#创建用户以及用户组
/usr/sbin/nologin
[root@localhost packages]#  groupadd mysql
[root@localhost packages]# useradd -g mysql -d /usr/local/mysql/ -s /usr/sbin/nologin mysql
useradd: warning: the home directory already exists.
Not copying any file from skel directory into it.

[root@localhost packages]# chmod 777 -R /var/lib/mysql/ /var/run/mysqld/ /usr/local/mysql/	#文件夹读写权限
[root@localhost packages]# chown mysql:mysql -R /var/lib/mysql/ /var/run/mysqld/ /usr/local/mysql/
```

## 3、解压mariadb安装包

```
[root@localhost packages]# tar -xvf /app/packages/mariadb-10.5.6.tar.xz -C /app/
```

## 4、编译选项参考

```
cmake . -DCMAKE_INSTALL_PREFIX=/usr/local/mysql -DMYSQL_DATADIR=/usr/local/mysql/data -DSYSCONFDIR=/etc  -DWITH_INNOBASE_STORAGE_ENGINE=1 -DWITH_ARCHIVE_STORAGE_ENGINE=1 -DWITH_BLACKHOLE_STORAGE_ENGINE=1 -DWITH_READLINE=1 -DWITH_SSL=system -DWITH_ZLIB=system -DWITH_LIBWRAP=0 -DMYSQL_UNIX_ADDR=/var/lib/mysql/mysql.sock -DDEFAULT_CHARSET=utf8 -DDEFAULT_COLLATION=utf8_general_ci -DWITHOUT_TOKUDB=1		#编译选项详见mariadb的说明文档
```

## 5、开始编译安装

```
[root@localhost mariadb-10.5.6]# cmake . -DCMAKE_INSTALL_PREFIX=/usr/local/mysql -DMYSQL_DATADIR=/usr/local/mysql/data -DSYSCONFDIR=/etc  -DWITH_INNOBASE_STORAGE_ENGINE=1 -DWITH_ARCHIVE_STORAGE_ENGINE=1 -DWITH_BLACKHOLE_STORAGE_ENGINE=1 -DWITH_READLINE=1 -DWITH_SSL=system -DWITH_ZLIB=system -DWITH_LIBWRAP=0 -DMYSQL_UNIX_ADDR=/var/lib/mysql/mysql.sock -DDEFAULT_CHARSET=utf8 -DDEFAULT_COLLATION=utf8_general_ci -DWITHOUT_TOKUDB=1
[root@localhost mariadb-10.5.6]# make && make install		#编译安装时间会有点长
```

## 6、安装后的配置

```
[root@localhost mariadb-10.5.6]# export PATH=$PATH:/usr/local/mysql/bin		#环境变量
[root@localhost mariadb-10.5.6]# /usr/local/mysql/scripts/mysql_install_db --basedir=/usr/local/mysql --datadir=/usr/local/mysql/data  --defaults-file=/etc/my.cnf --socket=/var/lib/mysql/mysql.sock		#初始化
#设置开机启动
[root@localhost mysql]# cp -rf support-files/mysql.server /etc/init.d/mysqld 
[root@localhost mysql]# chmod 777 /etc/init.d/mysqld 
[root@localhost mysql]# chkconfig --add mysqld
[root@localhost mysql]# chkconfig mysqld on  
[root@localhost mysql]# vim /etc/init.d/mysqld 
basedir=/usr/local/mysql
datadir=/usr/local/mysql/data

[root@localhost /]# cd /usr/local/mysql/
[root@localhost mysql]# chmod -R 777 data
[root@localhost mysql]# mysqld_safe --datadir='/usr/local/mysql/data'
201204 02:05:33 mysqld_safe Logging to '/var/log/mariadb/mariadb.log'.
201204 02:05:34 mysqld_safe Starting mariadbd daemon with databases from /usr/local/mysql/data
```

## 7、开启服务

```
[root@localhost mysql]# systemctl start mysql
```

## 8、登录以及退出

```
[root@localhost mysql]# mysql -u root
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 4
Server version: 10.5.6-MariaDB Source distribution

Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MariaDB [(none)]> quit
Bye
```

> mysql -u root [-p] 未指定-p时表示不需要密码登录
>
> 退出可以使用exit quit 

## 9、数据库的简单使用

	查看数据库列表信息

```
SHOW DATABASES
```

	查看数据库中的数据表信息

```
USE 数据库名
SHOW TABLES
```

	显示数据表的结构

```
DESCRIBE [数据库名.表名]
```

	创建新的数据库

```
CREATE DATABASE 数据库名
```

	创建数据表

```
CREATE TABLE 表名 (字段定义...)
```

	删除数据表

```
DROP TABLE [数据库名.表名]、
```

	删除数据库

```
DROP DATABASE [数据库名]
```

	向数据表中插入记录

```
INSERT INTO 表名(字段1, 字段2, ……)  VALUES(字段1的值, 字段2的值, ……) 
```

	从数据库中查找

```
SELECT 字段名1,字段名2 …… FROM 表名 WHERE 条件表达式
```

	修改、更新数据表中的数据记录

```
UPDATE 表名 SET 字段名1=字段值1[,字段名2=字段值2]  WHERE 条件表达式
```

	在数据表中删除指定的数据记录

```
DELETE FROM 表名 WHERE 条件表达式
```

## 10、数据库维护

备份数据库

```
[root@localhost ~]# mysqldump -u root -p auth > mysql-auth.sql				#备份auth库
Enter password:
[root@localhost ~]# mysqldump -u root -p --all-databases > mysql-all.sql	#备份所有库
[root@localhost ~]# ls -l mysql-*.sql
-rw-r--r-- 1 root root 292300 09-17 04:55 mysql-all.sql
-rw-r--r-- 1 root root   1678 09-17 04:55 mysql-auth.sql
```

从备份中恢复

```
[root@localhost ~]# mysql -u root -p auth < mysql-auth.sql			#恢复auth库 
[root@localhost ~]# mysql -u root -p < mysql-all.sql 				#恢复所有库
```

注：构建服务所需的包可在[server_source_2020.iso ](https://download.csdn.net/download/qq_45417634/13208956)请自行下载，您也可以在所需安装包官网下载
本地源配置、防火墙、selinux等是linux较为基础的内容，不再赘述。
本文均为原创，如需与博主交流可email至mufeng.yu@qq.com