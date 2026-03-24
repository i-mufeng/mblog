---
title: 第四章 ZooKeeper 集群部署
description: 介绍三节点环境下 ZooKeeper 的安装、配置、数据目录规划、节点编号设置以及集群启动验证流程。
categories:
  - Linux 分布式集群
outline: [2,3]
date: 2026-03-13
recommend: 4
tags:
  - 运维
  - 分布式
  - Linux
  - Hadoop
  - ZooKeeper
head:
  - - meta
    - name: keywords
      content: Linux企业级运维, 分布式, Linux, ZooKeeper, 架构, Hadoop, 大数据
cover: https://cdn.imufeng.cn/mblog/202411161444264.png
---

# 第四章 ZooKeeper 集群部署

ZooKeeper 是 Apache 基金会维护的分布式协调服务，常用于配置管理、命名服务、分布式锁和 Leader 选举。在 Hadoop 生态中，它是很多组件实现协调与一致性的重要基础设施。

## 一、ZooKeeper 简介

ZooKeeper 通过一套轻量但可靠的协调机制，帮助分布式系统解决以下问题：

- 节点状态感知
- 配置集中管理
- 分布式锁
- 服务注册与发现
- Leader 选举

ZooKeeper 内部维护了一棵类似文件系统的树形结构，每个节点称为 `ZNode`。它支持持久节点、临时节点和顺序节点，并通过 Watch 机制实现事件通知。

## 二、下载安装 ZooKeeper

可前往官方发布页选择版本。这里以 `ZooKeeper 3.9.5` 为例：

```bash
cd /opt/
wget https://www.apache.org/dyn/closer.lua/zookeeper/zookeeper-3.9.5/apache-zookeeper-3.9.5-bin.tar.gz
tar -zxf apache-zookeeper-3.9.5-bin.tar.gz -C /usr/local/
cd /usr/local/
mv apache-zookeeper-3.9.5-bin zookeeper
```

安装完成后目录大致如下：

```text
bin/
conf/
docs/
lib/
LICENSE.txt
NOTICE.txt
README.md
README_packaging.md
```

## 三、配置 ZooKeeper

ZooKeeper 的核心配置文件为 `conf/zoo.cfg`。可以从示例文件复制：

```bash
cd /usr/local/zookeeper/conf/
cp zoo_sample.cfg zoo.cfg
```

编辑后的 `zoo.cfg` 可参考如下内容：

```ini
tickTime=2000
initLimit=10
syncLimit=5
dataDir=/data/zookeeper
clientPort=2181
server.1=master.local:2888:3888
server.2=node01.local:2888:3888
server.3=node02.local:2888:3888
```

参数说明：

- `tickTime`：基础时间单元。
- `initLimit`：Follower 与 Leader 初始连接允许的最大心跳数。
- `syncLimit`：Follower 与 Leader 请求/应答允许的最大心跳数。
- `dataDir`：ZooKeeper 数据目录。
- `clientPort`：客户端连接端口，默认 `2181`。
- `server.x`：集群节点定义，格式为 `主机名:同步端口:选举端口`。

## 四、配置节点编号 `myid`

每个 ZooKeeper 节点都需要在 `dataDir` 目录下写入一个 `myid` 文件，用于标识自己的服务器编号。

先创建数据目录：

```bash
mkdir -p /data/zookeeper
```

然后分别在三台机器写入：

```bash
# master.local
echo "1" > /data/zookeeper/myid

# node01.local
echo "2" > /data/zookeeper/myid

# node02.local
echo "3" > /data/zookeeper/myid
```

这里的数字必须与 `zoo.cfg` 中 `server.x` 的编号一一对应。

## 五、配置环境变量

为了方便执行命令，可以将 ZooKeeper 的 `bin` 目录加入环境变量。

如果使用 `bash`：

```bash
export ZOOKEEPER_HOME=/usr/local/zookeeper
export PATH=$PATH:$ZOOKEEPER_HOME/bin
```

如果使用 `fish`：

```fish
fish_add_path /usr/local/zookeeper/bin
```

配置完成后重新加载 shell。

## 六、同步到其他节点

建议先在 Master 节点完成安装和配置，再统一同步至其他节点。

例如使用 `ms` 脚本：

```bash
ms /usr/local/zookeeper/
```

同步后记得分别检查：

- `/usr/local/zookeeper/conf/zoo.cfg` 是否一致。
- `/data/zookeeper/myid` 是否为当前节点自己的编号。

注意：`myid` 文件不能直接整目录覆盖，否则三个节点可能拿到相同编号。

## 七、启动集群

ZooKeeper 通过 `zkServer.sh` 管理服务。

### 7.1 启动

分别在三台服务器执行：

```bash
zkServer.sh start
```

### 7.2 查看状态

```bash
zkServer.sh status
```

在三节点集群中，正常情况下会选举出：

- 1 个 `leader`
- 2 个 `follower`

### 7.3 停止与重启

```bash
zkServer.sh stop
zkServer.sh restart
```

## 八、验证集群是否正常

可以在任意节点执行：

```bash
zkServer.sh status
```

也可以通过客户端连接：

```bash
zkCli.sh -server master.local:2181
```

连接成功后，可简单执行：

```text
ls /
```

如果能正常返回根节点列表，说明 ZooKeeper 服务基本正常。

## 九、本章小结

完成本章后，你应当已经得到一套三节点的 ZooKeeper 集群。后续部署 Hive 等组件时，就可以把 ZooKeeper 作为重要的协调基础设施接入。

## 参考内容

- [Apache ZooKeeper](https://zookeeper.apache.org/)
- [Apache ZooKeeper Releases](https://zookeeper.apache.org/releases.html)
- [ZooKeeper Administrator's Guide](https://zookeeper.apache.org/doc/current/zookeeperAdmin.html)
