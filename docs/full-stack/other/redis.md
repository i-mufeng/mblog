---
description: Redis 是一个开源（BSD许可）的，内存中的数据结构存储系统，它可以用作数据库、缓存和消息中间件。
categories: 
  - 技术笔记分享
tags: 
   - Redis
---


# Redis 自学笔记

## 一、Redis

> Redis官方网站：https://redis.io/

### 1.1 Redis简介

Redis 是一个开源（BSD许可）的，内存中的数据结构存储系统，它可以用作数据库、缓存和消息中间件。 它支持多种类型的数据结构，如 字符串（strings）， 散列（hashes）， 列表（lists）， 集合（sets）， 有序集合（sorted sets） 与范围查询， bitmaps， hyperloglogs 和 地理空间（geospatial） 索引半径查询。 Redis 内置了 复制（replication），LUA脚本（Lua scripting）， LRU驱动事件（LRU eviction），事务（transactions） 和不同级别的 磁盘持久化（persistence）， 并通过 Redis哨兵（Sentinel）和自动分区（Cluster）提供高可用性（high availability）。

### 1.2、Redis下载

> 下载地址：https://download.redis.io/releases/redis-6.2.5.tar.gz

Linux端下载：

```shell
wget https://download.redis.io/releases/redis-6.2.5.tar.gz
```

## 二、Redis安装

1. 解压

   ```shell
   tar -zxvf redis-6.2.5.tar.gz -C /usr/src
   ```

    - tar：Linux打包为tar的命令（-zxvf为解压tar.gz文件）
    - -C：指定解压目录（编译安装时习惯上源码都解压到`/usr/src`）

2. 编译安装

   > 在源码编译过程中，需要用到make命令，还需要安装c语言环境

   安装make和c语言环境：

   ```shell
   yum -y install gcc gcc-c++ make 
   ```

   转到源码所在的目录

   ```shell
   cd /usr/src/redis-6.2.5
   ```

   编译安装

   ```shell
   make PREFIX=/usr/local/redis install
   ```

    - make：编译
    - PREFIX：指定安装目录（编译安装过程中，一般将软件安装到`/usr/local`目录下）
    - install：安装



> 编译安装完成后，源码在`/usr/src/redis-6.2.5`目录下，安装在`/usr/local/redis`目录下
> 如果安装过程中出错，显示找不到某某某.h的文件，可能是你的环境缺少，这时在你安装了环境后重新编译时，可能会报错。
>
> 你需要使用`make distclean`清除之前编译安装生成的文件的重新开始编译安装

## 三、配置Redis

1. 在`/usr/local/redis`目录下，新建一个etc目录用于存放配置文件`redis.conf`

   ```shell
   cd /usr/local/redis/
   mkdir etc
   ```

2. 将`redis.conf`拷贝到刚才新建的目录下

   > 这里可以将原配置文件中的注释和空行全都过滤掉

   ```shell
   cat /usr/src/redis-6.2.5/redis.conf | grep -v '#' | grep -v '^$' > /usr/local/redis/etc/redis.conf
   ```

3. 配置Redis使其在启动后后台运行

   ```shell
   vim etc/redis.conf
   ```

   找到`daemonize`选项将其设置为yes

## 四、测试Redis

### 4.1 启动Redis

在目录下输入./bin/redis-server来使用默认配置启动


如果报错端口被占用

```
Could not create server TCP listening socket *:6379: bind: Address already in use
```

可以使用`lsof -i:6379`来查看6379端口的占用情况，在得到程序相关的`PID号`之后，可以使用`kill -9 PID`来杀死进程

使用配置文件启动

```shell
./bin/redis-server ./etc/redis.conf
```

### 4.2 连接Redis

```shell
./bin/redis-cli 
```

测试：

```shell
127.0.0.1:6379> ping
PONG
127.0.0.1:6379> ping mufeng
"mufeng"
```

> 至此，Redis的基础安装结束

## 五、Redis特性

### 5.1 Redis远程管理软件

链接地址：https://github.com/qishibo/AnotherRedisDesktopManager/releases

配置文件修改：

```
bind 0.0.0.0		#允许所有网段远程访问，如需多个网段访问，可以用空格隔开
protected-mode no	#关闭安全模式
```

> 需要开放防火墙端口

### 5.2 Redis配置文件解析

配置文件解析：https://www.runoob.com/redis/redis-conf.html

