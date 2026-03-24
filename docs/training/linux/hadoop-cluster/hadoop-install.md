---
title: 第三章 Hadoop 集群部署
description: 介绍三节点环境下 Hadoop 的安装、配置、分发、初始化与启动流程，涵盖 HDFS、YARN、MapReduce 的基础配置。
categories:
  - Linux 分布式集群
outline: [2,3]
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
      content: Linux企业级运维, 分布式, Linux, 架构, Hadoop, 大数据, HDFS, YARN
cover: https://cdn.imufeng.cn/mblog/202411161444264.png
---

# 第三章 Hadoop 集群部署

完成基础环境准备后，就可以开始部署 Hadoop 集群。本章以三台节点为例，介绍 Hadoop 3.4.x 的安装、配置分发与启动方式。

## 一、节点角色规划

本示例中的节点角色如下：

| 节点 | 角色 |
| --- | --- |
| Master | NameNode / ResourceManager / NodeManager / DataNode |
| Node01 | DataNode / NodeManager |
| Node02 | DataNode / NodeManager |

这种规划适合学习与实验环境。生产环境中通常会进一步拆分 NameNode、ResourceManager，甚至部署高可用方案。

## 二、下载安装 Hadoop

可以前往 Apache 官方发布页选择合适版本。本文以 `Hadoop 3.4.0` 为例：

```bash
cd /opt/
curl -O https://dlcdn.apache.org/hadoop/common/hadoop-3.4.0/hadoop-3.4.0.tar.gz
tar -zxf hadoop-3.4.0.tar.gz -C /usr/local/
cd /usr/local/
mv hadoop-3.4.0 hadoop
```

安装后目录大致如下：

```text
bin/
etc/
include/
lib/
libexec/
licenses-binary/
LICENSE.txt
NOTICE.txt
README.txt
sbin/
share/
```

## 三、配置环境变量

可在 `/etc/profile` 或当前用户的 shell 配置中加入以下内容：

```bash
export JAVA_HOME=/usr/local/jdk-8
export HADOOP_HOME=/usr/local/hadoop
export PATH=$PATH:$JAVA_HOME/bin:$HADOOP_HOME/bin:$HADOOP_HOME/sbin
```

保存后执行：

```bash
source /etc/profile
```

验证安装：

```bash
hadoop version
```

能正确输出版本信息即表示二进制安装成功。

## 四、核心配置文件说明

Hadoop 的主要配置位于 `$HADOOP_HOME/etc/hadoop/` 下，常用文件包括：

```text
core-site.xml
hdfs-site.xml
mapred-site.xml
yarn-site.xml
workers
hadoop-env.sh
```

其中：

- `core-site.xml`：定义 Hadoop 基础行为，如默认文件系统。
- `hdfs-site.xml`：定义 HDFS 存储、副本和元数据位置。
- `mapred-site.xml`：定义 MapReduce 执行框架。
- `yarn-site.xml`：定义资源管理与节点管理配置。
- `workers`：列出 DataNode / NodeManager 所在节点。
- `hadoop-env.sh`：定义 Java 环境和启动用户等基础变量。

## 五、配置 Hadoop

### 5.1 `hadoop-env.sh`

```bash
export JAVA_HOME=/usr/local/jdk-8

export HDFS_NAMENODE_USER="root"
export HDFS_DATANODE_USER="root"
export HDFS_SECONDARYNAMENODE_USER="root"
export YARN_RESOURCEMANAGER_USER="root"
export YARN_NODEMANAGER_USER="root"
```

实验环境中直接使用 `root` 用户管理服务更方便；生产环境建议拆分为专用账户。

### 5.2 `core-site.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
<configuration>
    <property>
        <name>fs.defaultFS</name>
        <value>hdfs://master.local:9000</value>
    </property>
</configuration>
```

### 5.3 `workers`

```text
master.local
node01.local
node02.local
```

### 5.4 `hdfs-site.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
<configuration>
    <property>
        <name>dfs.replication</name>
        <value>3</value>
    </property>

    <property>
        <name>dfs.permissions.enabled</name>
        <value>false</value>
    </property>

    <property>
        <name>dfs.namenode.http-address</name>
        <value>master.local:9870</value>
    </property>

    <property>
        <name>dfs.namenode.name.dir</name>
        <value>file:/data/hadoop/namenode/</value>
    </property>

    <property>
        <name>dfs.datanode.data.dir</name>
        <value>file:/data/hadoop/datanode/</value>
    </property>
</configuration>
```

### 5.5 `yarn-site.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
<configuration>
    <property>
        <name>yarn.admin.acl</name>
        <value>*</value>
    </property>

    <property>
        <name>yarn.resourcemanager.hostname</name>
        <value>master.local</value>
    </property>

    <property>
        <name>yarn.nodemanager.aux-services</name>
        <value>mapreduce_shuffle</value>
    </property>
</configuration>
```

### 5.6 `mapred-site.xml`

如果目录中只有 `mapred-site.xml.template`，可以先复制一份：

```bash
cd /usr/local/hadoop/etc/hadoop/
cp mapred-site.xml.template mapred-site.xml
```

然后配置：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
<configuration>
    <property>
        <name>mapreduce.framework.name</name>
        <value>yarn</value>
    </property>
</configuration>
```

## 六、分发 Hadoop 到其他节点

建议先在 Master 完成全部安装和配置，再将软件目录同步到其他节点。

如果你已经准备了批量同步脚本 `ms`，可以直接执行：

```bash
ms /usr/local/hadoop/
```

如果没有该脚本，也可以使用 `scp -r` 手动分发。

同步完成后，确保所有节点上的安装路径保持一致，并分别检查环境变量是否已生效。

## 七、初始化 NameNode

第一次启动 HDFS 前，必须先在 Master 节点初始化 NameNode：

```bash
hdfs namenode -format
```

初始化成功后，会在 `dfs.namenode.name.dir` 对应目录中生成元数据文件，例如：

```text
/data/hadoop/namenode/current/
```

其中通常可以看到 `VERSION`、`fsimage`、`seen_txid` 等文件。

## 八、启动集群

### 8.1 一键启动

在已配置 SSH 免密的前提下，可以直接在 Master 节点执行：

```bash
start-all.sh
```

停止集群：

```bash
stop-all.sh
```

### 8.2 分别启动 HDFS 与 YARN

如果希望分开管理，也可以执行：

```bash
start-dfs.sh
start-yarn.sh
```

对应停止命令：

```bash
stop-dfs.sh
stop-yarn.sh
```

## 九、验证集群状态

### 9.1 检查 Java 进程

在三台节点上分别执行：

```bash
jps
```

正常情况下可以看到：

- Master：`NameNode`、`ResourceManager`、`DataNode`、`NodeManager`
- Node01 / Node02：`DataNode`、`NodeManager`

### 9.2 查看 Web UI

Hadoop 默认提供 NameNode 管理页面，可通过以下地址访问：

```text
http://master.local:9870/
```

可在页面中查看：

- HDFS 基础状态
- DataNode 列表
- 存储容量与副本信息
- 文件系统浏览

## 十、本章小结

完成本章后，你应当已经得到一套可正常运行的三节点 Hadoop 基础集群。后续即可在其上继续部署 ZooKeeper 与 Hive 等生态组件。

## 参考内容

- [Apache Hadoop Release Notes](https://hadoop.apache.org/releases.html)
- [Apache Hadoop Cluster Setup](https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-common/ClusterSetup.html)
