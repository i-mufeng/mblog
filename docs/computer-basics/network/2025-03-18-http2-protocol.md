---
title: HTTP/2 协议详解
description: 深入理解 HTTP/2 协议的核心特性、工作原理与性能优势
categories:
  - 技术笔记分享
tags:
  - HTTP
  - 网络协议
  - 性能优化
  - 计算机网络
outline: [2,3]
date: 2025-03-18
---

# HTTP/2 协议详解

> HTTP/2 是 HTTP 协议的重大升级，通过多路复用、头部压缩、服务器推送等特性，显著提升了 Web 性能。

<!-- more -->

## 一、HTTP/1.1 的性能瓶颈

### 1.1 队头阻塞（Head-of-Line Blocking）

```
客户端                    服务器
  |---- 请求1 ----->|      |
  |                 |---- 响应1 ----->|  ← 必须等待响应1完成
  |---- 请求2 ----->|                 |
  |                 |---- 响应2 ----->|  ← 请求2必须排队
```

HTTP/1.1 虽然支持持久连接（Keep-Alive），但同一连接上的请求必须串行处理。

### 1.2 连接数限制

浏览器对同一域名的并发连接数有限制（通常 6-8 个），导致资源加载受限。

### 1.3 头部冗余

每次请求都会携带大量重复的头部信息（Cookie、User-Agent 等），造成带宽浪费。

### 1.4 资源合并优化的弊端

为减少请求数，开发者将多个小文件合并成大文件、使用雪碧图等，但这种方式：
- 增加了缓存失效的粒度
- 增加了代码复杂度
- 无法充分利用并行加载

## 二、HTTP/2 的核心特性

### 2.1 特性概览

| 特性 | 说明 |
|------|------|
| 二进制分帧 | 将数据分为更小的帧进行传输 |
| 多路复用 | 同一连接上并行处理多个请求 |
| 头部压缩 | 使用 HPACK 算法压缩头部 |
| 服务器推送 | 服务器主动推送资源 |
| 流量控制 | 基于窗口的流量控制机制 |
| 请求优先级 | 可以设置请求的优先级 |

### 2.2 与 HTTP/1.1 的对比

```
HTTP/1.1:
客户端 -> [请求1] -> [等待] -> [请求2] -> [等待] -> [请求3]
         ──────────────────────────────────────────────────> 时间

HTTP/2:
客户端 -> [帧1][帧2][帧3][帧1][帧2][帧3][帧1][帧2][帧3]
         ──────────────────────────────────────────────────> 时间
         ↑ 三个请求的帧交错传输，无需等待
```

## 三、二进制帧格式详解

### 3.1 帧结构

```
+-----------------------------------------------+
|                 Length (24)                    |
+---------------+---------------+---------------+
|   Type (8)    |   Flags (8)   |
+-+-------------+---------------+---------------+
|R|                 Stream Identifier (31)       |
+=+=============================================+
|                   Frame Payload (0...)        |
+-----------------------------------------------+
```

| 字段 | 长度 | 说明 |
|------|------|------|
| Length | 24 位 | 帧负载长度（最大 16MB） |
| Type | 8 位 | 帧类型 |
| Flags | 8 位 | 标志位 |
| R | 1 位 | 保留位 |
| Stream Identifier | 31 位 | 流标识符 |

### 3.2 帧类型

| 类型 | 值 | 说明 |
|------|-----|------|
| DATA | 0x0 | 传输数据 |
| HEADERS | 0x1 | 头部帧 |
| PRIORITY | 0x2 | 优先级设置 |
| RST_STREAM | 0x3 | 终止流 |
| SETTINGS | 0x4 | 设置参数 |
| PUSH_PROMISE | 0x5 | 推送承诺 |
| PING | 0x6 | 心跳检测 |
| GOAWAY | 0x7 | 关闭连接 |
| WINDOW_UPDATE | 0x8 | 流量控制 |
| CONTINUATION | 0x9 | 头部延续 |

### 3.3 流（Stream）、消息（Message）、帧（Frame）的关系

```
Stream 1 (请求/响应对)
├── HEADERS 帧 (请求头)
├── DATA 帧 (请求体)
├── HEADERS 帧 (响应头)
└── DATA 帧 (响应体)

Stream 2 (另一个请求/响应对)
├── HEADERS 帧
└── DATA 帧
```

## 四、多路复用工作原理

