---
title: 第一章 Hadoop 分布式大数据系统概述
description: 介绍分布式系统的基本概念，以及 Hadoop、HDFS、YARN、MapReduce、ZooKeeper、Hive 等核心组件在大数据平台中的定位。
categories:
  - Linux 分布式集群
outline: [2,3]
date: 2024-10-18
recommend: 1
tags:
  - 运维
  - 分布式
  - Linux
  - Hadoop
head:
  - - meta
    - name: keywords
      content: Linux企业级运维, 分布式, Linux, 架构, Hadoop, 大数据
cover: https://cdn.imufeng.cn/mblog/202411161444264.png
---

# 第一章 Hadoop 分布式大数据系统概述

## 一、什么是分布式系统

分布式系统是指将多个独立节点通过网络组织在一起，共同对外提供统一服务的一类系统架构。对于使用者而言，它像是一个整体；而在内部，数据存储、任务执行、状态同步和故障恢复则由多个节点协同完成。

分布式系统的核心价值主要体现在以下几个方面：

- **横向扩展：** 当单机性能不足时，可以通过增加节点扩容。
- **容错能力：** 单个节点故障后，系统仍可继续提供部分或全部能力。
- **资源共享：** 多台服务器可以共同承担存储与计算任务。
- **弹性调度：** 任务可以在不同节点之间重新分配，提高整体利用率。

与此同时，分布式系统也带来了网络延迟、数据一致性、节点选举、故障检测与恢复等复杂问题，因此往往需要一整套成熟的软件体系来支撑。

## 二、Hadoop 的定位

Apache Hadoop 是 Apache 软件基金会维护的开源大数据基础平台，最早面向海量数据的分布式存储与离线计算场景。经过多年发展，Hadoop 已不只是单一组件，而是逐渐形成了一个完整生态。

日常讨论中的 “Hadoop” 可能有两层含义：

1. 狭义上，指 Hadoop 的核心框架，即 `HDFS + YARN + MapReduce`。
2. 广义上，指围绕 Hadoop 发展起来的一整套大数据生态，包括 `ZooKeeper`、`Hive`、`HBase`、`Spark` 等工具。

## 三、Hadoop 核心组件

### 3.1 HDFS

`HDFS`（Hadoop Distributed File System）是 Hadoop 的分布式文件系统，负责海量数据的分布式存储。它会将文件切分为多个数据块，并分散保存到不同节点上，同时通过副本机制提升可用性和容错能力。

在典型架构中：

- `NameNode` 负责元数据管理，如目录结构、文件块映射、权限信息。
- `DataNode` 负责真实数据块的存储与读写。

### 3.2 YARN

`YARN`（Yet Another Resource Negotiator）是 Hadoop 的资源管理与任务调度平台，用来协调集群中的 CPU、内存等资源。

YARN 主要包含：

- `ResourceManager`：统一管理集群资源。
- `NodeManager`：负责单个节点上的资源汇报与任务执行。
- `ApplicationMaster`：负责具体应用的任务协调。

### 3.3 MapReduce

`MapReduce` 是 Hadoop 早期最重要的分布式计算模型。它将任务拆分为 `Map` 与 `Reduce` 两个阶段，使海量数据可以并行处理。虽然现在很多场景会用 Spark 或 Flink 替代 MapReduce，但它依然有助于理解 Hadoop 生态中“存储与计算分离”的基础思想。

## 四、常见配套组件

### 4.1 ZooKeeper

`ZooKeeper` 是分布式协调服务，主要用于配置管理、分布式锁、命名服务、Leader 选举等场景。在 Hadoop 生态中，许多组件会依赖 ZooKeeper 维持分布式状态一致性。

### 4.2 Hive

`Hive` 是基于 Hadoop 的数据仓库工具，为结构化数据提供类 SQL 查询能力。用户可以使用 `HiveQL` 编写分析语句，底层再由 Hadoop 生态组件负责实际执行。

### 4.3 其他常见组件

围绕 Hadoop 还发展出许多常见项目，例如：

- `HBase`：面向海量结构化数据的分布式列式数据库。
- `Spark`：通用分布式计算引擎，适合批处理、流处理和机器学习。
- `Sqoop`：用于传统数据库与 Hadoop 之间的数据导入导出。
- `Oozie`：工作流编排与任务调度工具。

## 五、为什么先学基础集群部署

在云平台与容器平台越来越成熟的今天，很多组件都可以直接通过镜像或托管服务一键部署。但手动搭建一套基础 Hadoop 集群仍然很有价值，因为它能够帮助我们理解：

- 各组件的职责划分。
- 配置文件之间的依赖关系。
- 节点通信与端口规划。
- 数据、计算与协调服务之间的协作方式。

本系列后续章节将从最基础的系统环境准备开始，逐步完成 Hadoop、ZooKeeper 和 Hive 的安装与配置。

## 参考内容

- [Apache Hadoop 官网](https://hadoop.apache.org/)
- [What is a distributed architecture? | Atlassian](https://www.atlassian.com/zh/microservices/microservices-architecture/distributed-architecture)
- [凤凰架构](https://icyfenix.cn/)
