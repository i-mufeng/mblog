---
title: MySQL 索引优化实战指南
description: 深入理解 MySQL 索引原理，掌握索引优化技巧，提升数据库查询性能
categories:
  - 技术笔记分享
tags:
  - Mysql
  - 索引
  - 性能优化
  - 数据库
outline: [2,3]
date: 2025-02-15
---

# MySQL 索引优化实战指南

> 索引是 MySQL 性能优化的核心手段，合理的索引设计可以让查询性能提升几个数量级。

<!-- more -->

## 一、索引基础概念

### 1.1 什么是索引

索引是一种帮助 MySQL 高效获取数据的数据结构，类似于书籍的目录。没有索引时，MySQL 需要全表扫描来查找数据；有了索引，可以快速定位到目标数据的位置。

### 1.2 B+ 树结构

MySQL InnoDB 存储引擎使用 B+ 树作为索引的数据结构：

```
         [10 | 20 | 30]           ← 非叶子节点（只存索引）
        /    |     |    \
   [1,5] [10,15] [20,25] [30,35]  ← 叶子节点（存数据，且有序链表）
```

**B+ 树的特点：**

| 特性 | 说明 |
|------|------|
| 多路平衡 | 每个节点可以有多个子节点 |
| 叶子节点链表 | 所有叶子节点通过链表连接，支持范围查询 |
| 非叶子节点只存索引 | 单个节点能存更多索引项，树更矮 |
| 查询稳定 | 所有查询都走到叶子节点，性能稳定 |

## 二、索引类型

### 2.1 主键索引（Primary Key）

```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50),
    email VARCHAR(100)
);
```

主键索引也叫聚簇索引，叶子节点存储的是完整的行数据。

### 2.2 唯一索引（Unique）

```sql
CREATE UNIQUE INDEX idx_email ON users(email);
-- 或在建表时
ALTER TABLE users ADD UNIQUE INDEX idx_email (email);
```

### 2.3 普通索引（Index）

```sql
CREATE INDEX idx_name ON users(name);
```

### 2.4 联合索引（Composite Index）

```sql
CREATE INDEX idx_name_age ON users(name, age);
```

:::tip 联合索引的最左前缀原则
联合索引 `(a, b, c)` 可以被以下查询使用：
- `WHERE a = 1`
- `WHERE a = 1 AND b = 2`
- `WHERE a = 1 AND b = 2 AND c = 3`

以下查询**无法**使用该索引：
- `WHERE b = 2`
- `WHERE c = 3`
- `WHERE b = 2 AND c = 3`
:::

## 三、索引失效的常见场景

### 3.1 使用函数或表达式

```sql
-- ❌ 索引失效
SELECT * FROM users WHERE YEAR(create_time) = 2025;

-- ✅ 优化后
SELECT * FROM users WHERE create_time >= '2025-01-01' AND create_time < '2026-01-01';
```

### 3.2 隐式类型转换

```sql
-- phone 是 VARCHAR 类型
-- ❌ 索引失效（数字与字符串比较）
SELECT * FROM users WHERE phone = 13800138000;

-- ✅ 正确写法
SELECT * FROM users WHERE phone = '13800138000';
```

### 3.3 LIKE 左模糊查询

```sql
-- ❌ 索引失效
SELECT * FROM users WHERE name LIKE '%风';

-- ✅ 右模糊可以使用索引
SELECT * FROM users WHERE name LIKE '沐%';
```

### 3.4 OR 条件

```sql
-- ❌ 如果 OR 连接的字段没有都建索引，会导致索引失效
SELECT * FROM users WHERE name = '沐风' OR age = 25;

-- ✅ 确保 OR 两边的字段都有索引
```

### 3.5 不满足最左前缀原则

```sql
-- 联合索引 (name, age, email)
-- ❌ 跳过了 name
SELECT * FROM users WHERE age = 25 AND email = 'test@example.com';
```

## 四、EXPLAIN 执行计划分析

