---
title: Redis 缓存中间件编译安装
description: Redis 是一个实时数据平台（The Real-time Data Platform.） ，是一个快速、开源、内存中的数据存储结构，在 SpringBoot 项目中，使用最广泛的缓存中间件就是 Redis 了，本文将讨论如何编译安装 Redis 到 Linux 服务器。
categories:
  - Linux 企业级运维
outline: [ 2,3 ]
date: 2024-07-16
tags:
  - Linux
  - Redis
  - 编译安装
head:
  - - meta
    - name: keywords
      content: Linux企业级运维, 编译安装, MYSQL, Linux, Nginx, Minio, SpringBoot, Redis
cover: https://cdn.imufeng.cn/mblog/a7f0085a6b4aed958311b3edc4b98cc7.png
---

# 第二步 缓存中间件 Redis 编译安装

## 一、简介

根据 [Redis 官网](https://redis.io) 的信息，Redis 是一个实时数据平台（The Real-time Data Platform.）
，是一个快速、开源、内存中的数据存储结构，也可以用作文档或矢量数据库。

由于内存读写效率高、速度快的特点，Redis 使用**内存数据集**，能够支持每秒数十万次的读写操作。并且Redis
的所有操作都是原子性的，这意味着操作要么完全执行，要么完全不执行。这种特性对于确保数据的一致性和完整性至关重要，尤其是在高并发环境下处理事务时。

在 SpringBoot 项目中，使用最广泛的缓存中间件就是 Redis 了，本教程将源码开始，介绍如何编译安装 Redis 到 Linux 服务器。

## 二、安装

### 2.1 安装前准备

> 在此处安装时，需要的 make 、openssl等工具和开发库已在之前教程中安装，如果没有安装，在编译过程中遇到缺少的依赖按照之前教程自行安装即可，此处不再赘述。

执行以下命令即可下载Redis 源码包：

```shell
wget https://download.redis.io/redis-stable.tar.gz
```

解压后目录结构：

```text
[root@imufeng opt]# tar -zxf redis-stable.tar.gz -C /usr/src/
[root@imufeng opt]# cd /usr/src/redis-stable/
[root@imufeng redis-stable]# ls
00-RELEASENOTES     COPYING   MANIFESTO   runtest-cluster    sentinel.conf  utils
BUGS                deps      README.md   runtest-moduleapi  src
CODE_OF_CONDUCT.md  INSTALL   redis.conf  runtest-sentinel   tests
CONTRIBUTING.md     Makefile  runtest     SECURITY.md        TLS.md
```

### 2.2 开始编译安装

::: tip 提示
Redis 没有编译安装选项校验的步骤，**PREFIX** 参数需要在 install 时指定。
:::

执行以下命令，开始编译：

```shell
make -j4 BUILD_TLS=yes
```

编译成功后，开始安装：

```shell
make PREFIX=/usr/local/redis install
```

安装成功后，目录结构如下：

```text
[root@imufeng bin]# pwd
/usr/local/redis/bin

[root@imufeng bin]# ls
redis-benchmark  redis-check-aof  redis-check-rdb  redis-cli  redis-sentinel  redis-server
```

## 三、配置

### 3.1 环境变量配置

修改 `/etc/profile` 文件，在 `PATH` 写入 环境变量即可：

```shell
export PATH=$PATH:/usr/local/redis/bin
```

执行如下命令加载修改：

```shell
source /etc/profile 或 . /etc/profile
```

环境变量生效。

### 3.2 Redis.conf 配置文件

`redis.conf`  配置文件需要在启动 Redis 时指定，其详细示例在源码包根目录下，可以将其拷贝到合适的地方，在启动时指定：

```shell
mkdir /usr/local/redis/etc/
cp /usr/src/redis-stable/redis.conf /usr/local/redis/etc/
```

也可只保留部分配置（未指定则为默认）

```ini
bind 0.0.0.0			# 监听地址
requirepass root		# 访问密码
protected-mode yes		# 安全模式
port 6379				# 监听端口
daemonize yes			# 开启守护线程
pidfile /var/run/redis_6379.pid		# PID文件
loglevel notice			# 日志等级
logfile ""				# 日志文件
databases 16			# 初始化数据库
```

### 3.3 Redis.service 配置

源码包 `utils/systemd-redis_server.service` 文件提供了 systemed 服务文件，根据提示配置 redis.conf 的位置后，大致如下：

```ini
[Unit]
Description=Redis data structure server
Documentation=https://redis.io/documentation
Wants=network-online.target
After=network-online.target

[Service]
ExecStart=/usr/local/bin/redis-server /usr/local/redis/etc/ 
LimitNOFILE=10032
NoNewPrivileges=yes
Type=notify
TimeoutStartSec=infinity
TimeoutStopSec=infinity
UMask=0077

[Install]
WantedBy=multi-user.target
```

由于我们选用的 AlmaLinux9 基于 RHCE 9，其 service 文件在 `/lib/systemd/system/` 目录下，需要将 service
文件重命名为 `redis.service`  并拷贝到该目录下：

```shell
cp /usr/src/redis-stable/utils/systemd-redis_server.service /lib/systemd/system/redis.service
```

然后执行 `systemctl daemon-reload` 命令，即可加载更新。

## 四、启动执行

Redis 启动命令 `redis-server /path/to/conf`，即直接执行 redis-server 并指定配置文件即可，如果 `protected-mode` 配置为
yes，即后端运行，如果为 no，则会将日志打印到控制台。

我们已经配置了 Redis.service 服务，所以执行 `systemctl start redis` 即可启动服务：

```shell
[root@imufeng system]# systemctl start redis
[root@imufeng system]# systemctl status redis
● redis.service - Redis data structure server
     Loaded: loaded (/usr/lib/systemd/system/redis.service; disabled; preset: disabled)
     Active: active (running) since Tue 2024-07-16 13:19:13 ACST; 3h 14min ago
       Docs: https://redis.io/documentation
    Process: 38149 ExecStart=/usr/local/redis/bin/redis-server /usr/local/redis/etc/redis.conf -->   Main PID: 38150 (redis-server)
      Tasks: 5 (limit: 48598)
     Memory: 8.3M
        CPU: 15.082s
     CGroup: /system.slice/redis.service
             └─38150 "/usr/local/redis/bin/redis-server 0.0.0.0:6379"
```

如果看到上方内容，即代表 redis 服务启动成功。

我们可以使用 redis-cli 命令或 RedisInsight、AnotherRedisDesktop等工具连接Redis，这里以 redis-cli 举例：

```shell
[root@imufeng system]# redis-cli
127.0.0.1:6379> ping
(error) NOAUTH Authentication required.
127.0.0.1:6379> auth root
OK
127.0.0.1:6379> ping
PONG
```

由于配置文件指定了密码，所以需要认证才可以访问。

至此，Redis 的编译安装已完成。

::: tip 提示

本文仅讨论Redis 的编译安装，Redis 命令、集群操作、Redis Stack、Redis Insight 工具，等其他内容，详见博客后续更新。

:::
