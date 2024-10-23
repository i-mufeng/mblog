---
hidden: true
title: 第一章 环境准备
description: 本系列将从 Linux 企业级运维的角度出发，详细介绍 Linux 操作系统下 Nginx + JAVA + MYSQL + Redis + Minio 的安装部署，主要使用编译安装。
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
# 第一章 环境准备

## 一、分布式架构与微服务

在中小型软件系统架构中，单一服务器通常能够满足大部分需求，甚至可能显得过剩。因此，云厂商推出了弹性云服务器（ECS），它可以让开发团队能够根据实际需求动态调整资源配置，从而降低成本并提高系统的可用性。对于较短时间内的访问量激增，可以临时增加服务器配置来应对。但随着业务的不断发展，通过简单的增加服务器配置已经难以应对不断增加的用户请求和数据量，这时候就出现了分布式系统架构。

分布式架构是指将系统的各个组件和服务分布在多台独立的计算机节点上（通常是服务器），他们之间通过网络进行通信和协作，它也被称为分布式计算或分布式数据库，并依靠不同的节点通过公共网络进行通信和同步。这些节点通常代表独立的物理硬件设备，但也可代表单独的软件进程或其他递归封装的系统。常见的分布式架构包括微服务架构、分布式数据库系统、分布式存储系统等。

分布式架构的特点如下:

**可扩展性**：随着用户和数据量的增加，分布式系统可以通过添加更多节点来扩展处理能力，而不是依赖单一机器。

**高可用性**：分布式系统可以通过冗余和故障转移机制提高系统的可用性，即使某个节点发生故障，其他节点仍然可以继续提供服务。

**负载均衡**：通过将请求分配到多个节点，分布式系统可以更均衡地处理负载，避免单个节点的过载。

**地理分布**：分布式系统可以在多个地理位置部署，降低延迟，提高用户访问速度和体验。

**资源利用**：可以有效利用不同节点的计算和存储资源，提高整体资源利用率。

**数据处理**：对于大规模数据处理任务，分布式系统能够并行处理，提高效率。

微服务架构是一种依赖于多个可独立部署服务的架构方法。这些服务各自拥有独立的业务逻辑和数据库，甚至可以使用不同的底层操作系统和运行环境，专注于实现特定的功能。每个服务都可以独立进行更新、测试、部署和扩展，从而提高了系统的灵活性和可维护性。微服务架构将特定领域的主要业务问题拆解为多个独立的代码库，使得开发团队能够更高效地管理和优化每个服务。这种架构的优势在于，它促进了团队的自治，使不同团队可以并行开发各自的服务而不互相干扰。同时，微服务架构支持技术多样性，团队可以选择最适合他们的工具和框架来实现服务，进一步提升了开发效率。

系统架构经历了从最初的单体架构到服务导向架构（SOA），再到如今的微服务架构，甚至未来的无服务架构，这一过程日益成熟。由于微服务架构的显著优势，许多互联网巨头纷纷转型为微服务架构。例如，阿里等云服务巨头已基本完成了微服务化，推动了微服务的快速发展。在这个云时代，微服务架构已成为云计算的基础设施，赋予企业更高的灵活性和可扩展性。展望未来，微服务架构将继续演进，结合容器化和自动化技术，使得服务的创建、部署和管理变得更加高效。无论是提升开发速度，还是优化资源使用，微服务架构都将为企业在不断变化的市场中提供强有力的支持。

## 二、环境说明

在之前 Hadoop 大数据系列教程中，我们讨论了 Hadoop 大数据集群的搭建与部署。但是当时只是浮于表面，在这个系列中，我会用更新的技术，更深的深度，并面向当前企业级开发中真正需要的技术，共同讨论分布式大数据和微服务架构。

我们将使用三台 Vmware 环境下的 `AlmaLinux9.4` 操作系统作为演示环境，Hadoop 官方也说明 3.4.x版本不再支持 jdk8，所以 JDK 版本我们选择更新且可以免费商用的 JDK17。

教程中如遇到 `mufeng.dev`、`imufeng.cn` 及其子域名均为博主自有域名。

