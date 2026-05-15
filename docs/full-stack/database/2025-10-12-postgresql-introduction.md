---
title: PostgreSQL 入门指南
description: 从零开始学习 PostgreSQL，了解其核心特性与 MySQL 的差异
categories:
  - 技术笔记分享
tags:
  - PostgreSQL
  - 数据库
  - SQL
outline: [2,3]
date: 2025-10-12
---

# PostgreSQL 入门指南

> PostgreSQL 是世界上最先进的开源关系型数据库，以其强大的功能、严格的标准兼容性和出色的扩展性著称。

<!-- more -->

## 一、PostgreSQL 简介与优势

### 1.1 历史背景

PostgreSQL 起源于 1986 年加州大学伯克利分校的 POSTGRES 项目，1996 年正式命名为 PostgreSQL。目前由全球社区维护，是功能最强大的开源关系型数据库之一。

### 1.2 核心优势

| 特性 | 说明 |
|------|------|
| 标准兼容 | 严格遵循 SQL 标准 |
| 数据类型 | 支持 JSON、数组、范围、几何等丰富类型 |
| 扩展性 | 支持自定义类型、函数、索引方法 |
| 事务安全 | 完整的 ACID 支持 |
| 并发控制 | MVCC 多版本并发控制 |
| 地理信息 | PostGIS 扩展支持地理空间数据 |

### 1.3 PostgreSQL vs MySQL

| 对比项 | PostgreSQL | MySQL |
|--------|-----------|-------|
| SQL 标准兼容 | 严格 | 较宽松 |
| JSON 支持 | JSONB（高性能） | JSON |
| 扩展性 | 极强 | 一般 |
| 全文搜索 | 内置 | 需要额外插件 |
| 地理数据 | PostGIS | 有限支持 |
| 性能 | 复杂查询优秀 | 简单查询快速 |

## 二、安装与配置

### 2.1 安装

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# CentOS/RHEL
sudo yum install postgresql-server postgresql-contrib
sudo postgresql-setup --initdb
sudo systemctl start postgresql

# macOS (Homebrew)
brew install postgresql@15
brew services start postgresql@15

# Docker
docker run -d \
  --name postgres \
  -e POSTGRES_PASSWORD=postgres123 \
  -p 5432:5432 \
  postgres:15-alpine
```

### 2.2 基础配置

```bash
# 连接数据库
psql -U postgres -h localhost

# 创建用户
CREATE USER myuser WITH PASSWORD 'mypassword';

# 创建数据库
CREATE DATABASE mydb OWNER myuser;

# 授权
GRANT ALL PRIVILEGES ON DATABASE mydb TO myuser;
```

### 2.3 配置文件

```bash
# 主配置文件
/etc/postgresql/15/main/postgresql.conf

# 常用配置
listen_addresses = '*'
max_connections = 100
shared_buffers = 256MB
work_mem = 4MB
maintenance_work_mem = 64MB
```

:::tip 连接配置
修改 `pg_hba.conf` 允许远程连接：
```
host    all    all    0.0.0.0/0    mdrypt
```
:::

## 三、数据类型对比（vs MySQL）

### 3.1 数值类型

| PostgreSQL | MySQL | 说明 |
|------------|-------|------|
| INTEGER / INT | INT | 整数 |
| BIGINT | BIGINT | 大整数 |
| SERIAL | INT AUTO_INCREMENT | 自增序列 |
| NUMERIC(p,s) | DECIMAL(p,s) | 精确数值 |
| REAL | FLOAT | 单精度浮点 |
| DOUBLE PRECISION | DOUBLE | 双精度浮点 |

### 3.2 字符串类型

| PostgreSQL | MySQL | 说明 |
|------------|-------|------|
| VARCHAR(n) | VARCHAR(n) | 可变长度 |
| TEXT | TEXT / LONGTEXT | 文本 |
| CHAR(n) | CHAR(n) | 固定长度 |

### 3.3 日期时间类型

| PostgreSQL | MySQL | 说明 |
|------------|-------|------|
| TIMESTAMP | DATETIME | 日期时间 |
| TIMESTAMPTZ | - | 带时区的时间 |
| DATE | DATE | 日期 |
| TIME | TIME | 时间 |
| INTERVAL | - | 时间间隔 |

### 3.4 特有类型

```sql
-- 数组类型
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50),
    keywords TEXT[]  -- 字符串数组
);

INSERT INTO tags (name, keywords) 
VALUES ('数据库', ARRAY['PostgreSQL', 'MySQL', 'Redis']);

-- JSONB 类型
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    attributes JSONB
);

INSERT INTO products (name, attributes)
VALUES ('手机', '{"color": "黑色", "storage": 256}');

-- 范围类型
CREATE TABLE reservations (
    id SERIAL PRIMARY KEY,
    room_id INT,
    during TSRANGE  -- 时间范围
);
```

## 四、核心 SQL 语法

### 4.1 建表与约束

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL,
    age INT CHECK (age >= 0 AND age <= 150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 添加注释
COMMENT ON TABLE users IS '用户表';
COMMENT ON COLUMN users.email IS '邮箱地址';
```

### 4.2 CTE（公共表表达式）

```sql
-- 基本 CTE
WITH active_users AS (
    SELECT id, username
    FROM users
    WHERE status = 'active'
)
SELECT * FROM active_users WHERE id > 100;

-- 递归 CTE（查询树形结构）
WITH RECURSIVE category_tree AS (
    -- 基础查询
    SELECT id, name, parent_id, 0 AS level
    FROM categories
    WHERE parent_id IS NULL
    
    UNION ALL
    
    -- 递归查询
    SELECT c.id, c.name, c.parent_id, ct.level + 1
    FROM categories c
    JOIN category_tree ct ON c.parent_id = ct.id
)
SELECT * FROM category_tree ORDER BY level, name;
```