基础配置：

- `bind 0.0.0.0`    允许访问的地址
- `protected-mode no`    安全模式，默认打开
- `daemonize yes`    是否后台启动，默认为no，为前台启动
- `loglevel notice`    日志等级，有四个等级
- `logfile ""`     日志文件存储位置，默认在前台运行会输出到控制台，在后台运行会输出到`/dev/null`
- `databases 16`    默认有16个数据库，在Redis中，数据库并非严格隔离
- `port 6379`    Redis服务的默认端口号为6379
- `requirepass`

tail -f



### 5.3 Redis持久化策略

Redis持久化策略可以分为两种

- RDB快照
- AOF策略

#### 5.3.1 RDB内存快照

全量快照  会备份全部的数据，但是比较费时



触发方式：

1. `save`命令    在主线程中使用，不建议使用，会造成阻塞

   save会生成一个`dump.rdb`，下次启动会调取该文件

2. `bgsave`命令    后台创建（folk）一个子进程，专门用于写入rdb文件，避免主线程的阻塞

   一般情况下，该命令较快，但是有可能会造成save一样的问题

3. 自动触发

   ```conf
   save 3600 1		#在3600秒内有一个key发生变化，则触发一次快照
   save 300 100	#在300秒内有100个key发生变化，则触发一次快照
   save 60 1000	#在60秒内有1000个key发生变化，则触发一次快照
   ```

   `rdbcompression yes` 改配置一定要打开，代表生成RDB文件的时候，会压缩

#### 5.3.2 AOF（Append-only-file）策略

这个持久化策略类似于实时日志
在Redis写入数据到数据区之后，会同步将日志（执行的命令）写入到磁盘文件中，生成一个AOF文件
如果服务器挂掉，就会读取这些日志文件，执行所有的历史命令，还原数据

> 拓展：传统的数据库（mysql等）生成的日志都是redo（重做）日志

好处：不会造成阻塞

坏处：

1. 在写入数据之后如果服务器挂掉，最后一条执行的命令会丢失
2. 如果一个命令非常长，可能会造成下一个操作阻塞的风险

配置：

- `appendonly no` AOF策略，默认为关闭

- `appendfilename` AOF存储路径

- `appendfsync everysec`  写回策略，默认每一秒写回一次缓冲区的数据

  Redis提供了三种写回策略`fsync`：always，eyerysec，no

    - always  同步写回，每次命令执行完立刻同步。慢速的落盘操作
    - eyerysec  每一秒写回一次，每个命令执行完毕会将执行的命令写入内存缓冲区
    - no  并非不写回，而是由操作系统来决定什么时候将缓冲区的内容写回

  > 同步写回可以基本不丢失，但它是慢速的落盘操作，会很大的影响Redis的性能
  >
  > 每秒写回避免了性能开销，但是如果宕机，会造成一秒内的数据丢失
  >
  > 操作系统写回落盘的时机不归Redis的管理，存在极端的情况

  `综上，一般会选择每秒写回，平衡性能和风险`

**AOF重写机制**（rewrite）：

重写机制可以通过优化，将一些闭环的操作和批量的操作，进行删除和‘多变一’

AOF的重写机制和RDB的写回策略不同，重写机制实际是由主线程folk出的`bgrewriteaof`子进程进行的

 `“一个拷贝、两处日志”`

 **一个拷贝**：每次执行重写时，主线程会folk出子进程，此时folk会把主线程的内存拷贝一份给子进程。然后该子进程就可以在不阻塞主线程的情况下逐一写入重写的日志中

 **两处日志**：一个是主线程正在操作的AOF文件；另一个是子进程重写的日志文件

#### 5.3.3 两种持久化策略对比

1. 如果同时开启RDB和AOF，那么AOF的**优先级**比较高

2. 如果关闭了RDB，在单体的Redis环境中，只会按照AOF的策略进行持久化，但是在集群环境中，哪怕关闭了RDB，在第一次主从数据复制的时候，实际上主从节点会通过一次BGSAVE的全量复制来生成RDB给从节点复制

3. RGB和AOF**优劣对比**

    - 恢复速度：RDB存储数据并且经过压缩，所以快于AOF

    - 数据安全：

      RDB可能会丢失这一次的数据，数据量不一定

      AOF是根据写回策略来定义的

    - 量级：RDB是一刀切，比较重；AOF是一个追加日志的操作，较为轻量

