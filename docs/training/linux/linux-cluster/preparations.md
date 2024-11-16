---
title: 分布式集群部署 环境准备
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

# 环境准备

## 一、分布式架构与微服务

  在中小型软件系统架构中，单一服务器通常能够满足大部分需求，甚至可能显得过剩。因此，云厂商推出了弹性云服务器（ECS），它可以让开发团队能够根据实际需求动态调整资源配置，从而降低成本并提高系统的可用性。对于较短时间内的访问量激增，可以临时增加服务器配置来应对。但随着业务的不断发展，通过简单的增加服务器配置已经难以应对不断增加的用户请求和数据量，这时候就出现了分布式系统架构。

  分布式架构是指将系统的各个组件和服务分布在多台独立的计算机节点上（通常是服务器），他们之间通过网络进行通信和协作，它也被称为分布式计算或分布式数据库，并依靠不同的节点通过公共网络进行通信和同步。这些节点通常代表独立的物理硬件设备，但也可代表单独的软件进程或其他递归封装的系统。常见的分布式架构包括微服务架构、分布式数据库系统、分布式存储系统等。

  微服务架构是一种依赖于多个可独立部署服务的架构方法。这些服务各自拥有独立的业务逻辑和数据库，甚至可以使用不同的底层操作系统和运行环境，专注于实现特定的功能。每个服务都可以独立进行更新、测试、部署和扩展，从而提高了系统的灵活性和可维护性。微服务架构将特定领域的主要业务问题拆解为多个独立的代码库，使得开发团队能够更高效地管理和优化每个服务。这种架构的优势在于，它促进了团队的自治，使不同团队可以并行开发各自的服务而不互相干扰。同时，微服务架构支持技术多样性，团队可以选择最适合他们的工具和框架来实现服务，进一步提升了开发效率。

  系统架构经历从最初的单体架构到服务导向架构（SOA），再到如今的微服务架构，甚至未来的无服务架构，这一过程日益成熟。由于微服务架构的显著优势，许多互联网巨头纷纷转型为微服务架构。例如，阿里等云服务巨头已基本完成了微服务化，推动了微服务的快速发展。在这个云时代，微服务架构已成为云计算的基础设施，赋予企业更高的灵活性和可扩展性。展望未来，微服务架构将继续演进，结合容器化和自动化技术，使得服务的创建、部署和管理变得更加高效。无论是提升开发速度，还是优化资源使用，微服务架构都将为企业在不断变化的市场中提供强有力的支持。

## 二、环境说明

我们将使用五台 Vmware 环境下的 `AlmaLinux9.4` 操作系统作为演示环境，安装 Hadoop 大数据全家桶：Hadoop + Zookeeper + Hbase + Hive + Sqoop，你可以选择其他的虚拟化平台，或者元服务器都是可行的。

