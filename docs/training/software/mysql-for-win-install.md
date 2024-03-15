---
description: Mysql for Windows 安装及初始化。
categories: 
   - 教程分享
tags: 
   - mysql
   - windows
sticky: 2
---

# Mysql for Windows 安装及初始化

## 一、简介

Windows 安装 Mysql 主要还是为了本地调试的方便。8.x 的版本和 5.7 的版本安装过程大差不差，这里以 8.0.35（8.2版本发布前的最新版）举例。

## 二、下载安装

Windows 端 Mysql 只需要在 [MySQL :: Download MySQL Community Server](https://dev.mysql.com/downloads/mysql/) 页面选择对应版本下载 mysql-xxx-winx64.zip，该压缩包为编译后文件，并非源码， 可以直接运行。

目录结构如下：

```text
Directory: D:\Element\mysql-8.0.35

Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
da---            2024/1/4    15:00                bin
da---            2024/1/4    15:00                docs
da---            2024/1/4    15:00                include
da---            2024/1/4    15:00                lib
da---            2024/1/4    15:00                share
-a---          2023/10/12    19:45         279355 LICENSE
-a---          2023/10/12    19:45            666 README
```

## 四、配置

### 配置环境变量

为方便 Mysql 服务的使用和管理，可以在 PATH 中加入 Mysql 的 bin 目录。



### 修改配置文件

Mysql 配置默认读取自安装目录下 `my.ini`，如没有需要创建一个，Mysql 默认有一套配置，如端口默认为 3306 等，`my.ini` 并非必须，只需要在其中写明需要的配置即可，如下：

```
[mysqld]

lower_case_table_names=2
```

> 注意：此处 lower_case_table_names 有三种取值：
>
> - 0：表示表名区分大小写。
> - 1：表示将表名转换为小写，但在比较时仍然区分大小写。
> - 2：表示将表名转换为小写，并且在比较时也不区分大小写。

### 初始化

初始化 Mysql 需要管理员权限，需要管理员权限运行 Powershell 或 CMD。执行 `mysqld --initialize  --console` 既可初始化并在控制台显示密码。

`Mysqld` 服务初始化过程如下：

```text
PS D:\Element\mysql-8.0.35> ./bin/mysqld --initialize  --console
2024-01-04T07:08:20.705336Z 0 [System] [MY-013169] [Server] D:\Element\mysql-8.0.35\bin\mysqld.exe (mysqld 8.0.35) initializing of server in progress as process 3008
2024-01-04T07:08:20.730739Z 1 [System] [MY-013576] [InnoDB] InnoDB initialization has started.
2024-01-04T07:08:21.033652Z 1 [System] [MY-013577] [InnoDB] InnoDB initialization has ended.
2024-01-04T07:08:22.291288Z 6 [Note] [MY-010454] [Server] A temporary password is generated for root@localhost: /YlA-/3M_yny
```

初始化完成后，会在 Mysql 安装目录生成一个 `data` 目录，即为 Mysql 数据存储目录。初始化日志最后一行显示的即为初始化的随机密码，权限为 `root@localhost`。

### 安装服务

运行 `mysqld install` 即可在 Windows 系统中安装 Mysql 服务。

```text
PS D:\Element\mysql-8.0.35> .\bin\mysqld install
Service successfully installed.
```

### 启动服务

可以使用 `net start mysql` 命令启动 Mysql 服务，如出现如下内容，即为启动成功：

```
PS C:\Users\mufeng> net start mysql
MySQL 服务正在启动 .
MySQL 服务已经启动成功。
```

### 测试

服务启动之后，即可连接 Mysql：

```text
PS C:\Users\mufeng> mysql -uroot -p
Enter password: ************
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 8
Server version: 8.0.35

Copyright (c) 2000, 2023, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql>
```

### 修改 Mysql 默认密码

Mysql 权限管理是基于 `域 + 用户 + 权限` 的方式，本地对安全性要求不高，此处修改 root 用户随处可以登录。

如下：

```text
mysql> ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root';
Query OK, 0 rows affected (0.01 sec)
mysql> use mysql;
Database changed
mysql> update user set host = '%' where host = 'localhost' and user = 'root';
Query OK, 1 row affected (0.00 sec)
Rows matched: 1  Changed: 1  Warnings: 0
```

测试：

```text
PS C:\Users\mufeng> mysql -uroot -proot
mysql: [Warning] Using a password on the command line interface can be insecure.
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 10
Server version: 8.0.35 MySQL Community Server - GPL

Copyright (c) 2000, 2023, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql>
```

登录成功！至此，Mysql For Windows 安装完成。

## 五、其他

### Mysql 服务无法启动

Mysql 初始化顺序为先修改配置文件，再初始化，如果先初始化，然后修改了诸如忽略大小写等与现有数据冲突的配置，可能会造成无法启动。