### 4.1 连接与流

```
一个 TCP 连接
└── 多个 Stream (流)
    └── 多个 Message (消息)
        └── 多个 Frame (帧)
```

### 4.2 并行传输

```
客户端                               服务器
  |                                    |
  |-- HEADERS (Stream 1) ------------->|
  |-- HEADERS (Stream 3) ------------->|  ← 无需等待 Stream 1
  |-- DATA (Stream 1) ---------------->|
  |-- HEADERS (Stream 5) ------------->|  ← 无需等待
  |<---------- HEADERS (Stream 1) -----|
  |-- DATA (Stream 3) ---------------->|
  |<---------- DATA (Stream 1) --------|
  |<---------- HEADERS (Stream 3) -----|
```

### 4.3 解决队头阻塞

- **应用层**：多个请求可以同时传输，互不阻塞
- **传输层**：仍使用 TCP，TCP 层的队头阻塞仍存在

:::warning TCP 层队头阻塞
HTTP/2 解决了 HTTP 层的队头阻塞，但 TCP 层的队头阻塞仍然存在。当一个 TCP 包丢失时，所有流都会被阻塞。HTTP/3 使用 QUIC 协议解决了这个问题。
:::

## 五、HPACK 头部压缩算法

### 5.1 为什么需要头部压缩

HTTP/1.1 的头部以纯文本传输，存在大量冗余：

```
GET /index.html HTTP/1.1
Host: example.com
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)
Accept: text/html,application/xhtml+xml
Accept-Language: zh-CN,zh;q=0.9,en;q=0.8
Accept-Encoding: gzip, deflate, br
Cookie: session=abc123; theme=dark
... (每次请求都重复)
```

### 5.2 HPACK 算法原理

HPACK 使用三种方式压缩头部：

**1. 静态表（Static Table）**

预定义了 61 个常见的头部键值对：

| 索引 | 头部名称 | 头部值 |
|------|----------|--------|
| 1 | :authority | |
| 2 | :method | GET |
| 3 | :method | POST |
| 4 | :path | / |
| ... | ... | ... |

**2. 动态表（Dynamic Table）**

在连接生命周期内动态添加的头部键值对：

```
首次传输:
  Content-Type: application/json  →  编码为字节序列

后续传输:
  Content-Type: application/json  →  引用动态表索引 (更短)
```

**3. 霍夫曼编码（Huffman Coding）**

对头部值进行霍夫曼编码，进一步压缩体积。

### 5.3 压缩效果

| 场景 | 压缩前 | 压缩后 | 压缩率 |
|------|--------|--------|--------|
| 首次请求 | ~800B | ~200B | 75% |
| 后续请求 | ~800B | ~50B | 94% |

## 六、服务器推送（Server Push）

### 6.1 工作原理

```
客户端                     服务器
  |                          |
  |-- GET /index.html ------>|
  |                          |  ← 服务器知道需要 style.css
  |<-- PUSH_PROMISE ---------|  ← 预告要推送 style.css
  |<-- HEADERS (index.html) -|
  |<-- DATA (index.html) ----|
  |<-- HEADERS (style.css) --|  ← 推送的资源
  |<-- DATA (style.css) -----|
```

### 6.2 服务器推送配置

**Nginx 配置：**

```nginx
location /index.html {
    http2_push /style.css;
    http2_push /app.js;
}
```

**Node.js (Express)：**

```javascript
app.get('/index.html', (req, res) => {
    const stream = res.push('/style.css', {
        'content-type': 'text/css'
    });
    stream.end(cssContent);
    res.end(htmlContent);
});
```

### 6.3 推送的限制

:::warning 服务器推送的注意事项
- 推送的资源必须是同源的
- 客户端可以拒绝推送（发送 RST_STREAM）
- 不能推送 HTML 页面
- 过度推送会浪费带宽
- 实际使用中效果不如预期，Chrome 已计划移除支持
:::

## 七、HTTP/2 与 HTTPS 的关系

### 7.1 浏览器要求

| 浏览器 | HTTP/2 要求 |
|--------|-------------|
| Chrome | 必须 HTTPS |
| Firefox | 必须 HTTPS |
| Safari | 必须 HTTPS |
| Edge | 必须 HTTPS |

虽然 HTTP/2 规范不强制要求 TLS，但所有主流浏览器都要求 HTTP/2 必须使用 HTTPS。

