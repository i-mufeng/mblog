---
top: 3
title: Linux 分布式大数据及微服务架构搭建和部署
description: 我们将使用三台 Vmware 环境下的 AlmaLinux9.4 操作系统作为演示环境，讨论分布式大数据和微服务架构的搭建和部署，包括 Hadoop、Zookeeper、Kubernetes等技术。
sticky: 6
categories:
  - Linux 企业级运维
outline: [ 2,3 ]
date: 2024-10-15
tags:
  - 运维
  - 微服务
  - 分布式
  - Linux
head:
  - - meta
    - name: keywords
      content: Linux企业级运维, 分布式, 微服务, Linux, 云原生, Kubernetes, AlmaLinux, 架构
---

# Linux 分布式大数据及微服务架构搭建和部署

在之前 Hadoop 大数据系列教程中，我们讨论了 Hadoop 大数据集群的搭建与部署。但是当时只是浮于表面，在这个系列中，我会用更新的技术，更深的深度，并面向当前企业级开发中真正需要的技术，共同讨论分布式大数据和微服务架构。

我们将使用三台 Vmware 环境下的 AlmaLinux9.4 操作系统作为演示环境，Hadoop 官方也说明 3.4.x版本不再支持 jdk8，所以 JDK 版本我们选择更新且可以免费商用的 JDK17。

### 目录

- [第一章 环境准备](./1-preparations.md)
