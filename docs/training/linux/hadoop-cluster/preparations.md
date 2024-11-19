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
      content: Linux企业级运维, 分布式, 微服务, Linux, AlmaLinux, 架构
---

# 第二章 分布式环境准备



在这个系列中，我们将使用五台 Vmware 环境下的 `AlmaLinux9.4` 操作系统作为演示环境，搭建一个功能完备的分布式的大数据集群，详细讲解各个组件的安装、配置以及优化。整个过程将从基础环境的准备开始，包括操作系统的网络配置、主机名设置、时间同步等关键步骤，然后逐步搭建和集成分布式系统的核心组件，如 HDFS、YARN、Hive 和 Spark 等。

AlmaLinux 是由开源社区维护的 RHEL 发行版，专注于长期稳定版，是 Centos 比较好的替代品，可以完全取代 CentOS 稳定版本，软件方面无须进行任何一行代码的修改，迁移过程相当简单。在 Centos 停止维护之后，我们有很多生产环境都逐步迁移到了 AlmaLinux 并取得了不错的效果，所以我们的操作系统选择 AlmaLinux。

系统

详细说明如下：

- **操作系统：** AlmaLinux9.4 Minimal 安装
- **虚拟化平台：** Vmware Workstation Pro 17
- **架构：** 使用五台虚拟机，两台 Master 以及以及三台 Node 节点
- **网络通信** 使用 Vmware 提供的 NAT 子网，配置静态 IP
- **SSH 工具：** Termius（支持同时操作多台服务器）

| 名称       | 核心 | 内存 | 域名                    | IP             | 说明   |
|----------|----|----|-----------------------|----------------|------|
| Master01 | 4c | 8G | master01.mufeng.local | 192.168.88.66  | 主节点1 |
| Master02 | 4c | 8G | master02.mufeng.local | 192.168.88.88  | 主节点2 |
| Node01   | 2c | 4G | node01.mufeng.local   | 192.168.88.101 | 从节点1 |
| Node02   | 2c | 4G | node02.mufeng.local   | 192.168.88.102 | 从节点2 |
| Node03   | 2c | 4G | node03.mufeng.local   | 192.168.88.103 | 从节点3 |

## 三、环境准备

### 3.1 系统安装

先创建 Master01，配置完成后使用虚拟机克隆拷贝其他四台虚拟机 Master02、Node01、Node02、Node03。

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