### 7.2 TLS 版本要求

- HTTP/2 通常使用 TLS 1.2+
- TLS 1.3 提供更快的握手（1-RTT，甚至 0-RTT）

### 7.3 ALPN 协商

```
客户端                               服务器
  |                                    |
  |-- ClientHello -------------------->|  ← 包含 h2 协议标识
  |<-- ServerHello --------------------|  ← 选择 h2 协议
  |                                    |
  |       使用 HTTP/2 通信              |
```

## 八、浏览器与服务器支持情况

### 8.1 浏览器支持

| 浏览器 | 支持版本 | 市场份额 |
|--------|----------|----------|
| Chrome | 41+ | ~65% |
| Firefox | 36+ | ~15% |
| Safari | 9+ | ~10% |
| Edge | 12+ | ~5% |
| IE | 不支持 | <1% |

**全球支持率：约 97%**

### 8.2 服务器支持

| 服务器 | 支持版本 | 配置方式 |
|--------|----------|----------|
| Nginx | 1.9.5+ | `listen 443 ssl http2;` |
| Apache | 2.4.17+ | `Protocols h2 http/1.1` |
| IIS | 10+ | 默认支持 |
| Node.js | 内置 | `http2.createSecureServer()` |

### 8.3 Nginx 配置示例

```nginx
server {
    listen 443 ssl http2;
    server_name example.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # TLS 1.2+ 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
    
    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    
    location / {
        root /var/www/html;
    }
}
```

## 九、实际性能对比测试

### 9.1 测试环境

- 服务器：Nginx 1.24，2 核 4G
- 网络：100Mbps，延迟 50ms
- 测试页面：30 个资源文件（HTML、CSS、JS、图片）

### 9.2 测试结果

| 指标 | HTTP/1.1 | HTTP/2 | 提升 |
|------|----------|--------|------|
| 页面加载时间 | 3.2s | 1.8s | 44% |
| 请求数 | 30 | 30 | - |
| 连接数 | 6 | 1 | 83% |
| 总传输大小 | 1.2MB | 1.1MB | 8% |
| 首次渲染时间 | 1.5s | 0.8s | 47% |

### 9.3 性能提升明显的场景

| 场景 | 提升幅度 |
|------|----------|
| 多资源加载 | 30-50% |
| 高延迟网络 | 40-60% |
| 小文件多请求 | 50-70% |
| 大文件单请求 | 5-10% |

## 十、HTTP/2 的局限性

### 10.1 TCP 层队头阻塞

HTTP/2 在应用层解决了队头阻塞，但 TCP 层仍然存在：

```
数据包 1: [Frame1][Frame2][Frame3]
数据包 2: [Frame4][Frame5][Frame6]  ← 丢失

虽然 Frame4-6 与 Frame1-3 属于不同流，
但 TCP 要求按序交付，Frame4-6 丢失会阻塞后续所有数据
```

### 10.2 服务器推送效果不如预期

- 难以准确预测客户端需要的资源
- 推送的资源可能已在缓存中
- Chrome 已计划移除 HTTP/2 Server Push 支持

### 10.3 连接迁移问题

TCP 连接基于四元组（源IP、源端口、目标IP、目标端口），网络切换时连接会断开。

:::tip HTTP/3 的解决方案
HTTP/3 使用 QUIC 协议（基于 UDP），解决了：
- TCP 层队头阻塞
- 连接迁移问题
- 更快的握手（0-RTT）
:::

## 十一、总结

| 特性 | HTTP/1.1 | HTTP/2 | HTTP/3 |
|------|----------|--------|--------|
| 传输协议 | TCP | TCP | QUIC (UDP) |
| 头部压缩 | 无 | HPACK | QPACK |
| 多路复用 | 无 | 有 | 有 |
| 队头阻塞 | 有 | TCP层有 | 无 |
| 服务器推送 | 有（有限） | 有 | 有 |
| 连接迁移 | 不支持 | 不支持 | 支持 |

:::tip 要点总结
1. HTTP/2 通过多路复用解决了 HTTP 层队头阻塞
2. HPACK 头部压缩显著减少了传输开销
3. 二进制分帧让数据传输更高效
4. 服务器推送效果有限，实际使用较少
5. HTTP/2 必须配合 HTTPS 使用（浏览器要求）
6. HTTP/3 使用 QUIC 解决了 TCP 层队头阻塞
:::
