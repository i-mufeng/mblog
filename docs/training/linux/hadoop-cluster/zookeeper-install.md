---
title: 第四章 Zookeeper 集群部署
description: 本教程将代理从零部署 Zookeeper V3.9.5. 分布式协调服务，用于维护配置信息、命名、提供分布式同步以及提供组服务。
categories:
  - Linux 分布式集群
outline: [ 2,3 ]
date: 2026-03-13
recommend: 3
tags:
  - 运维
  - 分布式
  - Linux
  - Hadoop
head:
  - - meta
    - name: keywords
      content: Linux企业级运维, 分布式, Linux, Hive, 架构, Hadoop, 大数据
cover: https://cdn.imufeng.cn/mblog/202411161444264.png

---

#  第四章 Zookeeper 集群部署

 Zookeeper 是Apache基金会在的一个分布式协调服务，为分布式应用提供一致性、可靠性和高性能的协调基础设施。它由 Apache 软件基金会维护，最初是 Hadoop 项目的子组件，现已成为独立的顶级项目，被广泛应用于大数据、微服务和云原生架构中。

## 4.1 简介

ZooKeeper 解决分布式系统中的**协同问题**。在分布式环境下，多个节点需要达成共识、共享状态、选举主节点或管理配置，而网络分区、节点故障等因素使得这些操作变得复杂。ZooKeeper 通过提供简单的原语和可靠的保证，让开发者无需从零实现复杂的分布式协议。

ZooKeeper 维护一个类文件系统的层次命名空间，每个节点称为 Znode。Znode 可以存储少量数据（通常不超过 1MB），并分为持久节点、临时节点和顺序节点三种类型。临时节点的生命周期与客户端会话绑定，会话结束自动删除，这一特性常用于服务发现。客户端可以在 Znode 上设置监听，当节点数据变更或子节点变化时，ZooKeeper 主动通知客户端。这种推送模式避免了轮询开销，实现实时状态同步。

ZooKeeper 采用**主从复制架构**，通过选举产生 `Leader`，其余节点为 `Follower`，`Leader` 处理所有写请求，协调数据广播，是集群的核心。 `Follower` 处理读请求，参与 Leader 选举，接收并同步 Leader 的数据。

集群通过 **ZAB 协议（ZooKeeper Atomic Broadcast）** 保证数据一致性。写操作必须由 Leader 处理，以两阶段提交方式广播到多数节点（过半写入）才确认成功，牺牲一定可用性换取强一致性（CP 系统）。

## 4.2 下载

可以在 [Apache ZooKeeper](https://zookeeper.apache.org/releases.html) 查看 Zookeeper 的 Releases，选择合适的版本进行下载，这里下载 Apache ZooKeeper 3.9.5-bin。

```bash
wget https://www.apache.org/dyn/closer.lua/zookeeper/zookeeper-3.9.5/apache-zookeeper-3.9.5-bin.tar.gz
tar -zxf apache-zookeeper-3.9.5-bin.tar.gz -C /usr/local/
cd /usr/local
mv apache-zookeeper-3.9.5-bin/ zookeeper
```

Zookeeper 的路径如下：

```
bin/  conf/  docs/  lib/  LICENSE.txt  NOTICE.txt  README.md  README_packaging.md
```

## 4.3 配置

Zookeeper 的配置文件位于 `conf/zoo.cfg`，有一个示例：`zoo_sample.cfg`可以参考。

这里配置如下：

```
initLimit=10
syncLimit=5
dataDir=/data/zookeeper/
clienrPort=2181
server.1=master.local:2888:3888
server.2=node01.local:2888:3888
server.3=node02.local:2888:3888
```

服务器ID配置：

因为 Zookeeper 需要通过 data 路径下的 `myid` 文件识别当前服务，所以我们需要创建 myid 文件：

```bash
mkdir -p /data/zookeeper

# master.local
echo "1" > /data/zookeeper/myid

# node01.local  
echo "2" > /data/zookeeper/myid

# node02.local
echo "3" > /data/zookeeper/myid
```

环境变量：

```ini
# ~/.config/fish/config.fish

fish_add_path /usr/local/zookeeper/bin
```



## 4.4 ·同步到其他节点

这里同步方式还是使用 `ms` 脚本，详见：[分布式集群文件批量同步工具](../muffin-tools/muffin-sync.md)

执行拷贝命令：

```text
ms /usr/local/zookeeper/

🚀 多节点同步启动
   📁 源路径: /usr/local/zookeeper
   🎯 远程路径: /usr/local/zookeeper
   🖥️  目标节点: 2 个

🔄 同步到 node01.local                   ... ✅ 完成
🔄 同步到 node02.local                   ... ✅ 完成

📊 同步完成: ✅ 2  ❌ 0  ⏭️ 1(本地)
```

结果如下：

![image-20260313095217372](https://cdn.imufeng.cn/mblog/image-20260313095217372.png)

## 4.5 启动集群

集群通过  `zkServer.sh`  命令管理，为了便于补全，建议删除 `bin` 路径下的所有 `.cmd` 文件。

`zkServer.sh`  常用的的命令比较简单：start | start-foreground | stop | version | restart | status

这里同时启动三台并查看启动结果，可以看到第三台被选为了 `leader`。

![image-20260313100930627](https://cdn.imufeng.cn/mblog/image-20260313100930627.png)