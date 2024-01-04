---
description: 本文将带你快速了解 docker compose 安装部署 WordPress。
categories: 
   - 建站笔记
tags: 
   - Linux
   - Docker
   - WordPress
---

# 基于DockerCompose的WordPress环境部署（附配置优化）

> 观前提醒：通过本文安装`WordPress`，需要你有一定的Linux基础，并且安装了最新版的`Docker`。

## 一、为什么是DockerCompose

回答：**因为懒**

之前在跟其他人沟通的时候，看到我使用Docker Compose部署 WordPress，都有些嗤之以鼻，觉得没有必要,也不够高大上。但是问他们用什么？其实很多都是第三方托管，或者干脆自己从零搭建环境，而像我这种对Linux环境稍微有点了解，并且做过一些LAMP/LNMP架构定制化编译安装的，也并不认为靠第三方托管的方式有多么便携又高大上，或者编译安装一套LNMP架构有多么优雅。

## 二、怎么用DockerCompose

Docker的使用已经成为运维人员的必修课，而使用Docker能够极大地简化环境部署，减少大部分重复性的手动操作。这里先介绍DockerCompose搭建环境的一个基本流程，至于Docker的安装那些，也比较简单，我后边慢慢写。

> 顺便说一下，现在Docker已经自带`compose`了，不需要单独安装 `docker-compose`

DockerCompose部署环境只需要一个文件，`docker-compose.yaml` 所有的配置都在这个文件中。DockerCompose常用命令如下：

| 命令                   | 说明                                               |
| ---------------------- | -------------------------------------------------- |
| docker compose up <-d> | 启动yaml文件中定义的所有服务。<br />-d表示后台启动 |
| docker compose down    | 停止并删除所有容器                                 |
| docker compose ps      | 查看服务运行状态                                   |
| docker compose restart | 重新启动所有服务                                   |
| docker compose logs    | 查看所有日志                                       |

> 上述命令在后边跟上yaml文件中定义的ServiceName，则可以操作单独的服务

## 三、开始部署

### 3.1 YAML文件示例

> YAML文件需要放在特定的文件夹，最好单独建立文件夹，容器启动时会以当前`目录的名称-服务名称-序号`命名。

```shell
mkdir ~/wordpress
cd ~/wordpress
vim docker-compose.yaml
```

```yaml
version: '3.3'
# 服务
services:
  # 数据库服务
  db:
    image: mysql:5.7
    volumes:
      - ./db_data:/var/lib/mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: wordpress
      MYSQL_DATABASE: wordpress
      MYSQL_USER: wordpress
      MYSQL_PASSWORD: wordpress
  # Redis缓存服务
  cache:
    image: redis:latest
    restart: always
    ports:
      - 6379
  # WordPress服务
  wordpress:
    depends_on:
      - db
      - cache
    image: wordpress:php8.2
    ports:
      - "8080:80"
    restart: always
    environment:
      WORDPRESS_DB_HOST: db:3306
      WORDPRESS_DB_USER: wordpress
      WORDPRESS_DB_PASSWORD: wordpress
      WORDPRESS_DB_NAME: wordpress
    volumes:
        - ./wp_data:/var/www/html
        - ./php_config/php.ini-production:/usr/local/etc/php/php.ini-production
# 网络划分
networks:
    wordpress:
        driver: bridge
        external: true
        ipam:
            config:
                - subnet: 10.10.1.0/24
                - gateway: 10.10.1.10
```

在上面的示例中，规定了当前 `docker-compose.yaml`遵循3.3版本规范，共涉及三个服务：数据库、缓存以及WordPress。并使用了三个卷，将数据库文件、WordPress服务文件以及PHP配置文件挂载到本地。

在该文件编写完成后，可以在当前目录使用 `docker compose up` 命令安装，首次安装需要下载镜像，会比较慢，之后再安装则不需要。

安装完之后，你就可以在使用`ip:8080`的方式访问你的 WordPress 站点了。如果你需要配置域名访问，在Nginx中添加如下配置后再去安装你的 WordPress 。

> 你需要将 `blog-wp.imufeng.cn` 替换为你自己的域名。至于泛域名证书的配置参见我的其他博客。

```nginx
server {
    listen              443 ssl http2;
    listen              [::]:443 ssl http2;
    server_name         blog-wp.imufeng.cn;

    # SSL
    ssl_certificate     /etc/nginx/ssl/imufeng.cn.cer;
    ssl_certificate_key /etc/nginx/ssl/imufeng.cn.key;

    # security
    include             nginxconfig.io/security.conf;

    # logging
    access_log          /var/log/nginx/blog-wp.imufeng.cn.log combined buffer=512k flush=5m;
    error_log           /var/log/nginx/blog-wp.imufeng.error.log error;
    location / {
        proxy_pass http://127.0.0.1:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        add_header Content-Security-Policy "default-src 'self' 'unsafe-inline' 'unsafe-eval' https: ws: wss: data: blob:";
    }

}
```

至此，一个简单的WordPress就搭建完成了。