使用 `EXPLAIN` 查看 SQL 的执行计划：

```sql
EXPLAIN SELECT * FROM users WHERE name = '沐风';
```

**关键字段说明：**

| 字段 | 说明 | 关注点 |
|------|------|--------|
| type | 访问类型 | system > const > eq_ref > ref > range > index > ALL |
| key | 实际使用的索引 | NULL 表示没用索引 |
| rows | 预估扫描行数 | 越小越好 |
| Extra | 额外信息 | Using index 最好，Using filesort 需优化 |

:::warning type 为 ALL 时要警惕
如果 EXPLAIN 结果中 type 为 ALL，说明进行了全表扫描，通常需要添加合适的索引。
:::

### 4.1 常见 Extra 值

- **Using index**：覆盖索引，查询的列都在索引中，无需回表
- **Using where**：在存储引擎层过滤后，还需在 Server 层过滤
- **Using temporary**：使用了临时表，通常需要优化
- **Using filesort**：使用了文件排序，通常需要优化

## 五、索引优化最佳实践

### 5.1 覆盖索引

```sql
-- 联合索引 (name, age)
-- 查询的列都在索引中，无需回表
SELECT name, age FROM users WHERE name = '沐风';
```

### 5.2 索引下推（ICP）

MySQL 5.6 引入的索引下推优化，可以在索引层直接过滤数据：

```sql
-- 联合索引 (name, age)
SELECT * FROM users WHERE name LIKE '沐%' AND age = 25;
-- 在索引层直接过滤 age，减少回表次数
```

### 5.3 前缀索引

对于长字符串字段，可以使用前缀索引节省空间：

```sql
-- 只索引前 10 个字符
CREATE INDEX idx_email_prefix ON users(email(10));
```

### 5.4 索引选择性

选择性 = 不重复的索引值 / 数据表的记录总数

选择性越高，索引的查询效率越高。选择性为 1 的索引（如主键）效率最高。

## 六、实际案例分析

### 6.1 慢查询优化

```sql
-- 原始 SQL，执行时间 2.5s
SELECT * FROM orders 
WHERE user_id = 1001 
AND status = 1 
ORDER BY create_time DESC 
LIMIT 20;

-- 添加联合索引
ALTER TABLE orders ADD INDEX idx_user_status_time (user_id, status, create_time);

-- 优化后执行时间 < 10ms
```

### 6.2 分页查询优化

```sql
-- ❌ 深分页性能差
SELECT * FROM articles ORDER BY id DESC LIMIT 1000000, 10;

-- ✅ 使用延迟关联
SELECT a.* FROM articles a
INNER JOIN (
    SELECT id FROM articles ORDER BY id DESC LIMIT 1000000, 10
) b ON a.id = b.id;
```

### 6.3 COUNT 优化

```sql
-- COUNT(*) vs COUNT(1) vs COUNT(id)
-- InnoDB 下三者性能基本一致，推荐使用 COUNT(*)

-- 如果需要精确计数且数据量大，考虑使用缓存
-- 如果可以接受近似值
SELECT TABLE_ROWS FROM information_schema.TABLES 
WHERE TABLE_NAME = 'users';
```

## 七、总结

| 场景 | 建议 |
|------|------|
| 高选择性字段 | 适合建索引 |
| 频繁查询的字段 | 适合建索引 |
| 频繁更新的字段 | 谨慎建索引 |
| 数据量小的表 | 不需要索引 |
| 联合查询 | 使用联合索引，注意最左前缀 |

:::tip 索引优化口诀
- 查询频繁建索引
- 联合索引左优先
- 覆盖索引少回表
- 索引失效要注意
- EXPLAIN 分析执行计划
:::

## 参考资料

- [MySQL 官方文档 - Optimization](https://dev.mysql.com/doc/refman/8.0/en/optimization.html)
- [MySQL 索引详解 - 菜鸟教程](https://www.runoob.com/mysql/mysql-index.html)