- **操作系统：** AlmaLinux Minimal 安装
- **镜像下载：** AlmaLinux OS 9.4 Minimal ISO，推荐到[阿里云镜像站](https://mirrors.aliyun.com/almalinux/9.4/isos/ppc64le/AlmaLinux-9.4-ppc64le-minimal.iso)下载
- **虚拟化平台：** Vmware Workstation Pro 17
- **架构：** 使用三台虚拟机，Master 以及 Node01、Node02
- **网络：** 使用 NAT 地址转换，进入系统后配置固定 IP

| 名称   | 核心 | 内存 | 域名              | IP            | 说明    |
| ------ | ---- | ---- | ----------------- | ------------- | ------- |
| Master | 4c   | 8G   | master.mufeng.dev | 192.168.66.66 | 主节点  |
| Node01 | 2c   | 4G   | node01.mufeng.dev | 192.168.66.88 | 从节点1 |
| Node02 | 2c   | 4G   | node02.mufeng.dev | 192.168.66.99 | 从节点2 |

## 三、环境准备

### 3.1 系统安装

先创建 Master，配置完成后使用虚拟机克隆拷贝 Node01、Node02，虚拟机创建过程略。

![image-20241022143050398](https://cdn.imufeng.cn/mblog/d9afae878d9e1af1432bd71b7de6cdef.png)

![image-20241022143201387](https://cdn.imufeng.cn/mblog/8617fba77612aca4baeaf32c7f5bb9cf.png)

开启虚拟机，选择 Install AlmaLinux 9.4，使用最小化安装。

![image-20241022143627620](https://cdn.imufeng.cn/mblog/2b74227a1fbd3799fbf7464a93830d16.png)

语言使用英文，软件源配置阿里镜像站。软件源配置如下：

![image-20241022144429325](https://cdn.imufeng.cn/mblog/636034294b8b4e682d41c90130907bd1.png)

配置完成并下载元数据后，选择 Minimal Install.

分区选择手动分区，此处仅供参考，分配如下：

![image-20241022144834200](https://cdn.imufeng.cn/mblog/09cba637dee9d4f9c2486e72a6400685.png)

点击开始安装，稍等片刻，即可成功安装，点击重启会自动进入操作系统。

![image-20241022145338458](https://cdn.imufeng.cn/mblog/b415834430090ff746a5a5fd1d50bb85.png)

### 3.2 安装基础软件

安装 vim 以及 bash-completion（TAB 命令提示）

```bash
yum -y install vim bash-completion
```

### 3.3 配置静态 IP

Redhat9 以上使用 NetworkManager 进行网络管理，配置文件位于 `/etc/NetworkManager` ，推荐使用 `nmcli` 进行配置。

```bash
nmcli con down ens160
nmcli conection  add if-name ens160 con-name mufeng ipv4.method manual ipv4.address 192.168.66.66/24 ipv4.dns 192.168.66.2 ipv4.gateway 192.168.66.2 ipv6.method disabled
```

### 3.4 配置ssh

修改 ssh 配置文件 `/etc/ssh/sshd_config`，允许 ROOT 用户访问

```ini
PermitRootLogin yes
```

重启 ssh 服务

```
systemctl restart sshd
```

### 3.5 配置 hosts

```ini
# vim /etc/hosts
192.168.66.66 master.mufeng.dev
192.168.66.88 node01.mufeng.dev
192.168.66.99 node02.mufeng.dev
```

### 3.6 克隆虚拟机

> 建议关机后创建快照，方便误操作后恢复。

克隆两台虚拟机，命名为 node01、node02，注意使用完整克隆

克隆后需要调整虚拟机配置、hostname 等等，此处不再赘述。

配置网络：

```bash
nmcli con mod mufeng ipv4.address 192.168.66.88/24
nmcli con down mufeng
nmcli con up mufeng
```

配置hostname：

```bash
hostnamectl set-hostname node01.mufeng.dev
```

![image-20241023102117902](https://cdn.imufeng.cn/mblog/45f439fdfb7aaa10a98427049c55b2a0.png)

![image-20241023102615127](https://cdn.imufeng.cn/mblog/a722f8e2ab807b809dd4a9e2580938e7.png)

### 3.7 SSH 连接

使用 Termius等连接工具，推荐 Termius ，它可以同时管理三个连接。

![image-20241023104054797](https://cdn.imufeng.cn/mblog/d4e75714b004a94eb7700d1f99cb494e.png)

### 3.8 配置 ssh 免密登录

在三台虚拟机分别执行：

```bash
ssh-keygen -t rsa					# 生成密钥文件
ssh-copy-id master.mufeng.dev		# 配置免密登录
ssh-copy-id node01.mufeng.dev
ssh-copy-id node02.mufeng.dev
```

> 注意：此处 ssh-copy-id 自身是必要的操作。

![image-20241023104706154](https://cdn.imufeng.cn/mblog/3150827bfb08850d640b5d97777dd464.png)

至此，三台虚拟机集群基础就搭建完成了。

### 3.9 安装JDK17

jdk17官网下载地址：[Java Archive Downloads - Java SE 17](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html)

选择 X64 的压缩包下载即可，Linux x64 Compressed Archive。

```bash
cd /opt/
curl -O https://download.oracle.com/java/17/archive/jdk-17.0.12_linux-x64_bin.tar.gz
```

解压

```bash
tar -zxf jdk-17.0.12_linux-x64_bin.tar.gz -C /usr/local/
cd /usr/local/jdk-17.0.12/
./bin/java -version

java version "17.0.12" 2024-07-16 LTS
Java(TM) SE Runtime Environment (build 17.0.12+8-LTS-286)
Java HotSpot(TM) 64-Bit Server VM (build 17.0.12+8-LTS-286, mixed mode, sharing)
```

配置环境变量

直接修改 `/etc/profile` 文件，使环境变量全局全用户生效。

```ini
### Create By Mufeng
export JAVA_HOME=/usr/local/jdk-17.0.12/
export PATH=$PATH:$JAVA_HOME/bin/
```

使改动生效

```bash
. /etc/profile
```

JDK17 安装完成。

## 参考内容

- [什么是分布式系统？ | Atlassian](https://www.atlassian.com/zh/microservices/microservices-architecture/distributed-architecture)
- [凤凰架构：构建可靠的大型分布式系统 | 凤凰架构](https://icyfenix.cn/)
- [云原生微服务技术趋势解读 - 阿里巴巴中间件 - 博客园](https://www.cnblogs.com/aliware/p/17095384.html)
