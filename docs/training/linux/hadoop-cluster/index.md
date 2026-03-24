---
top: -2
title: 【大数据系列】Hadoop 分布式大数据集群部署
description: 使用三台 AlmaLinux 虚拟机演示 Hadoop 分布式大数据集群的基础环境准备、Hadoop、ZooKeeper 与 Hive 的部署流程。
sticky: 6
categories:
  - Linux 分布式集群
outline: [2,3]
date: 2024-10-15
recommend: 0
tags:
  - 运维
  - 分布式
  - Linux
  - Hadoop
head:
  - - meta
    - name: keywords
      content: Linux企业级运维, 分布式, Linux, 架构, Hadoop, 大数据, ZooKeeper, Hive
cover: https://cdn.imufeng.cn/mblog/202411161415899.jpg
---

# Hadoop 分布式大数据集群部署

本系列使用三台 `Vmware Workstation` 环境下的 `AlmaLinux` 虚拟机作为演示环境，按“环境准备 → Hadoop → ZooKeeper → Hive”的顺序，逐步搭建一套可用于学习和实验的 Hadoop 分布式集群。

## 系列说明

- 演示环境以教学和实验为主，采用单独的 `Master` 节点与两台 `Node` 节点。
- 文中配置偏向快速搭建，便于理解 Hadoop 生态中各组件之间的依赖关系。
- 生产环境应进一步补充独立账户、权限隔离、监控告警、高可用与备份策略。

## 目录

- [第一章 Hadoop 分布式大数据系统概述](./overview.md)
- [第二章 分布式环境准备](./preparations.md)
- [第三章 Hadoop 集群部署](./hadoop-install.md)
- [第四章 ZooKeeper 集群部署](./zookeeper-install.md)
- [第五章 Hive 数据仓库部署](./hive-install.md)

## 建议阅读顺序

首次搭建建议严格按照目录顺序操作，尤其是以下前置步骤不可跳过：

1. 完成三台节点的网络、主机名与 `hosts` 配置。
2. 完成 SSH 免密登录与 JDK 安装。
3. 先部署 Hadoop，再部署 ZooKeeper，最后部署 Hive。
