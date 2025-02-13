---
title: Linux 网络传输工具：curl VS wget
description: 在Linux命令行下载文件时，curl和wget是两个常用的工具。尽管它们在某些功能上相似，但它们在设计和使用场景上有所不同。
categories: 
   - 工具分享
tags: 
   - Linux
   - 运维
outline: [2,3]
date: 2025-02-13 17:30:00
head:
  - - meta
    - name: keywords
      content: Linux, 运维, curl, wget, 网络传输, 网络工具
---

# Linux 网络传输工具：curl VS wget

在Linux系统下载文件过程中，经常会用到 `wget` 和 `curl`，一般都是想起哪个用哪个。经过尝试，总感觉 curl 的功能要更加强大一些。通常，通过链接下载一个文件，以下两个命令都适用：

```bash
wget http://example.com/file.f
curl -O http://example.com/file.f
```

但是我的使用习惯中，wget 通常下载一些简单的文件，而 curl 则经常被用来判断网页是否可以访问。因为 wget 请求网页需要下载到本地再打开。

事实上，他们都是功能强大的网络数据传输工具，虽然在某些功能上有所重叠，但是其设计理念、 功能特点以及适用场景存在显著差异。本文将详细解析这两个工具的命令用法，探讨它们的共同点以及各自的特点。

## 一、wget 简介

`wget` 通常用来从网络上下载静态资源，支持 http、https、ftp 协议，是比较常用的文件下载工具。

`wget` 最简单的用法就是从指定的 URL 下载静态资源，例如，以下命令即可下载本站 LOGO 图片，并默认保存在当前目录，文件名与 URL 中文件名同名：

```bash
wget https://www.imufeng.cn/logo.svg
```

> [!important]
>
> 如果请求路径中存在参数，保存到本地的文件名也会将参数保留，可能会导致文件无法访问。比如这样：
>
> ```
> [root@imufeng.cn ~]# wget www.imufeng.cn/logo.svg?param=123
> ...
> [root@imufeng.cn ~]# ls
> 'logo.svg?param=123'
> ```

上边这种情况就需要在保存的时候修改名称了，以下列出 wget 常用的一些参数：

| 参数                          | 说明                                 |
| ----------------------------- | ------------------------------------ |
| `-O`  或 `--output-document`  | 指定保存路径及文件名                 |
| `-P` 或 `--directory-prefix ` | 指定保存路径，文件名不变             |
| `-r` 或 `--recursive`         | 启用递归下载，可以下载整个网站内容   |
| `-l` 或 `--level`             | 限制递归下载深度                     |
| `--exclude-directories`       | 指定递归下载时需要排除的目录         |
| `-c` 或 `--continue`          | 启用断点续传                         |
| `-b` 或 `--background`        | 后台下载                             |
| `--limit-rate`                | 限制下载速度，如 `--limit-rate=100k` |
| `--timeout`                   | 设置连接超时时间                     |
| `--wait`                      | 设置多个请求之间的等待时间           |
| `--header`                    | 设置请求头                           |
| `-S` 或 `--server-response`   | 显示服务器响应头信息                 |

## 二、curl 简介

curl 是一个极为强大的多功能网络传输工具，支持多种网络协议，包括 HTTP、HTTPS、FTP、SFTP、SMTP、POP3、IMAP 等，这使得   curl   不仅可以用于下载文件，还可以用于发送电子邮件、处理邮件协议、与 Web API 进行交互等复杂任务。下载文件只是其最基础的用法。

curl 支持多种请求方式，如 GET、POST、PUT、DELETE 等。用户可以通过指定不同的请求方法和参数，向服务器发送复杂的请求。例如，使用   curl -X POST   可以发送 POST 请求，而   curl -X PUT   则用于发送 PUT 请求。这种灵活性使得   curl   在开发和测试 Web 应用程序时非常有用。

比如，我们可以通过以下方法向指定 URL 发送 PUT 或 DELETE 请求：

```bash
curl -X PUT -d "id=1&name=mufeng" https://mufeng.dev/user/update
curl -X DELETE https://mufeng.dev/user/delete/1
```

### 基础用法

1. 发送 GET 请求

   ```bash
   curl http://example.com
   ```

   从   `http://example.com`   获取数据并输出到**标准输出**。

2. 保存相应内容

   ```bash
   curl -o output.txt http://example.com
   ```

   `-o output.txt` ：将响应内容保存到 `output.txt` 文件中。

3. 显示响应头信息

   ```bash
   curl -i http://example.com
   ```

   `-i` ：显示响应头信息和响应体。或者将响应头信息保存到文件中：

   ```bash
   curl -D headers.txt http://example.com
   ```

   `-D headers.txt`：将响应头信息保存到 `headers.txt` 文件中。

4. 发送带请求体的请求

   ```bash
   curl -X POST -d "param1=value1&param2=value2" http://example.com/form
   curl -X POST -H "Content-Type: application/json" -d '{"name":"John","age":20}' http://example.com/api
   ```

   `-X POST`：指定请求方法为 POST。

   ` -H "Content-Type: application/json"`：设置请求头，指定内容类型为 JSON。

   `-d`  ：指定要发送的数据。

5. 认证鉴权

   ```bash
   curl -u username:password http://example.com
   ```

6. 处理 Cookie

   ```bash
   curl -c cookies.txt http://example.com
   curl -b cookies.txt http://example.com
   ```

   `-c cookies.txt`：将服务器返回的 Cookie 保存到 `cookies.txt` 文件中。

   `-b cookies.txt`：从 `cookies.txt`  文件中读取 Cookie 并发送给服务器。

7. 设置连接超时时间

   ```bash
   curl --connect-timeout 30 --max-time 60 http://example.com
   ```

   `--connect-timeout 30`：设置连接超时时间为 30 秒。

   `--max-time 60`：设置最大超时时间为 60 秒。

8. 使用代理服务器

   ```bash
   curl -x http://proxy.example.com:8080 http://example.com
   ```

9. 限制下载速度

   ```bash
   curl --limit-rate 100k http://example.com/file.zip
   ```

10. 详细模式

    ```bash
    curl -v http://example.com
    ```

    详细模式可以查看请求和响应的头信息。

11. 并发模式

    ```bash
    curl -Z - http://example.com/resource1 http://example.com/resource2
    ```



## 三、区别

虽然我们经常使用 `curl` 和 `wget` 命令从网站上下载资源，这也只是他们功能重叠的一部分，他们的设计理念、功能特点及适用场景存在显著差异。

`curl` 更加专注于网络传输，通常使用其进行 API 接口的调用测试，它能够支持各种复杂的请求，例如发送 JSON 数据或处理表单数据。它还支持多种认证方式，能够处理 cookie 信息，从而模拟浏览器的行为。这些特性使得他成为开发人员和系统管理员在进行网络交互、测试 Web API、处理认证和并发请求时的首选工具。

相比之下，`wget` 更加注重文件下载，它的核心功能就是通过 HTTP、FTP 等协议下载静态资源，支持断点续传、支持递归下载、后台下载等。对于网站的备份、批量下载等十分有用。尽管它对于 WEB 请求的支持有限，但是已经可以满足绝大多数的文件下载需求。

综上，`curl` 更加偏向于 WEB API 交互、发送多种类型的请求以及处理认证等，而 `wget` 更适合下载文件，简单易用且高效。总之，`curl` 和 `wget` 各有优势，它们在 Linux 系统中都扮演着重要的角色。通过合理选择和使用这两个工具，用户可以更高效地完成各种网络任务。了解它们的特点和功能，能够帮助用户根据具体需求选择最合适的工具，从而提高工作效率和任务完成的质量。