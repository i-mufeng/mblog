---
title: Docker Compose 编排实践指南
description: 使用 Docker Compose 编排多容器应用，实现开发环境快速搭建
categories:
  - 技术笔记分享
tags:
  - Docker
  - Docker Compose
  - 容器化
  - 运维
outline: [2,3]
date: 2025-08-05
---

# Docker Compose 编排实践指南

> Docker Compose 是定义和运行多容器 Docker 应用的工具，通过一个 YAML 文件配置所有服务，一键启动整个应用栈。

<!-- more -->

## 一、Docker Compose 简介与安装

### 1.1 什么是 Docker Compose

Docker Compose 用于定义和运行多容器 Docker 应用。使用 YAML 文件配置应用的服务，然后通过一条命令创建并启动所有服务。

**典型使用场景：**

| 场景 | 说明 |
|------|------|
| 开发环境 | 一键搭建开发所需的全部服务 |
| 自动化测试 | 创建隔离的测试环境 |
| 单机部署 | 在单台服务器上部署多个服务 |

### 1.2 安装

```bash
# Linux 安装
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker-compose --version

# Docker Desktop (Windows/macOS) 已内置
docker compose version
```

:::tip V2 版本变化
Docker Compose V2 使用 `docker compose` 命令（无连字符），V1 使用 `docker-compose`。推荐使用 V2。
:::

## 二、docker-compose.yml 核心配置

### 2.1 基本结构

```yaml
version: '3.8'

services:
  web:
    image: nginx:alpine
    ports:
      - "80:80"
    
  app:
    build: .
    depends_on:
      - db
    
  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root123
```

### 2.2 service 配置详解

```yaml
services:
  app:
    # 镜像
    image: node:18-alpine
    # 或者构建
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - NODE_ENV=production
    
    # 容器名称
    container_name: my-app
    
    # 端口映射
    ports:
      - "3000:3000"
      - "8080:80"
    
    # 环境变量
    environment:
      - NODE_ENV=development
      - DB_HOST=db
    # 或使用文件
    env_file:
      - .env
    
    # 数据卷
    volumes:
      - ./src:/app/src          # 绑定挂载
      - node_modules:/app/node_modules  # 命名卷
      - /app/logs                 # 匿名卷
    
    # 依赖服务
    depends_on:
      db:
        condition: service_healthy
    
    # 网络
    networks:
      - backend
    
    # 重启策略
    restart: unless-stopped
    
    # 健康检查
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    
    # 命令覆盖
    command: npm run dev
```

## 三、多服务编排实战

### 3.1 Web + MySQL + Redis

```yaml
version: '3.8'

services:
  # Web 应用
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=mysql
      - REDIS_HOST=redis
      - DB_PASSWORD=secret123
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_started
    volumes:
      - ./src:/app/src
    networks:
      - app-network
    restart: unless-stopped

  # MySQL 数据库
  mysql:
    image: mysql:8.0
    container_name: mysql
    environment:
      MYSQL_ROOT_PASSWORD: root123
      MYSQL_DATABASE: myapp
      MYSQL_USER: app
      MYSQL_PASSWORD: secret123
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network

  # Redis 缓存
  redis:
    image: redis:7-alpine
    container_name: redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes
    networks:
      - app-network

# 数据卷
volumes:
  mysql-data:
  redis-data:

# 网络
networks:
  app-network:
    driver: bridge
```

### 3.2 前端 + 后端 + 数据库

```yaml
version: '3.8'

services:
  # 前端 Vue 应用
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - app-network

  # 后端 Spring Boot 应用
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=docker
      - DB_HOST=postgres
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - app-network

  # PostgreSQL 数据库
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres123
    volumes:
      - pg-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network

volumes:
  pg-data:

networks:
  app-network:
```

## 四、网络与数据卷配置

### 4.1 网络配置

```yaml
networks:
  # 默认桥接网络
  default:
    driver: bridge
  
  # 自定义网络
  frontend-net:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
  
  backend-net:
    driver: bridge
    internal: true  # 内部网络，无法访问外网

services:
  web:
    networks:
      - frontend-net
      - backend-net
  
  db:
    networks:
      - backend-net  # 只在内部网络
```

### 4.2 数据卷配置

```yaml
volumes:
  # 命名卷
  mysql-data:
    driver: local
  
  # 带驱动选项的卷
  nfs-data:
    driver: local
    driver_opts:
      type: nfs
      o: addr=192.168.1.100,rw
      device: ":/path/to/dir"

services:
  app:
    volumes:
      # 绑定挂载（开发环境常用）
      - ./src:/app/src
      
      # 命名卷
      - mysql-data:/var/lib/mysql
      
      # 只读挂载
      - ./config:/app/config:ro
```

## 五、环境变量管理

### 5.1 多种方式

```yaml
services:
  app:
    # 方式1：直接定义
    environment:
      - NODE_ENV=production
      - DB_HOST=db
    
    # 方式2：从文件加载
    env_file:
      - .env
      - .env.production
    
    # 方式3：引用宿主机变量
    environment:
      - DB_PASSWORD=${DB_PASSWORD}
```

### 5.2 .env 文件

```bash
# .env
DB_PASSWORD=my_secret_password
APP_PORT=3000
NODE_ENV=development
```

```yaml
# docker-compose.yml
services:
  app:
    ports:
      - "${APP_PORT}:3000"
    environment:
      - DB_PASSWORD=${DB_PASSWORD}
```

:::warning 安全提醒
- 不要将 `.env` 文件提交到 Git
- 使用 `.env.example` 作为模板
- 生产环境使用 Docker secrets 或外部配置中心
:::

## 六、常用命令与调试技巧

### 6.1 基础命令

```bash
# 启动所有服务
docker compose up -d

# 查看运行中的服务
docker compose ps

# 查看日志
docker compose logs -f app
docker compose logs -f --tail=100

# 停止所有服务
docker compose down

# 停止并删除数据卷
docker compose down -v

# 重新构建并启动
docker compose up -d --build

# 进入容器
docker compose exec app sh

# 执行一次性命令
docker compose run --rm app npm test
```

### 6.2 调试技巧

```bash
# 查看服务配置
docker compose config

# 查看网络
docker network ls | grep myproject

# 查看数据卷
docker volume ls | grep myproject

# 查看容器资源使用
docker stats

# 查看容器详情
docker inspect <container_id>
```

### 6.3 常见问题

| 问题 | 解决方案 |
|------|----------|
| 端口被占用 | 修改端口映射或停止占用端口的进程 |
| 权限问题 | 使用 `user: "${UID}:${GID}"` |
| 网络不通 | 检查是否在同一网络，使用服务名访问 |
| 数据丢失 | 使用命名卷而非匿名卷 |

## 七、总结

| 配置项 | 说明 |
|--------|------|
| image | 使用官方镜像 |
| build | 从 Dockerfile 构建 |
| ports | 端口映射 |
| volumes | 数据持久化 |
| environment | 环境变量 |
| depends_on | 服务依赖 |
| networks | 网络配置 |
| healthcheck | 健康检查 |

:::tip 最佳实践
1. 使用命名卷持久化数据
2. 配置健康检查确保服务可用
3. 使用 `.env` 管理环境变量
4. 开发环境使用绑定挂载
5. 生产环境使用镜像标签而非 latest
:::