### 5.4 Redis的内存回收/淘汰机制

#### 5.4.1 内存回收策略

| 策略名             | 说明                                   |
|-----------------|--------------------------------------|
| noevication     | 默认开启，当内存的使用量达到阈值时，所有的关于内存申请的命令都会直接报错 |
| allkeys-lru     | 一种lru算法，从所有的数据集中选取最近最少使用的进行淘汰        |
| allkeys-random  | 从所有的数据集中随机选取key删除                    |
| volatile-random | 从设置了过期时间的数据集中随机删除一个key               |
| volatile-ttl    | 从即将过期的数据中淘汰                          |
| volatile-lru    | 从已经设置了过期时间的数据集中选取最近最少使用的KV进行淘汰       |

## 六、Redis常用命令

https://redis.io/commands

Redis主要支持五种数据类型

- string
- list
- hash
- set
- sorted set (zset)

### 6.1 Redis通用指令

| 指令                      | 说明                                                                             |
|:------------------------|:-------------------------------------------------------------------------------|
| DBSIZE                  | 返回当前库KV数量                                                                      |
| SET key value           | 添加或修改KV                                                                        |
| GET key                 | 获取key对应的value                                                                  |
| DEL key *[key ...]*     | 批量删除key                                                                        |
| TYPE key                | 获取key的类型                                                                       |
| EXISTS key *[key ...]*  | 判断key是否存在                                                                      |
| EXPIRE key seconds      | 设置过期时间（单位：秒）                                                                   |
| TTL key                 | 查看指定key的过期时间                                                                   |
| SETNX key value         | 典型的`乐观锁`  将key设置为value<br />    如果key不存在，等用于SET，返回1<br />    如果key存在，就不做操作，返回0 |
| SELECT index(0-15)      | 选择数据库                                                                          |
| FLUSHDB *[ASYNC/SYNC]*  | 清空本数据库所有的key，选择同步和异步                                                           |
| FLUSHALL *[ASYNC/SYNC]* | 清空所有数据库的所有的key，可选同步或异步，默认异步                                                    |
| MOVE key db             | 移动key到其他DB，如果有相同的key就不会移动                                                      |
| RENAME key newkey       | 重命名key，如果新key存在，则会删除之前的key                                                     |
| RENAMENX key newkey     | 重命名，如果存在，则不作操作                                                                 |
| KEYS pattern            | 使用通配符匹配key                                                                     |



### 6.2 String类型

String类型在Redis中有两种存储方式

String通过int，SDS（Simple Dynamic Static）作为数据结构（支持自增自减）

redis在上`sds.h`里定义了五种string类型，目的为了节约内存。

    sdshdr5（没有被使用），sdshdr8（默认），sdshdr16等

建议：单个K-V虽然可以支持64位的长度（512M），但是实际项目中最好不要超过100k

#### 相关命令

| 命令                               | 说明                          |
|----------------------------------|-----------------------------|
| APPEND key value                 | 追加到key，返回追加后的长度             |
| MSET key value *[key value ...]* | 通过Redis管道批量写入数据             |
| MGET key *[key ...]*             | 通过Redis管道批量读取数据             |
| INCR key                         | 自增                          |
| DECR key                         | 自减                          |
| INCRBY key increment             | 以指定步长自增                     |
| DECRBY key increment             | 以指定步长自减                     |
| INCRBYFLOAT key increment        | 以指定步长（可以为浮点数）自增 `不存在以浮点数自减` |
| STRLEN key                       | 获取key对应的字符串长度               |
| GETRANGE key start end           | 以闭区间截取key对应的字符串             |
| SETRANGE key offset value        | 把某个区间内的值替换                  |
| SETEX key seconds value          | 设置key、过期时间、value            |



### 6.3 List类型

有序、可重复的列表 `QuickList` 是一种双向链表，每一个元素都是压缩列表类型

    在3.X版本之前使用双向链表`LinkedList`、`ZipList`存数据

当列表元素个数比较多或单个值比较大时，就不用zipList

#### 相关命令

