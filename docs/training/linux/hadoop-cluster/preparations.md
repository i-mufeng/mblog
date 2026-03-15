---
title: 第二章 分布式环境准备
description: 
categories:
  - Linux 企业级运维
outline: [ 2,3 ]
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
      content: Linux企业级运维, 分布式, 微服务, Linux, 架构
---

# 第二章 分布式环境准备



在这个系列中，我们将使用三台 Vmware 环境下的 `AlmaLinux 10.1` 操作系统作为演示环境，搭建一个功能完备的分布式的大数据集群，详细讲解各个组件的安装、配置以及优化。整个过程将从基础环境的准备开始，包括操作系统的网络配置、主机名设置、时间同步等关键步骤，然后逐步搭建和集成分布式系统的核心组件，如 HDFS、YARN、Hive 和 Spark 等。

AlmaLinux 是由开源社区维护的 RHEL 发行版，专注于长期稳定版，是 Centos 比较好的替代品，可以完全取代 CentOS 稳定版本，软件方面无须进行任何一行代码的修改，迁移过程相当简单。在 Centos 停止维护之后，我们有很多生产环境都逐步迁移到了 AlmaLinux 并取得了不错的效果，所以我们的操作系统选择 AlmaLinux。

## 一、系统详细说明

- **操作系统：** AlmaLinux 10.1 Minimal 安装
- **虚拟化平台：** Vmware Workstation 2024
- **架构：** 使用三台虚拟机，一台 Master 以及两台 Node 节点
- **网络通信** 使用 Vmware 提供的 NAT 子网，配置静态 IP
- **SSH 工具：** Termius（支持同时操作多台服务器）

| 名称   | 核心 | 内存 | 域名         | IP             | 说明    |
| ------ | ---- | ---- | ------------ | -------------- | ------- |
| Master | 4c   | 8G   | master.local | 192.168.88.88  | 主节点  |
| Node01 | 2c   | 4G   | node01.local | 192.168.88.101 | 从节点1 |
| Node02 | 2c   | 4G   | node02.local | 192.168.88.102 | 从节点2 |

## 二、环境准备

### 2.1 系统安装

先创建 Master，安装过程中选择最近的镜像源即可，不需要单独配置镜像站地址。

### 3.2 安装基础软件

安装 `vim` 以及 `bash-completion`（TAB 命令提示）

```bash
yum -y install vim bash-completion
```

### 3.3 配置静态 IP

Redhat 9 以上使用 NetworkManager 进行网络管理，配置文件位于 `/etc/NetworkManager` ，推荐使用 `nmcli` 进行配置。

```bash
# 删除原有的ens160连接
nmcli con del ens160   
# 添加名为 mufeng 的连接，并配置 IP 地址
nmcli con  add if-name ens160 con-name mufeng ipv4.method manual ipv4.address 192.168.88.88/24 ipv4.dns 192.168.88.2 ipv4.gateway 192.168.88.2 ipv6.method disabled
```

### 3.4 配置ssh

RHEL9 默认不允许 ROOT 用户连接 SSH，我们需要修改 ssh 配置文件 `/etc/ssh/sshd_config`，允许 ROOT 用户访问。

```ini
PermitRootLogin yes
```

重启 ssh 服务

```
systemctl restart sshd
```

SSH 连接工具不做限制，本教程使用 Termius。

### 3.5 配置 hosts

```ini
# vim /etc/hosts 
192.168.88.88   master.local     master
192.168.88.101  node01.local     node01
192.168.88.102  node02.local     node02
```

### 3.6 禁用防火墙

由于Hadoop 大数据集群通常部署在企业内网，其网络安全由外部网关或其他设施进行管理，且若开启防火墙会导致集群之间通讯的管理异常复杂，故一般都不会开启防火墙。

```shell
systemctl disable firewalld --now
```

### 3.7 禁用SELINUX

查看 SELINUX 状态：`getenforce `，可以看到: `enforcing`

```
[root@master01 ~]# getenforce 
Enforcing
```

临时禁用 SELINUX：`setenforce 0`

永久禁用 SELINUX：修改配置文件 `/etc/selinux/config`

```shell
#SELINUX=enforcing
SELINUX=disabled
```

### 3.8 安装其他 服务（可选）