### 4.3 窗口函数

```sql
-- 排名
SELECT 
    name,
    score,
    RANK() OVER (ORDER BY score DESC) AS rank,
    DENSE_RANK() OVER (ORDER BY score DESC) AS dense_rank,
    ROW_NUMBER() OVER (ORDER BY score DESC) AS row_num
FROM students;

-- 分组排名
SELECT 
    class_id,
    name,
    score,
    RANK() OVER (PARTITION BY class_id ORDER BY score DESC) AS class_rank
FROM students;

-- 累计求和
SELECT 
    order_date,
    amount,
    SUM(amount) OVER (ORDER BY order_date) AS running_total
FROM orders;
```

### 4.4 多种索引类型

```sql
-- B-tree 索引（默认）
CREATE INDEX idx_users_email ON users(email);

-- 唯一索引
CREATE UNIQUE INDEX idx_users_username ON users(username);

-- 部分索引
CREATE INDEX idx_active_users ON users(email) WHERE status = 'active';

-- 表达式索引
CREATE INDEX idx_users_lower_email ON users(lower(email));

-- GIN 索引（用于数组、JSONB）
CREATE INDEX idx_products_attrs ON products USING GIN(attributes);

-- GiST 索引（用于几何、范围数据）
CREATE INDEX idx_reservations_during ON reservations USING GIST(during);
```

## 五、JSONB 高级特性

### 5.1 操作符

```sql
-- 创建表
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    data JSONB
);

-- 插入数据
INSERT INTO events (data) VALUES ('{
    "name": "技术分享会",
    "location": {"city": "北京", "venue": "中关村"},
    "tags": ["数据库", "PostgreSQL"],
    "capacity": 100
}');

-- 查询操作符
SELECT data->>'name' AS name FROM events;  -- 获取文本
SELECT data->'location'->>'city' AS city FROM events;  -- 嵌套查询
SELECT data->'tags'->0 AS first_tag FROM events;  -- 数组索引
SELECT data @> '{"name": "技术分享会"}' FROM events;  -- 包含查询
SELECT data ? 'tags' FROM events;  -- 键存在查询
```

### 5.2 GIN 索引与查询优化

```sql
-- 创建 GIN 索引
CREATE INDEX idx_events_data ON events USING GIN(data);

-- 包含查询可以使用索引
SELECT * FROM events WHERE data @> '{"location": {"city": "北京"}}';

-- 键存在查询可以使用索引
SELECT * FROM events WHERE data ?| array['name', 'tags'];
```

### 5.3 JSONB 聚合与更新

```sql
-- 聚合
SELECT jsonb_agg(data->>'name') FROM events;

-- 更新
UPDATE events 
SET data = jsonb_set(data, '{capacity}', '200')
WHERE id = 1;

-- 追加数组
UPDATE events 
SET data = data || '{"speaker": "沐风"}'::jsonb
WHERE id = 1;
```

## 六、适用场景与选型建议

### 6.1 PostgreSQL 适用场景

| 场景 | 原因 |
|------|------|
| 复杂查询 | 强大的查询优化器和窗口函数 |
| JSON 数据 | JSONB 类型性能优异 |
| 地理数据 | PostGIS 扩展功能强大 |
| 数据分析 | 丰富的聚合和分析函数 |
| 企业应用 | 严格的标准兼容和事务安全 |
| 扩展需求 | 自定义类型和函数 |

### 6.2 MySQL 适用场景

| 场景 | 原因 |
|------|------|
| Web 应用 | 简单快速，生态完善 |
| 读多写少 | MyISAM 引擎读取快速 |
| 主从复制 | 成熟的复制方案 |
| 轻量级应用 | 资源占用少 |

### 6.3 选型决策矩阵

```
需要 JSON 支持 → PostgreSQL
需要地理数据 → PostgreSQL
需要复杂查询 → PostgreSQL
简单 CRUD 应用 → MySQL
已有 MySQL 生态 → MySQL
资源受限 → MySQL
```

### 6.4 迁移注意事项

```sql
-- MySQL 到 PostgreSQL 的主要差异：

-- 1. 自增主键
-- MySQL: INT AUTO_INCREMENT
-- PostgreSQL: SERIAL 或 GENERATED ALWAYS AS IDENTITY

-- 2. 字符串引号
-- MySQL: 可以使用单引号或双引号
-- PostgreSQL: 标识符用双引号，字符串用单引号

-- 3. 布尔类型
-- MySQL: TINYINT(1)
-- PostgreSQL: BOOLEAN (true/false)

-- 4. GROUP BY
-- MySQL: 可以不包含所有非聚合字段
-- PostgreSQL: 必须包含所有非聚合字段
```

## 七、总结

| 对比项 | PostgreSQL | MySQL |
|--------|-----------|-------|
| 功能丰富度 | ★★★★★ | ★★★☆☆ |
| 易用性 | ★★★☆☆ | ★★★★★ |
| 性能 | ★★★★★ | ★★★★☆ |
| 扩展性 | ★★★★★ | ★★★☆☆ |
| 生态 | ★★★★☆ | ★★★★★ |
| 学习曲线 | 较陡 | 较平缓 |

:::tip 选择建议
- 追求功能强大、标准兼容 → PostgreSQL
- 追求简单快速、生态完善 → MySQL
- 有 JSON、地理、分析需求 → PostgreSQL
- 简单 Web 应用、读多写少 → MySQL
:::