| 命令                                | 说明                                  |
|-----------------------------------|-------------------------------------|
| LPUSH key element *[element ...]* | 从左压入list，后进的id更小                    |
| RPUSH key element *[element ...]* | 从右压入list，先入的di更小                    |
| LPOP key *[count]*                | 从左弹出list元素，count指定弹出的元素个数           |
| RPOP key *[count]*                | 从右弹出list元素，count指定弹出的元素个数           |
| LINDEX key index                  | 通过索引获取key的值（Lindex代表list的索引，并非left） |
| LLEN key                          | 获取list长度                            |
| LRANGE key start stop             | 区间遍历list（-1代表最后一个元素）                |
| LSET key index element            | 通过下标修改元素                            |

### 6.4 Hash类型

Filed-value相当于对象的属性名和属性值

在数据结构上Redis提供了两种数据结构

1. 数据量较小：ZibList
2. HashTable

在Redis中，Hash表分为三层：`dictEntry`，`dictht`，`dict`

先通过`murmur`算法计算key对应的`HashCode`，然后根据HashCode取模得到值，对应应该插入到哈希表（Hash Bucket）的位置

#### 相关命令

| 命令                                        | 说明                             |
|-------------------------------------------|--------------------------------|
| HSET key field value *[field value ...]*  | 设置hash表中的属性和值，返回新增的个数，如果是修改返回0 |
| HMSET key field value *[field value ...]* | 同上（4.0版本之前不同）                  |
| HGET key field *[field ...]*              | 获取hash表中属性对应的值                 |
| HMGET key field *[field ...]*             | 获取hash表中多个属性对应的值               |
| HLEN key                                  | 获取属性的个数                        |
| HGETALL key                               | 获取所有的属性名                       |
| HEXISTS key field                         | 判断某属性是否存在                      |
| HDEL key field *[field ...]*              | 删除某一个（些）属性，删除所有的属性会删除key       |
| HKEYS key                                 | 返回所有的属性名                       |
| HVALS key                                 | 返回所有的属性值                       |
| HINCRBY key field increment               | 自增某一个属性值（给负数则为自减）              |
| HSETNX key field value                    | 类比SETNX                        |

如果存储的对象需要经常修改，则建议存储为hash

如果只是存储，建议存储json字符串String

### 6.5 Set类型

**set**：无序、不重复的集合

单个set最多存储值的上限为2^32-1，在Redis内部使用散列表（hashtable）和intset（数值类型）

**散列表中的key永远都是null**

#### 相关命令

| 命令                              | 说明          |
|---------------------------------|-------------|
| SADD key member *[member ...]*  | 向集合中批量添加成员  |
| SREM key member *[member ...]*  | 批量删除成员      |
| SMEMBERS key                    | 获取所有的成员     |
| SPOP key *[count]*              | 弹出一个成员      |
| SMOVE source destination member | 移动一个成员到其他集合 |
|                                 |             |

### 6.6 sorted set (zset)类型

底层数据结构：ziplist或者skipList+HashTable

有序集合（ZSet）没有下标，不能重复。它和set区别只是将无序变成了有序。

#### 相关命令

| 命令                                          | 说明                                                                                            |
|---------------------------------------------|-----------------------------------------------------------------------------------------------|
| ZADD key score member *[score member ...]*  | 将具有指定分数的所有指定成员添加到一个zset中，也可以修改分数值，返回新增的成员个数                                                   |
| ZRANGE key min max                          | 返回存储在 的有序集合中指定范围的元素。<br />`<min>`和`<max>`参数表示基于零的索引，-1代表最后一个<br />`-inf`和`+inf`，分别表示负无穷大和正无穷大 |
| ZRANGEBYSCORE key min max                   | 这里的`<min>`和`<max>`参数表示分数值<br />需使用`-inf`和`+inf`<br />后边如果跟`[WITHSCORES]`可以返回分数值               |
| ZREVRANGE key start stop *[WITHSCORES]*     | 从大到小排列，rev表示翻转<br />Redis中默认都是从小到大排序，rev表示从大到小排序                                              |
| ZREVRANGEBYScore key max min *[WITHSCORES]* | 从大到小排序，类比`ZRANGEBYSCORE`，注意这里是max-min                                                         |
| ZCARD key                                   | 获取有序集合中的成员数量                                                                                  |
| ZCOUNT key min max                          | 获取有序集合介于某一范围的成员数量                                                                             |
| ZREM key member *[member ...]*              | 根据成员名删除成员                                                                                     |



### 其他

- redis事务

- 发布订阅：不支持消息积累

    PUBLISH channel message	发布消息
    
    SUBSCRIBE channel [channel ...]	订阅频道

- GEO

