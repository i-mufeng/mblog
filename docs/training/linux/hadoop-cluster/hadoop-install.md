---
title: 第三章 Hadoop集群部署
description: 本文将介绍 Hadoop 分布式数据库并五台服务器上部署和搭建 Hadoop 集群，包含 HDFS、YARN、MapReduce 的基本配置。
categories:
  - Linux 分布式集群
outline: [ 2,3 ]
date: 2024-10-28
recommend: 3
tags:
  - 运维
  - 分布式
  - Linux
  - Hadoop
head:
  - - meta
    - name: keywords
      content: Linux企业级运维, 分布式, Linux, AlmaLinux, 架构, Hadoop, 大数据
cover: https://cdn.imufeng.cn/mblog/202411161444264.png
---
# Hadoop 分布式数据库集群部署

## 一、简介

Apache Hadoop 是 Apache 软件基金会下的一个开源数据库框架，以其开发者 **Cutting** 儿子的黄色玩具大象 Hadoop 命名。Hadoop 可以编写和运行分布式应用，处理 GB 到 PB 级别的数据。通常来讲，Hadoop 可以指 Hadoop 数据库框架，也可以指基于 Hadoop 的一系列分布式计算平台，包括 HDFS、Zookeeper、MapReduce、HBASE、Hive等等。

