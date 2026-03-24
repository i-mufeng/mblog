---
title: 第二章 分布式环境准备
description: 介绍 Hadoop 集群部署前的基础环境准备，包括虚拟机规划、网络配置、主机名设置、SSH 免密、JDK 安装和常用辅助工具准备。
categories:
  - Linux 分布式集群
outline: [2,3]
date: 2024-10-25
recommend: 2
tags:
  - 运维
  - 分布式
  - Linux
  - Hadoop
head:
  - - meta
    - name: keywords
      content: Linux企业级运维, 分布式, 微服务, Linux, 架构, Hadoop
cover: https://cdn.imufeng.cn/mblog/202411161444264.png
---

# 第二章 分布式环境准备

在正式安装 Hadoop 之前，需要先准备好稳定、可互通的基础环境。本章以三台 `AlmaLinux` 虚拟机为例，完成网络、主机名、SSH 免密和 JDK 等通用依赖配置，为后续章节打好基础。

## 一、实验环境说明

- **操作系统：** `AlmaLinux 10.1 Minimal`
- **虚拟化平台：** `Vmware Workstation 2024`
- **集群规模：** `1` 台 Master 节点 + `2` 台 Node 节点
- **网络方式：** `NAT` 子网 + 静态 IP
- **终端工具：** `Termius` 或任意支持 SSH 的终端

| 名称 | 核心 | 内存 | 主机名 | IP | 说明 |
| --- | --- | --- | --- | --- | --- |
| Master | 4c | 8G | master.local | 192.168.88.88 | 主节点 |
| Node01 | 2c | 4G | node01.local | 192.168.88.101 | 从节点 1 |
| Node02 | 2c | 4G | node02.local | 192.168.88.102 | 从节点 2 |

## 二、基础软件安装

先安装常用基础工具：

```bash
yum -y install vim bash-completion
```

如需后续调试网络、端口或 Java 进程，也可以按需补充 `net-tools`、`lsof`、`wget`、`curl` 等工具。

## 三、配置网络与主机名

### 3.1 配置静态 IP

在 RHEL 9+ 系系统中，推荐使用 `nmcli` 管理网络连接。以下示例为 Master 节点配置静态地址：

```bash
# 删除原有连接
nmcli con del ens160

# 新建连接并配置 IP、网关与 DNS
nmcli con add if-name ens160 con-name mufeng \
  ipv4.method manual \
  ipv4.address 192.168.88.88/24 \
  ipv4.gateway 192.168.88.2 \
  ipv4.dns 192.168.88.2 \
  ipv6.method disabled

nmcli con up mufeng
```

Node 节点只需要将 IP 地址分别改为 `192.168.88.101` 和 `192.168.88.102`。

### 3.2 配置主机名

分别在三台机器上设置主机名：

```bash
hostnamectl set-hostname master.local
hostnamectl set-hostname node01.local
hostnamectl set-hostname node02.local
```

### 3.3 配置 hosts

为避免依赖外部 DNS，建议所有节点统一维护 `/etc/hosts`：

```ini
192.168.88.88   master.local  master
192.168.88.101  node01.local  node01
192.168.88.102  node02.local  node02
```

配置完成后可通过 `ping master.local`、`ping node01.local` 等命令检查节点间解析是否正常。

## 四、SSH 基础配置

### 4.1 允许 root 登录

如实验环境直接使用 `root` 账户管理，可以在 `/etc/ssh/sshd_config` 中开启：

```ini
PermitRootLogin yes
```

修改后重启服务：

```bash
systemctl restart sshd
```

### 4.2 配置 SSH 免密登录

在三台服务器上分别生成密钥：

```bash
ssh-keygen -t rsa
```

然后将公钥分发到各节点：

```bash
ssh-copy-id master.local
ssh-copy-id node01.local
ssh-copy-id node02.local
```

最终需要保证三台节点之间都可以互相免密登录，至少 Master 节点应能够免密访问所有 Node 节点。

## 五、关闭干扰项

### 5.1 关闭防火墙

实验环境中为了简化集群通信，可以先关闭 `firewalld`：

```bash
systemctl disable firewalld --now
```

### 5.2 关闭 SELinux

先查看当前状态：

```bash
getenforce
```

临时关闭：

```bash
setenforce 0
```

永久关闭：修改 `/etc/selinux/config`：

```ini
SELINUX=disabled
```

修改后建议重启系统或重新登录确认生效。

## 六、克隆虚拟机

建议先完整配置好 Master 节点，再关机创建快照并克隆出 `Node01`、`Node02`，这样可以减少重复操作。

克隆完成后需要重点检查：

- 节点 IP 地址是否唯一。
- 主机名是否已修改。
- `/etc/hosts` 是否一致。
- SSH 主机指纹是否需要重新确认。

## 七、安装 JDK

Hadoop 依赖 Java 运行环境。为了兼容传统部署方式，这里以 `JDK 8` 为例。

```bash
curl -oL jdk8.tar.gz 'https://DOWNLOAD-URL'
tar -zxf jdk8.tar.gz -C /usr/local/
cd /usr/local/
mv jdk1.8.0_431 jdk-8
```

如果使用 `bash`，可以在 `/etc/profile` 或用户自己的 shell 配置中加入：

```bash
export JAVA_HOME=/usr/local/jdk-8
export PATH=$PATH:$JAVA_HOME/bin
```

如果使用 `fish`，可以在 `/root/.config/fish/config.fish` 中加入：

```fish
set -x JAVA_HOME /usr/local/jdk-8
fish_add_path $JAVA_HOME/bin
```

执行 `java -version` 确认安装成功。

## 八、辅助同步工具

如果需要频繁将配置文件同步到多个节点，可以准备一个批量同步脚本，例如文中提到的 `ms`。其核心作用是把某个目录或文件快速同步到其他节点，减少重复操作。

如需使用该工具，可以参考站内文章：[分布式集群文件批量同步工具](../muffin-tools/muffin-sync.md)

## 九、本章小结

完成本章后，应达到以下状态：

- 三台节点之间网络互通。
- 主机名与 `hosts` 配置正确。
- Master 到各 Node 已可 SSH 免密登录。
- JDK 已安装并可正常执行 `java -version`。

满足以上条件后，即可继续进入 Hadoop 集群部署。

## 参考内容

- [AlmaLinux](https://almalinux.org/)
- [NetworkManager 文档](https://networkmanager.dev/)
- [什么是分布式系统？ | Atlassian](https://www.atlassian.com/zh/microservices/microservices-architecture/distributed-architecture)