由于使用习惯，我会安装 `FishShell`，如果需要安装请移步其他教程。后续教程中都是会用到 `FishShell`。

### 3.8 克隆虚拟机

> 建议关机后创建快照，方便误操作后恢复。

克隆出其他两台 Node 节点，并命名为 Node01、Node02，注意使用完整克隆。克隆完成后修改网络和 hostname。

配置网络：

```bash
修改 Node01 IP 地址
nmcli con mod mufeng ipv4.address 192.168.88.101/24
nmcli con down mufeng
nmcli con up mufeng
```

配置hostname：

```bash
# 修改 NODE01 的 hostname
hostnamectl set-hostname node01.local
```

### 3.9 配置 ssh 免密登录

在三台虚拟机分别执行：

```bash
ssh-keygen -t rsa				   # 生成密钥文件，配置均默认，按三次 Enter 即可。
ssh-copy-id master.mufeng.local		# 配置免密登录
ssh-copy-id node01.mufeng.local
ssh-copy-id node02.mufeng.local
```

> 注意：此处 ssh-copy-id 自身是必要的操作

至此，三台虚拟机集群基础就搭建完成了。

![image-20260309160126443](https://cdn.imufeng.cn/mblog/image-20260309160126443.png)

### 3.10 安装 JDK

> JDK 可以选择 11 或以上版本，但是在安装过程中可能遇到问题，需要单独处理，故不推荐。

Hadoop 使用 JAVA 语言开发，我们需要安装 JDK （Java 开发工具集），这里我们选用 Oracle JDK 1.8，于官网下载，商用请使用 OpenJDK。官网下载地址：[Java Downloads | Oracle 中国](https://www.oracle.com/cn/java/technologies/downloads/)。

选择 X64 的压缩包下载即可，下载后解压到 `/usr/local/`：

```bash
curl -oL jdk8.tar.gz 'https://DOWNLOAD-URL' #下载地址
cd /opt/
tar -zxf jdk8.tar.gz -C /usr/local/ # 解压到指定目录
mv jdk1.8.0_431/ jdk-8
```

FishShell 修改环境变量与 bash 不同，需修改 `/root/.config/fish/config.fish`，加入如下内容：

```bash
# --------------------------
# Java 环境变量
# --------------------------
set -x JAVA_HOME /usr/local/jdk-8
fish_add_path $JAVA_HOME/bin  # fish 会统一管理 path，避免冲突等问题给
```

使改动生效

```bash
exec fish
```

至此，JDK8 安装完成。

## 四、其他补充

### 4.1 ms

这是我自己完成的一个脚本，用于将文件从一个节点同步拷贝到其他节点。使用方法如下：

1. 安装 async

   为了避免向多个节点拷贝时间较长，所以使用 async 工具。执行如下命令安装：

   ```bash
   dnf -y install async
   ```

2. 写入脚本内容

   需要在 `~/.config/fish/functions` 路径下新建一个 `ms.fish` 文件，并写入脚本内容。

   脚本内容详见: [分布式集群文件批量同步工具](../muffin-tools/muffin-sync.md)
   
3. 修改workers配置

   在 ` ~/.config/` 下新建文件 `nodes`，写入如下内容：

   ```text
   master.local   # 注意，这里要和 hostname 一致 否则会有报错
   node01.local
   node02.local
   ```

4. 执行

   该脚本可以接受0-2个参数，可以直接传入文件名：

   - 不传入参数：直接同步当前路径到所有其他节点，目标节点路径与传入路径的绝对路径一致。。
   - 一个参数：同步指定参数路径到所有节点，目标节点路径与传入路径的绝对路径一致。
   - 两个参数：同步第一个参数路径到所有其他节点的第二个参数路径。

5. 示例

   ![image-20260309161417856](https://cdn.imufeng.cn/mblog/image-20260309161417856.png)

   ![image-20260309161441905](https://cdn.imufeng.cn/mblog/image-20260309161441905.png)



## 参考内容

- [什么是分布式系统？ | Atlassian](https://www.atlassian.com/zh/microservices/microservices-architecture/distributed-architecture)
- [凤凰架构：构建可靠的大型分布式系统 | 凤凰架构](https://icyfenix.cn/)
- [云原生微服务技术趋势解读 - 阿里巴巴中间件 - 博客园](https://www.cnblogs.com/aliware/p/17095384.html)