- **操作系统：** AlmaLinux Minimal 安装
- **镜像下载：** AlmaLinux OS 9.4 Minimal ISO，点击链接可直接[使用阿里云镜像站下载](https://mirrors.aliyun.com/almalinux/9.4/isos/ppc64le/AlmaLinux-9.4-ppc64le-minimal.iso)。
- **虚拟化平台：** Vmware Workstation Pro 17
- **架构：** 使用三台虚拟机，Master 以及 Node01、Node02
- **网络：** 使用 NAT 地址转换，进入系统后配置固定 IP
- **SSH 工具：** Termius（支持同时操作多台服务器）

各节点详细信息如下：

| 名称     | 核心 | 内存 | 域名                    | IP             | 说明    |
| -------- | ---- | ---- |-----------------------| -------------- | ------- |
| Master01 | 4c   | 8G   | master01.mufeng.local | 192.168.88.66  | 主节点1 |
| Master02 | 4c   | 8G   | master02.mufeng.local | 192.168.88.88  | 主节点2 |
| Node01   | 2c   | 4G   | node01.mufeng.local   | 192.168.88.101 | 从节点1 |
| Node02   | 2c   | 4G   | node02.mufeng.local   | 192.168.88.102 | 从节点2 |
| Node03   | 2c   | 4G   | node03.mufeng.local   | 192.168.88.103 | 从节点3 |

## 三、环境准备

### 3.1 系统安装

先创建 Master01，配置完成后使用虚拟机克隆拷贝其他四台虚拟机 Master02、Node01、Node02、Node03，虚拟机创建过程略。

开启虚拟机，选择 Install AlmaLinux 9.4，使用最小化安装。

![image-20241022143627620](https://cdn.imufeng.cn/mblog/2b74227a1fbd3799fbf7464a93830d16.png)

语言使用英文，软件源配置阿里镜像站。软件源配置如下：

链接地址：`https://mirrors.aliyun.com/almalinux/9.4/BaseOS/x86_64/os/`

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

Redhat 9 以上使用 NetworkManager 进行网络管理，配置文件位于 `/etc/NetworkManager` ，推荐使用 `nmcli` 进行配置。

```bash
nmcli con down ens160
# 添加名为 mufeng 的连接，并配置 IP 地址
nmcli conection  add if-name ens160 con-name mufeng ipv4.method manual ipv4.address 192.168.88.66/24 ipv4.dns 192.168.88.2 ipv4.gateway 192.168.88.2 ipv6.method disabled
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
192.168.88.66   master01.mufeng.local   master01        master
192.168.88.88   master02.mufeng.local   master02
192.168.88.101  node01.mufeng.local     node01
192.168.88.102  node02.mufeng.local     node02
192.168.88.103  node03.mufeng.local     node03
```

### 3.6 禁用防火墙

由于Hadoop 大数据集群通常部署在企业内网，其网络安全由外部网关或其他设施进行管理，且若开启防火墙会导致集群之间通讯的管理异常复杂，故一般都不会开启防火墙。 SELINUX 同理。

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

### 3.8 克隆虚拟机

> 建议关机后创建快照，方便误操作后恢复。

克隆出其他四台虚拟机，并命名为 Master02、Node01、Node02、Node03，注意使用完整克隆。克隆完成后修改网络和 hostname。

配置网络：

```bash
修改 Master02 IP 地址
nmcli con mod mufeng ipv4.address 192.168.88.88/24
nmcli con down mufeng
nmcli con up mufeng
```

配置hostname：

```bash
# 修改 NODE01 的 hostname
hostnamectl set-hostname node01.mufeng.local
```

克隆完成后的五台机器：

![image-20241114215255780](https://cdn.imufeng.cn/mblog/202411151453448.png)

![image-20241114215454179](https://cdn.imufeng.cn/mblog/202411151453449.png)



### 3.9 配置 ssh 免密登录

在五台虚拟机分别执行：

```bash
ssh-keygen -t rsa					# 生成密钥文件，配置均默认，按三次 Enter 即可。
ssh-copy-id master01.mufeng.local		# 配置免密登录
ssh-copy-id master02.mufeng.local
ssh-copy-id node01.mufeng.local
ssh-copy-id node02.mufeng.local
ssh-copy-id node03.mufeng.local
```

> 注意：此处 ssh-copy-id 自身是必要的操作

![image-20241023104706154](https://cdn.imufeng.cn/mblog/3150827bfb08850d640b5d97777dd464.png)

至此，五台虚拟机集群基础就搭建完成了。

### 3.10 安装 JDK

> JDK 可以选择 11 或以上版本，但是在安装过程中可能遇到问题，需要单独处理。

Hadoop 使用 JAVA 语言开发，我们需要安装 JDK （Java 开发工具集），这里我们选用 Oracle JDK 1.8，于官网下载，商用请使用 OpenJDK。官网下载地址：[Java Downloads | Oracle 中国](https://www.oracle.com/cn/java/technologies/downloads/)。

选择 X64 的压缩包下载即可，下载后解压到 `/usr/local/`：

```bash
curl -o jdk8.tar.gz https://DOWNLOAD-URL #下载地址
cd /opt/
tar -zxf jdk8.tar.gz -C /usr/local/ # 解压到指定目录
mv jdk1.8.0_431/ jdk8
```

配置环境变量，直接修改 `/etc/profile` 文件：

```bash
### Create By Mufeng
export JAVA_HOME=/usr/local/jdk8/
export PATH=$PATH:$JAVA_HOME/bin/
```

使改动生效

```bash
. /etc/profile
```

至此，JDK8 安装完成。

![image-20241114220405635](https://cdn.imufeng.cn/mblog/202411151453450.png)

## 四、其他补充

### 4.1 scpa

这是我自己完成的一个脚本，用于将文件从一个节点拷贝到其他节点，节点列表是从 hadoop 配置文件 workers 获取，并忽略源节点。

```bash
cd /usr/local/bin
vim scpa
```

```sh
#!/bin/bash

# 检查是否提供了路径参数
if [ -z "$1" ]; then
    echo "Usage: $0 <source_path>"
    exit 1
fi
# 将传入路径参数转换为绝对路径
SOURCE_PATH=$(realpath "$1")
# 检查源路径是否存在
if [ ! -e "$SOURCE_PATH" ]; then
    echo "Error: Source path '$SOURCE_PATH' does not exist."
    exit 1
fi
# 获取本机的主机名或IP地址
LOCAL_HOST=$(hostname)
LOCAL_IP=$(hostname -I | awk '{print $1}')  # 获取第一个IP地址
# 获取目标节点列表
WORKERS_FILE="/usr/local/hadoop/etc/hadoop/workers"
if [ ! -f "$WORKERS_FILE" ]; then
    echo "Error: Workers file '$WORKERS_FILE' does not exist."
    exit 1
fi
# 遍历目标节点并执行拷贝
while read WORKER; do
    # 忽略空行
    if [ -z "$WORKER" ]; then
        continue
    fi
    # 忽略本机
    if [[ "$WORKER" == "$LOCAL_HOST" || "$WORKER" == "$LOCAL_IP" ]]; then
        echo "Skipping local machine: $WORKER"
        continue
    fi
    #echo "Processing $WORKER..."
    # 删除目标机器上的同名文件或目录
    ssh "$WORKER" "rm -rf '$SOURCE_PATH'" </dev/null >/dev/null 2>&1 
    # 进行远程拷贝
    if [ -d "$SOURCE_PATH" ]; then
        scp -r "$SOURCE_PATH" "$WORKER:$SOURCE_PATH" </dev/null >/dev/null 2>&1
    else
        scp "$SOURCE_PATH" "$WORKER:$SOURCE_PATH" </dev/null >/dev/null 2>&1 
    fi
    echo "Copied $SOURCE_PATH to $WORKER"
done < "$WORKERS_FILE"
echo "Batch copy completed."
```

修改完成后，给他一个权限就可以执行拷贝：

```sh
chmod +x scpa
```

执行示例：

![image-20241115094659422](https://cdn.imufeng.cn/mblog/202411151453451.png)



## 参考内容

- [什么是分布式系统？ | Atlassian](https://www.atlassian.com/zh/microservices/microservices-architecture/distributed-architecture)
- [凤凰架构：构建可靠的大型分布式系统 | 凤凰架构](https://icyfenix.cn/)
- [云原生微服务技术趋势解读 - 阿里巴巴中间件 - 博客园](https://www.cnblogs.com/aliware/p/17095384.html)