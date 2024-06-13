---
title: Nginx 服务器编译安装
description: Nginx 作为当下最强大的正向/反向代理服务器，以及应用最广泛的轻量级Web服务器，能够适用于多种场景，本文将描述 Nginx WEB 服务器从源码编译安装的流程。
categories:
  - Linux 企业级运维
outline: [ 2,3 ]
date: 2024-04-20
tags:
  - Linux
  - Nginx
  - 编译安装
head:
  - - meta
    - name: keywords
      content: Linux企业级运维, 编译安装, MYSQL, Linux, Nginx, Minio, SpringBoot, Redis
cover: https://cdn.imufeng.cn/mblog/006125ea4376a1e135b8a601c2418948.jpg
---

# 第一步 WEB 服务器 Nginx 编译安装

## 一、简介

根据 [Nginx官网](https://nginx.org/)介绍。Nginx 是 an HTTP and reverse proxy server, a mail proxy server, and a generic TCP/UDP proxy server（HTTP和反向代理服务器，邮件代理服务器和通用TCP/UDP代理服务器）。它还是应用最广泛的轻量级Web服务器。在性能上，Nginx占用很少的系统资源，能支持更多的并发连接，达到更高的访问效率；在功能上，Nginx是优秀的代理服务器和负载均衡服务器；在安装配置上，Nginx安装简单、配置灵活。

## 二、安装

### 2.1 下载

下载地址：[nginx: download](https://nginx.org/en/download.html) 选择 Stable version 最新的稳定版即可。下载后，解压到 `/usr/src` 目录下，目录结构如下：

```text
auto     CHANGES.ru  configure  html     Makefile  objs    src
CHANGES  conf        contrib    LICENSE  man       README
```

### 2.2 安装前准备

编译安装需要 C 语言及 make 工具的支持，先安装这两个，其他依赖根据编译检查的提示再逐一安装。

```shell
yum -y install make gcc g++
```

### 2.3 编译选项

我是用的编译安装选项如下，可以根据具体业务调整，详见官方文档 [Building nginx from Sources](https://nginx.org/en/docs/configure.html)。

进入源码包所在目录执行以下命令做编译安装检查：

```shell
./configure \
--prefix=/data/software/nginx
--user=nginx \
--group=nginx \
--with-pcre \
--with-http_ssl_module \
--with-http_v2_module \
--with-http_realip_module \
--with-http_addition_module \
--with-http_sub_module \
--with-http_dav_module \
--with-http_flv_module \
--with-http_mp4_module \
--with-http_gunzip_module \
--with-http_gzip_static_module \
--with-http_random_index_module \
--with-http_secure_link_module \
--with-http_stub_status_module \
--with-http_auth_request_module \
--with-http_image_filter_module \
--with-http_slice_module \
--with-mail \
--with-threads \
--with-file-aio \
--with-stream \
--with-mail_ssl_module \
--with-stream_ssl_module
```

检查过程中，会遇到一些报错，如下：

![image-20240409103432796](https://cdn.imufeng.cn/mblog/9921b40beeb127a45f05102faffdbbd0.png)

![image-20240409103429712](https://cdn.imufeng.cn/mblog/c5ef3f38fc2e7d31ab1de26901af20d0.png)

从报错中，我们可以清晰的看到缺少 XXX 模块，一般都是安装 XXX-devel 包含依赖库的包即可，我安装了如下软件包：`pcre-devel`、`openssl-devel`、`gd-devel`。

### 2.4 编译安装

使用 `make` 命令编译，使用 `make install` 命令安装。编译时可以使用 `make -j[n]` 参数指定多线程，一般为机器核心数。

![image-20240409103602629](https://cdn.imufeng.cn/mblog/6d7a88c02227819d393cdc7b78ec36c6.png)

编译安装成功之后，即可在指定的路径看到 nginx 了：

![image-20240409113645980](https://cdn.imufeng.cn/mblog/bd2b17443881488fe9b780e5cc777ad2.png)

### 2.5 启动

运行 `sbin` 里边的 `nginx` 文件即可启动 nginx：

![image-20240409113830916](https://cdn.imufeng.cn/mblog/c53087206ab2eea0f8f9a158190106e6.png)

可以看到 80 端口已经被占用了，curl 访问一下，可以看到 html 页面结构，浏览器也可以直接访问，证明 nginx 启动没问题了。

![image-20240409103825846](https://cdn.imufeng.cn/mblog/5a6fa4a463b270f83af04c2963e1a097.png)

![image-20240409104522844](https://cdn.imufeng.cn/mblog/2b46410a1d937a58a0ee5d1d24827e5b.png)

## 三、配置

Nginx 的配置推荐 [Nginx 配置工具](https://www.digitalocean.com/community/tools/nginx)，这个网站可以使用可视化页面带你进行 Nginx 的配置，非常适合小白。

### 3.1 使用 systemd 管理

要将 nginx 配置为服务交给 systemd 管理，需要新增一个 service 文件：

```shell
vim /usr/lib/systemd/system/nginx.service
```

```ini
[Unit]
Description=nginx web server
Documentation=http://nginx.org/en/docs/
After=network.target remote-fs.target nss-lookup.target

[Service]
Type=forking
PIDFile=/data/service/nginx/logs/nginx.pid
ExecStartPre=/data/service/nginx/sbin/nginx -t -c /data/service/nginx/conf/nginx.conf
ExecStart=/data/service/nginx/sbin/nginx -c /data/service/nginx/conf/nginx.conf
ExecReload= /data/service/nginx/sbin/nginx -s reload
ExecStop= /data/service/nginx/sbin/nginx -s stop
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

通过 systemctl 命令启动 nginx：

启动前一定要使用 `nginx -s stop` 命令或 `kill` 命令停止 nginx，否则会报端口占用。

![image-20240409114356091](https://cdn.imufeng.cn/mblog/cf1ff822fe98d64c3f71c7625bac00f2.png)

开机自启：

```text
systemctl enable nginx
Created symlink /etc/systemd/system/multi-user.target.wants/nginx.service → /usr/lib/systemd/system/nginx.service.
```

### 3.2 基础配置

Nginx 只有一个配置文件就是 `nginx.conf` ，能看到的配置文件都是通过 `include` 引入的，方便管理。

nginx.conf  配置结构如下：

```text
...              #全局配置

events {         #events块
   ...
}

http      #http块
{
    ...   #http全局块
    server        #server块
    { 
        ...       #server全局块
        location [PATTERN]   #location块
        {
            ...
        }
        location [PATTERN] 
        {
            ...
        }
    }
    server
    {
      ...
    }
    ...     #http全局块
}
```

- 全局配置包括用户、进程 PID、日志等的配置。
- events 配置 nginx 的访问、网络连接。
- http 块配置包括多个 server 块，一个个的服务。
- server 可以配置多个，专有名词叫虚拟主机。
- localtion 配置匹配的路径，可以用正则表达式。

下面是我服务器 `imufeng.cn` blog 服务的 nginx 配置：

`nginx.conf`

```nginx
user                 nginx;
pid                  logs/nginx.pid;
worker_processes     auto;
worker_rlimit_nofile 65535;

# Load modules
include              /etc/nginx/modules-enabled/*.conf;

events {
    multi_accept       on;
    worker_connections 65535;
}

http {
    charset                utf-8;
    sendfile               on;
    tcp_nopush             on;
    tcp_nodelay            on;
    server_tokens          off;
    log_not_found          off;
    types_hash_max_size    2048;
    types_hash_bucket_size 64;
    client_max_body_size   16M;

    # MIME
    include                mime.types;
    default_type           application/octet-stream;

    # Logging
    access_log             off;
    error_log              /dev/null;

    # SSL
    ssl_session_timeout    1d;
    ssl_session_cache      shared:SSL:10m;
    ssl_session_tickets    off;

    # Diffie-Hellman parameter for DHE ciphersuites
    ssl_dhparam            cert/dhparam.pem;

    # Mozilla Intermediate configuration
    ssl_protocols          TLSv1.2 TLSv1.3;
    ssl_ciphers            ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;

    # OCSP Stapling
    ssl_stapling           on;
    ssl_stapling_verify    on;
    resolver               1.1.1.1 1.0.0.1 8.8.8.8 8.8.4.4 208.67.222.222 208.67.220.220 valid=60s;
    resolver_timeout       2s;

    # Load configs
    include                imufeng.cn/*.conf;
}
```

`imufeng.cn/blog.conf`

```nginx
server {
    listen              443 ssl http2;
    listen              [::]:443 ssl http2;
    server_name         blog.imufeng.cn;
    root                /home/mblog-vitepress-web;

    # SSL
    ssl_certificate     cert/imufeng.cn.cer;
    ssl_certificate_key cert/imufeng.cn.key;

    # security
    include             conf/global.conf/security.conf;

    # logging
    access_log          logs/blog.imufeng.cn.log combined buffer=512k flush=5m;
    error_log           logs/blog.imufeng.cn.error.log error;


    # index.html fallback
    location / {
        add_header Content-Security-Policy "default-src 'self' 'unsafe-eval'  http: https: ws: wss: data: blob: 'unsafe-inline' 'unsafe-eval';";

        try_files $uri $uri/ $uri.html /404.html;
    }
}
```

其中证书及 dhparam 配置详见我的博客 [泛域名证书申请以及部署 | MBlog (imufeng.cn)](https://www.imufeng.cn/training/linux/acme-sh.html)

## 参考资料

- [Building nginx from Sources](https://nginx.org/en/docs/configure.html)
- [Nginx 配置详解 | 菜鸟教程 (runoob.com)](https://www.runoob.com/w3cnote/nginx-setup-intro.html)



