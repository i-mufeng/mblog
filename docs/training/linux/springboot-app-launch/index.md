---
top: 2
title: SpringBoot 企业级部署上线流程
description: 本系列将从 Linux 企业级运维的角度出发，详细介绍 Linux 操作系统下 Nginx + JAVA + MYSQL + Redis + Minio 的安装部署，主要使用编译安装。
sticky: 10
categories:
  - Linux 企业级运维
outline: [ 2,3 ]
date: 2024-04-15
tags:
  - 运维
  - 编译安装
  - Linux
head:
  - - meta
    - name: keywords
      content: Linux企业级运维, 编译安装, MYSQL, Linux, Nginx, Minio, SpringBoot, Redis
cover: https://cdn.imufeng.cn/mblog/eace45811a4b7ff825f1495aab72a2b0.png
---

# Linux 企业级运维 - SpringBoot项目上线五部曲

:::tip 观前提示

本文将不会阐述 Linux 安装、基本配置等相关操作。阅读本教程前，你需要：

1. Linux 基本操作知识储备
2. 前后端分离系统的基础及打包操作（maven、pnpm等）
3. Linux 网络配置（nmcli、NetworkManager等）
4. 自行安装操作系统、更新系统，你可能还需要切换镜像源
:::

Linux 服务器，其重要性不言而喻，本系列将从各个服务的安装、部署、配置等，系统性的讲解 SpringBoot 前后端分离项目的上线流程，
本系列将区别于类似某些 Linux 面板的自动化部署，也避免使用容器等工具，所有的服务部署将尽量使用最新版本，并从源码进行编译安装。 
除 JAVA 使用 jdk17 外，本教程版本选择都为最新的稳定版，不推荐使用任何第三方站点下载。无法访问请自行科学。
由于原生编译安装对于硬件资源的要求较高，轻量级的云 ECS 服务器可能不太满足，所以更推荐本地虚拟机操作。

各服务版本及官网地址如下：
|     名称      |   版本   |                                   地址                                    |   说明   |
|:-----------:|:------:|:-----------------------------------------------------------------------:|:------:|
| Nginx 代理服务器 | 1.25.3 |                    [nginx news](https://nginx.org/)                     | 源码编译安装 |
|  Mysql 数据库  | 8.0.37 |                   [MySQL](https://www.mysql.com/cn/)                    | 源码编译安装 |
| Redis 缓存中间件 |  7.2   |                       [Redis](https://redis.io/)                        | 源码编译安装 |
|    MinIO    | latest |                   [MINIO](https://www.minio.org.cn/)                    | 可执行文件  |
|  JDK 运行环境   |   17   | [JDK-17](https://www.oracle.com/cn/java/technologies/downloads/#java17) | 可执行文件  |

> 本博客不推荐从任何除官网外的第三方平台下载服务或源码包。

### 目录

1. [WEB 服务器 Nginx 编译安装](./nginx.md)
2. [Mysql 数据库编译安装](./mysql.md)