Hadoop 分布式文件系统（Hadoop Distributed File System (HDFS）是 Hadoop 生态的核心，是 Hadoop 的存储层，区别于传统的运行在磁盘的文件系统，它将数据分布式的存储在多个服务器节点上。并对其进行备份，这保证了数据的高可用性和高容错性。

MapReduce 是 Hadoop 的计算框架，用于并行计算和处理大规模数据。MapReduce 能够将输入的数据切分成小块， 并交给不同的节点进行处理，最终将结果进行合并。

Yarn 用于资源管理和作业调度。YARN 的基本思想是将资源管理和任务调度/监控的功能拆分为单独的守护进程，拥有一个全局资源管理器 ResourceManager（RM）以及每个应用程序的主控 ApplicationMaster （AM）。他们共同组成 Hadoop 的数据计算框架。

Hadoop 采用 Master/Slave 架构，一个 Hadoop 集群可能会有成百上千的服务器组成，包括一个 NameNode（中心服务器） 和 一定数目的 DataNode（从节点）组成。NameNode 负责管理文件系统的命名空间（namespace）以及客户端对文件的访问。Datanode 负责管理它所在节点的存储。HDFS 暴露了文件系统的命名空间，用户能够以文件的形式在上面存储数据。从内部看，一个文件其实被分成一个或多个数据块，这些块存储在一组 Datanode 上。 Namenode 执行文件系统的名字空间操作，比如打开、关闭、重命名文件或目录。它也负责确定数据块到具体Datanode 节点的映射。Datanode 负责处理文件系统客户端的读写请求。在 Namenode 的统一调度下进行数据块的创建、删除和复制。

Namenode 负责维护文件系统的名字空间，任何对文件系统名字空间或属性的修改都将被 Namenode 记录下来。应用程序可以设置 HDFS 保存的文件的副本数目。文件副本的数目称为文件的副本系数，这个信息也是由 Namenode 保存的。

![HDFS 架构](https://cdn.imufeng.cn/mblog/202411151428585.gif)

## 二、环境规划

各节点规划如下：其中 Master01 作为 NameNode、ResourceManager ，Master02 用于分担 SecondaryNameNode 的角色，同时它们也作为一个普通节点，运行 DataNode 以及 NodeManager。

| 节点       | 角色                                                     |
|----------|--------------------------------------------------------|
| Master01 | NameNode \| ResourceManager \| NodeManager \| DataNode |
| Master02 | SecondaryNameNode \| NodeManager \| DataNode           |
| Node01   | NodeManager \| DataNode                                |
| Node02   | NodeManager \| DataNode                                |
| Node03   | NodeManager \| DataNode                                |

## 三、集群部署

### 3.1 下载安装

博客成稿时，hadoop 3.4.1 还未正式发布，所以这里选择 Hadoop 3.4.0。版本发行地址：[Apache Hadoop 3.4.0](https://hadoop.apache.org/release/3.4.0.html)。

下载可执行文件，并解压到 `/usr/local/` 下

```bash
# /opt
curl -O https://dlcdn.apache.org/hadoop/common/hadoop-3.4.0/hadoop-3.4.0.tar.gz
tar -zxf hadoop-3.4.0.tar.gz -C /usr/local/
cd /usr/local/
mv hadoop-3.4.0 hadoop
```

解压后目录结构如下：

```
[root@master hadoop]# pwd
/usr/local/hadoop

[root@master hadoop]# ls
bin      LICENSE-binary   NOTICE.txt
etc      licenses-binary  README.txt
include  LICENSE.txt      sbin
lib      logs             share
libexec  NOTICE-binary
```

修改环境变量：

> 这里列出了 Hadoop 系列所有服务的环境变量配置，其他服务安装时不再说明。

```bash
# /etc/profile

#export JAVA_HOME=/usr/local/jdk-11.0.24
export JAVA_HOME=/usr/local/jdk8/
export HADOOP_HOME=/usr/local/hadoop/
export ZOOKEEPER_HOME=/usr/local/zookeeper/
export HBASE_HOME=/usr/local/hbase/
export HIVE_HOME=/usr/local/hive/
export SQOOP_HOME=/usr/local/sqoop/

export PATH=$PATH:$JAVA_HOME/bin/:$HADOOP_HOME/bin/:$HADOOP_HOME/sbin/:$ZOOKEEPER_HOME/bin/:$HBASE_HOME/bin/:$HIVE_HOME/bin/:$SQOOP_HOME/bin/
```

> Hadoop 命令存在 `start-all.sh` `stop-all.sh` 等非特有的命名，可以重命名，生产环境注意避免冲突。官方文档中只配置了 HADOOP_HOME，执行命令均为 `$HADOOP_HOME/bin/hdfs` 的格式。

在命令行输入 `hadoop version` ，输出如下内容即代表安装成功：

```
[root@master hadoop]# hadoop version
Hadoop 3.4.0
Source code repository git@github.com:apache/hadoop.git -r bd8b77f398f626bb7791783192ee7a5dfaeec760
Compiled by root on 2024-03-04T06:35Z
Compiled on platform linux-x86_64
Compiled with protoc 3.21.12
From source with checksum f7fe694a3613358b38812ae9c31114e
This command was run using /usr/local/hadoop/share/hadoop/common/hadoop-common-3.4.0.jar
```

### 3.2 配置文件说明

建议在 Master 节点安装并配置后，将其远程拷贝到 Slave 节点即可，包括 Hadoop 配置、环境变量配置等等，需确保配置文件路径保持一致。 这里推荐使用我们之前提供的脚本 SCPA。

> Once all the necessary configuration is complete, distribute the files to the `HADOOP_CONF_DIR` directory on all the machines. This should be the same directory on all machines.
>
> In general, it is recommended that HDFS and YARN run as separate users. In the majority of installations, HDFS processes execute as ‘hdfs’. YARN is typically using the ‘yarn’ account.

Hadoop 配置文件位于 `$HADOOP_HOME/etc/hadoop` 下，分为 Hadoop 基础配置、HDFS 配置、MapReduce 配置、Yarn 配置以及其他配置，为满足集群的基本运行，需要关注的配置如下：

```
/usr/local/hadoop/etc/hadoop/
   ###  基础配置
  ├── core-site.xml
  ├── workers
  ├── hadoop-env.sh
  
  ###  HDFS 配置
  ├── hdfs-site.xml
  
  ### MapReduce 配置
  ├── mapred-env.sh
  ├── mapred-site.xml
  
  ### Yarn 配置
  ├── yarn-env.sh
  └── yarn-site.xml
```

![image-20241114094855186](https://cdn.imufeng.cn/mblog/202411151428586.png)

### 3.3 基础配置

#### hadoop-env.sh

Hadoop 的基础环境配置，环境变量，启动选项等等。不需要单独在 XXX-env.sh 配置。此处所有服务均使用 root 用户管理，生产环境需要单独建立用户。

```bash
# 环境变量
export JAVA_HOME=/usr/local/jdk8/
# 启动选项，如果是 JDK17 则需要配置
# export HADOOP_OPTS="--add-opens java.base/java.lang=ALL-UNNAMED"

# 各个服务用户 
export HDFS_NAMENODE_USER="root"
export HDFS_DATANODE_USER="root"
export HDFS_SECONDARYNAMENODE_USER="root"
export YARN_RESOURCEMANAGER_USER="root"
export YARN_NODEMANAGER_USER="root"
```

#### core-site.xml

Hadoop 核心配置文件，定义集群名称、HDFS 地址等。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
<configuration>
    <property>
        <name>fs.defaultFS</name>
        <value>hdfs://master01.mufeng.local:9000</value>
    </property>
</configuration>
```

#### workers

等同于 hadoop 2.x 版本的 slaves，定义集群工作节点列表，通常包含各节点的主机名或 IP 地址。

```
master01.mufeng.local
master02.mufeng.local
node01.mufeng.local
node02.mufeng.local
node03.mufeng.local
```

### 3.4 HDFS 配置

#### hdfs-site.xml

HDFS 相关配置文件，指定数据块副本数、目录权限、本地存储地址等。

配置如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
<configuration>
    <!--文件在 HDFS 系统中的副本数，默认为 3-->
    <property>
        <name>dfs.replication</name>
        <value>3</value>
    </property>
    
    <property>
        <name>dfs.permissions.enabled</name>
        <value>false</value>
    </property>
    
    <!-- 配置 namenode HTTP 访问地址 -->
    <property>
        <name>dfs.namenode.http-address</name>
        <value>master01.mufeng.local:9870</value>
    </property>
    
    <!-- 配置 namenode 文件存储位置 -->
    <property>
        <name>dfs.namenode.name.dir</name>
        <value>file:/data/hadoop/namenode/</value>
    </property>
    
    <!-- 配置 datanode 文件存储位置 -->
    <property>
        <name>dfs.datanode.data.dir</name>
        <value>file:/data/hadoop/datanode/</value>
    </property>
    
    <!-- 配置secondary namenode 地址 -->
    <property>
        <name>dfs.namenode.secondary.http-address</name>
        <value>master02.mufeng.local:50090</value>
    </property>
</configuration>
```

### 3.5 YANR 配置

#### yarn-site.xml

YARN 配置文件，定义资源管理器、节点管理器等相关设置。

```xml
<configuration>
    <!-- 允许执行命令的用户 -->
    <property>
        <name>yarn.admin.acl</name>
        <value>*</value>
    </property>
    
    <!-- resourcemanager 配置 -->
    <property>
        <name>yarn.resourcemanager.hostname</name>
        <value>master01.mufeng.local</value>
    </property>
    
    <!-- 指定 YARN 服务为 mapreduce -->
    <property>
        <name>yarn.nodemanager.aux-services</name>
        <value>mapreduce_shuffle</value>
    </property>
</configuration>
```

#### mapred-site.xml

MapReduce 配置文件，用于指定作业历史、调度模式等。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
<configuration>
    <!-- 配置 Mapreduce 服务为 YARN -->
    <property>
        <name>mapreduce.framework.name</name>
        <value>yarn</value>
    </property>
</configuration>
```

### 3.6 其他配置

#### 日志格式

hadoop 使用 Log4j 作为日志管理框架，可以通过修改 `**-log4j.properties` 修改，此处不再赘述。

### 3.7 配置分发

在所有 Slave 节点均按照 [3.1 下载安装](#_3-1-下载安装) 安装后，通过上一节中提到的 scpa 命令将配置拷贝到 Slave 节点。

```shell
scpa /usr/local/hadoop
```

可以顺便将环境变量配置也拷贝一份：

```bash
scpa /etc/profile
```

![image-20241114112540166](https://cdn.imufeng.cn/mblog/202411151428587.png)

## 四、集群启动

### 4.1 初始化 namenode

要启动 hadoop 集群，需要同时运行 HDFS 集群和 YARN 集群。第一次运行 HDFS 集群时必须进行初始化，在 Master 执行以下命令进行初始化：

```bash
[hdfs]$ $HADOOP_HOME/bin/hdfs namenode -format
```

格式化成功后，即可在 `dfs.namenode.name.dir` 配置的目录下生成 HDFS 文件系统的元数据文件：

```
# /usr/local/hadoop/etc/hadoop

fsimage_0000000000000002719
fsimage_0000000000000002719.md5
seen_txid
VERSION
```

VERSION 文件如果有类似以下内容的信息，即代表初始化成功：

```
[root@master hadoop]# cat /data/hadoop/namenode/current/VERSION 
#Fri Oct 25 16:32:07 CST 2024
namespaceID=313409213
blockpoolID=BP-1653817213-192.168.66.66-1729755202997
storageType=NAME_NODE
cTime=1729755202997
clusterID=CID-4394dea1-157f-4705-bfa2-6975c18a5b17
layoutVersion=-67
```

![image-20241114113050571](https://cdn.imufeng.cn/mblog/202411151428588.png)

![image-20241114113126947](https://cdn.imufeng.cn/mblog/202411151428589.png)

### 4.2 启动集群

在配置好 SSH 免密登录后，可以一键进行 Hadoop 集群的启动，只需在 Master 节点执行一条命令即可：

```bash
start-all.sh

Starting namenodes on [master.mufeng.local]
Starting datanodes
Starting secondary namenodes [master.mufeng.local]
Starting resourcemanager
Starting nodemanagers
```

停止集群也只需要一条命令：

```bash
stop-all.sh
```

这条命令会同时通过 daemons 的方式启动 HDFS 以及 YARN 服务：

```bash
# start-all.sh 文件
...
# start hdfs daemons if hdfs is present
if [[ -f "${HADOOP_HDFS_HOME}/sbin/start-dfs.sh" ]]; then
  "${HADOOP_HDFS_HOME}/sbin/start-dfs.sh" --config "${HADOOP_CONF_DIR}"
fi

# start yarn daemons if yarn is present
if [[ -f "${HADOOP_YARN_HOME}/sbin/start-yarn.sh" ]]; then
  "${HADOOP_YARN_HOME}/sbin/start-yarn.sh" --config "${HADOOP_CONF_DIR}"
fi
```

也可以分别启动 HDFS 以及 YARN 服务：

```
[hdfs]$ $HADOOP_HOME/sbin/start-dfs.sh
[yarn]$ $HADOOP_HOME/sbin/start-yarn.sh
```

`start-dfs.sh`  命令又等同于：

```
[hdfs]$ $HADOOP_HOME/bin/hdfs --daemon start namenode
[hdfs]$ $HADOOP_HOME/bin/hdfs --daemon start datanode
```

`start-yarn.sh`  命令又等同于：

```
[yarn]$ $HADOOP_HOME/bin/yarn --daemon start resourcemanager
[yarn]$ $HADOOP_HOME/bin/yarn --daemon start nodemanager
```

不需要多记，只需要 `start-all.sh` 即可。

启动完成后，分别在各个节点执行 JPS 命令即可查看进程内容，可以看到，我们五台服务器均按照预期启动进程。

![image-20241114113230328](https://cdn.imufeng.cn/mblog/202411151428590.png)

### 4.3 访问 WEB 端

Hadoop 提供了基础的 WEB-UI 查看集群信息，访问 Master 节点的 9870 端口即可：https://master01.mufeng.local:9870/

基本信息：

![image-20241114115651119](https://cdn.imufeng.cn/mblog/202411151428591.png)

DataNode 总览：

![image-20241114120020640](https://cdn.imufeng.cn/mblog/202411151428592.png)

点击单独节点即可看到该节点的详细信息：

![image-20241114120332456](https://cdn.imufeng.cn/mblog/202411151427889.png)

至此，Hadoop 集群就搭建完成了。

## 参考内容

- [Apache Hadoop 3.4.0 – Apache Hadoop 3.4.0 Release Notes](https://hadoop.apache.org/docs/r3.4.0/hadoop-project-dist/hadoop-common/release/3.4.0/RELEASENOTES.3.4.0.html)
- [Apache Hadoop 3.4.0 – Hadoop Cluster Setup](https://hadoop.apache.org/docs/r3.4.0/hadoop-project-dist/hadoop-common/ClusterSetup.html)