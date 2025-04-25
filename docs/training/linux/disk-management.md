---
title: Linux 磁盘管理 - 记一次分区格式化
description: 通过一次虚拟化平台服务器新加磁盘的操作，讨论 Linux 平台磁盘管理、分区格式化的操作。
categories: 
   - 折腾日记
tags: 
   - Linux
   - 运维
   - 磁盘管理
outline: [2,3]
date: 2025-4-25 17:20:00
head:
  - - meta
    - name: keywords
      content: Linux, 运维, fdisk, parted, 磁盘管理, 磁盘工具, 分区格式化
---

# Linux 磁盘管理 - 记一次分区格式化

> 注意：
>
> - 数据无价，谨慎操作！！！
> - 具体业务敏感部分已做脱敏处理，示例服务器域为 `mufeng.dev`

我们有个业务项目使用华为 **FusionCompute** 搭建了一套私有云平台，属于比较高的配置，该教程记录一次操作系统加磁盘后进行分区格式化的操作。

- 虚拟化平台：华为 Fusion Compute
- 操作系统版本：AlmaLinux 9.5

## 一、准备工作

### 1.1 简介

平台图形化界面新增磁盘，此处不再赘述，新增后进入系统，查看属性如下：

```
[root@mufeng /]# df -h
Filesystem                  Size  Used Avail Use% Mounted on
devtmpfs                    4.0M     0  4.0M   0% /dev
tmpfs                        16G     0   16G   0% /dev/shm
tmpfs                       6.3G   14M  6.3G   1% /run
/dev/mapper/almalinux-root   89G  3.2G   86G   4% /
/dev/vda1                   960M  233M  728M  25% /boot
tmpfs                       3.2G  4.0K  3.2G   1% /run/user/0
```

```
[root@mufeng /]# fdisk -l
Disk /dev/vda: 100 GiB, 107374182400 bytes, 209715200 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0xa81ec275

Device     Boot   Start       End   Sectors Size Id Type
/dev/vda1  *       2048   2099199   2097152   1G 83 Linux
/dev/vda2       2099200 209715199 207616000  99G 8e Linux LVM


Disk /dev/vdb: 1000 GiB, 1073741824000 bytes, 2097152000 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes


Disk /dev/mapper/almalinux-root: 89 GiB, 95558828032 bytes, 186638336 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes


Disk /dev/mapper/almalinux-swap: 10 GiB, 10737418240 bytes, 20971520 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
```

可以看到，系统盘为 100Gb，除去 10Gb 的 SWAP 分区以及 `/boot` 分区以外，其余均挂载在 `/` 根目录下。我们现在需要对该磁盘进行操作。

规划如下：

| 分区 | 大小    | 内容 | 挂载点          |
| ---- |-------| ---- | --------------- |
| 1    | 300Gb | 服务 | /mufeng/service |
| 2    | 700Gb | 数据 | /mufeng/data    |

### 1.2 fdisk 工具简介

`fdisk` 是一个老牌的磁盘管理工具，你可以经常在各个 Linux 相关教程中看到他的介绍，它功能强大，并且操作简单。但他它原本只支持 MBR 分区，对 GPT 分区的支持并不好，存在较大的局限性。

fdisk 显示磁盘分区情况：

```text
[root@mufeng ~]# fdisk -lu /dev/vda
Disk /dev/vda: 100 GiB, 107374182400 bytes, 209715200 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0xa81ec275

Device     Boot   Start       End   Sectors Size Id Type
/dev/vda1  *       2048   2099199   2097152   1G 83 Linux
/dev/vda2       2099200 209715199 207616000  99G 8e Linux LVM
```

fdisk 磁盘操作：

```text
[root@mufeng ~]# fdisk /dev/vdb

Welcome to fdisk (util-linux 2.37.4).
Changes will remain in memory only, until you decide to write them.
Be careful before using the write command.

Device does not contain a recognized partition table.
Created a new DOS disklabel with disk identifier 0x54ac059e.

Command (m for help): 
```

将需要操作的磁盘作为参数传递给 fdisk，即可操作磁盘进行分区。

键入 m 即可查看命令详解：

```
Command (m for help): m

Help: 
  DOS (MBR)  
   a   toggle a bootable flag          # 切换分区的可引导标志（设置或取消分区为可引导）  
   b   edit nested BSD disklabel       # 编辑嵌套的BSD磁盘标签（用于BSD系统分区）  
   c   toggle the dos compatibility flag  # 切换DOS兼容性标志（用于某些旧系统兼容性）  

  Generic  
   d   delete a partition              # 删除一个分区  
   F   list free unpartitioned space   # 列出未分区的空闲空间  
   l   list known partition types      # 列出已知的分区类型  
   n   add a new partition             # 添加一个新分区  
   p   print the partition table       # 打印分区表  
   t   change a partition type         # 更改分区类型  
   v   verify the partition table      # 验证分区表的正确性  
   i   print information about a partition  # 打印关于某个分区的详细信息  

  Misc  
   m   print this menu                 # 打印此帮助菜单  
   u   change display/entry units      # 改变显示/输入单位（如从扇区到MB等）  
   x   extra functionality (experts only)  # 额外功能（仅限专家使用）  

  Script  
   I   load disk layout from sfdisk script file  # 从sfdisk脚本文件加载磁盘布局  
   O   dump disk layout to sfdisk script file    # 将磁盘布局导出到sfdisk脚本文件  

  Save & Exit  
   w   write table to disk and exit    # 将分区表写入磁盘并退出  
   q   quit without saving changes     # 退出而不保存更改  

  Create a new label  
   g   create a new empty GPT partition table  # 创建一个新的空的GPT分区表  
   G   create a new empty SGI (IRIX) partition table  # 创建一个新的空的SGI（IRIX）分区表  
   o   create a new empty DOS partition table  # 创建一个新的空的DOS分区表  
   s   create a new empty Sun partition table  # 创建一个新的空的Sun分区表  

```

### 1.3 parted 工具简介

`parted` 是一个强大的分区工具，支持 MBR 和 GPT以及 SUN 等小众的分区表。相比于 fdisk，它更加现代化，除了分区的创建删除之外，它还支持更加复杂的操作。例如：调整分区大小、移动分区、备份分区表等。

parted 显示磁盘分区信息：

```
[root@mufeng ~]# parted -l
Error: /dev/vdb: unrecognised disk label
Model: Virtio Block Device (virtblk)                                      
Disk /dev/vdb: 1074GB
Sector size (logical/physical): 512B/512B
Partition Table: unknown
Disk Flags: 

Warning: Unable to open /dev/sr0 read-write (Read-only file system).  /dev/sr0
has been opened read-only.
Model: QEMU QEMU DVD-ROM (scsi)                                           
Disk /dev/sr0: 2124MB
Sector size (logical/physical): 2048B/2048B
Partition Table: msdos
Disk Flags: 

Number  Start   End     Size    Type     File system  Flags
 2      28.8MB  58.0MB  29.2MB  primary               esp


Model: Virtio Block Device (virtblk)
Disk /dev/vda: 107GB
Sector size (logical/physical): 512B/512B
Partition Table: msdos
Disk Flags: 

Number  Start   End     Size    Type     File system  Flags
 1      1049kB  1075MB  1074MB  primary  xfs          boot
 2      1075MB  107GB   106GB   primary               lvm
```



parted 提供命令行模式以及交互模式，如下:

命令行模式下，parted 支持同时执行多个命令，但是不推荐这种方式操作磁盘：

```bash
parted /dev/sda mklabel gpt mkpart P1 xfs 1MiB 200GB
```

以上命令表示操作磁盘 `/dev/sda`，创建新的 GPT 分区表，然后创建一个 200GB 的分区。

交互模式：

与 fdisk 的交互模式类似，交互模式简化了分区过程，并自动将所有命令应用到指定的设备上，无需反复指定目标设备。

命令如下：

```
[root@mufeng ~]# parted
GNU Parted 3.5
Using /dev/vdb
Welcome to GNU Parted! Type 'help' to view a list of commands.
(parted) help                                                             
  align-check TYPE N                       检查分区 N 是否符合 TYPE(min|opt) 对齐
  help [COMMAND]                           打印一般帮助信息，或指定 COMMAND 的帮助
  mklabel,mktable LABEL-TYPE               创建一个新的磁盘标签（分区表）
  mkpart PART-TYPE [FS-TYPE] START END     创建一个分区，可以指定分区格式
  name NUMBER NAME                         将分区 NUMBER 命名为 NAME
  print [devices|free|list,all]            显示分区表，或可用设备，或空闲空间，或所有找到的分区
  quit                                     退出程序
  rescue START END                         在 START 和 END 附近恢复丢失的分区
  resizepart NUMBER END                    调整分区 NUMBER 的大小
  rm NUMBER                                删除分区 NUMBER
  select DEVICE                            选择要编辑的设备
  disk_set FLAG STATE                      改变选定设备的 FLAG 状态
  disk_toggle [FLAG]                       切换选定设备的 FLAG 状态
  set NUMBER FLAG STATE                    改变分区 NUMBER 的 FLAG 状态
  toggle [NUMBER [FLAG]]                   切换分区 NUMBER 的 FLAG 状态
  type NUMBER TYPE-ID or TYPE-UUID         设置分区 NUMBER 的类型为 TYPE-ID 或 TYPE-UUID
  unit UNIT                                设置默认单位为 UNIT
  version                                  显示 GNU Parted 的版本号和版权信息
(parted)
```

### 1.3 mkfs 磁盘格式化工具

`fdisk` 和 `parted` 在创建分区时可以直接进行格式化，也可以使用 `mkfs` 专门对分区进行格式化。它支持多种文件系统，例如：

- **创建 `ext4` 文件系统**：

  ```bash
  sudo mkfs.ext4 /dev/sda1
  ```

- **创建 `xfs` 文件系统**：

  ```bash
  sudo mkfs.xfs /dev/sda1
  ```

- **创建 `ntfs` 文件系统**：

  ```bash
  sudo mkfs.ntfs /dev/sda1
  ```

同理，我们还可以用它创建 fat32 等文件系统，此处不再一一列举，详见文档。

### 1.4 mount命令简介

在磁盘完成分区格式化操作之后，我们还需要将磁盘挂载到文件系统，与 Windows 可以多个逻辑盘不同的是，Linux 是一个树状结构，它需要将磁盘挂载到某个目录，以此生效，硬盘的一个分区被称为一个 `存储设备`，挂载到的目标目录叫做 `挂载点`。

我们可以通过 lsblk 命令查看当前文件系统的结构：

```text
[root@mufeng ~]# lsblk
NAME               MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS
sr0                 11:0    1    2G  0 rom  
vda                252:0    0  100G  0 disk 
├─vda1             252:1    0    1G  0 part /boot
└─vda2             252:2    0   99G  0 part 
  ├─almalinux-root 253:0    0   89G  0 lvm  /
  └─almalinux-swap 253:1    0   10G  0 lvm  [SWAP]
vdb                252:16   0 1000G  0 disk 
```

我们可以看到，每个磁盘分出分区，分区又对应挂载点。其中 `sr0` 是光驱，是一种特殊的、只读的存储设备。

我们使用 `mount` 进行挂载操作：

```bash
mount /dev/sda1 /mnt/mydisk
```

如果存储设备有文件系统（如 `ext4`），`mount` 命令会自动识别并挂载。如果需要指定文件系统类型，可以使用 `-t` 选项：

```bash
mount -t ext4 /dev/sda1 /mnt/mydisk
```

使用 `df -h` 即可查看挂载情况。

```text
[root@mufeng ~]# df -h
Filesystem                  Size  Used Avail Use% Mounted on
devtmpfs                    4.0M     0  4.0M   0% /dev
tmpfs                        16G     0   16G   0% /dev/shm
tmpfs                       6.3G   17M  6.3G   1% /run
/dev/mapper/almalinux-root   89G  3.2G   86G   4% /
/dev/vda1                   960M  233M  728M  25% /boot
tmpfs                       3.2G  4.0K  3.2G   1% /run/user/0
```

上述直接 `mount [存储设备] [挂载点]` 的操作会在系统重启后消失，如果需要永久保留该挂载，需要将设备挂载信息写入 `/etc/fstab` 文件。该文件信息如下：

```
/dev/mapper/almalinux-root /                       xfs     defaults        0 0
UUID=f89a0677-c2ec-486e-9e68-808c14cc447e /boot    xfs     defaults        0 0
/dev/mapper/almalinux-swap none                    swap    defaults        0 0
```

该文件格式为：`<设备（或者其UUID）> <挂载点> <文件系统> <挂载选项> <备份频率> <检查顺序>`，详见官方文档。

挂载光驱的写法示例：`/dev/cdrom /mnt/cdrom iso9660 defaults 0 0`

挂载文件后，我们可以使用 `blkid` 命令查看磁盘对应 id。

编辑该文件后，执行 `mount -a` 即可将该文件规定的挂载点重新挂载。

## 二、开始操作

### 2.1 分区操作

1. 使用 parted 进行分区操作。

   ```text
   [root@mufeng ~]# parted /dev/vdb
   GNU Parted 3.5
   Using /dev/vdb
   Welcome to GNU Parted! Type 'help' to view a list of commands.
   ```

2. 创建分区表为 GPT

   ```text
   (parted) mklabel
   New disk label type? GPT                                                  
   ```

3. 创建第一个分区

   ```text
   (parted) mkpart perimary 1MB 30%
   ```

4. 创建第二个分区

   ```
   (parted) mkpart perimary 30% 100%
   ```

5. 检查分区对齐

   ```text
   (parted) align-check min 
   Partition number? 1                                                       
   1 aligned
   (parted) align-check min                                                  
   Partition number? 2                                                       
   2 aligned
   ```

6. 退出 parted

   ```text
   (parted) quit                                                             
   Information: You may need to update /etc/fstab.
   ```



### 2.2 分区格式化

```
[root@mufeng mufeng]# mkfs.xfs /dev/vdb1 
meta-data=/dev/vdb1              isize=512    agcount=4, agsize=19660736 blks
         =                       sectsz=512   attr=2, projid32bit=1
         =                       crc=1        finobt=1, sparse=1, rmapbt=0
         =                       reflink=1    bigtime=1 inobtcount=1 nrext64=0
data     =                       bsize=4096   blocks=78642944, imaxpct=25
         =                       sunit=0      swidth=0 blks
naming   =version 2              bsize=4096   ascii-ci=0, ftype=1
log      =internal log           bsize=4096   blocks=38399, version=2
         =                       sectsz=512   sunit=0 blks, lazy-count=1
realtime =none                   extsz=4096   blocks=0, rtextents=0
Discarding blocks...Done.
```

```
[root@mufeng mufeng]# mkfs.xfs /dev/vdb2
meta-data=/dev/vdb2              isize=512    agcount=4, agsize=45875136 blks
         =                       sectsz=512   attr=2, projid32bit=1
         =                       crc=1        finobt=1, sparse=1, rmapbt=0
         =                       reflink=1    bigtime=1 inobtcount=1 nrext64=0
data     =                       bsize=4096   blocks=183500544, imaxpct=25
         =                       sunit=0      swidth=0 blks
naming   =version 2              bsize=4096   ascii-ci=0, ftype=1
log      =internal log           bsize=4096   blocks=89599, version=2
         =                       sectsz=512   sunit=0 blks, lazy-count=1
realtime =none                   extsz=4096   blocks=0, rtextents=0
Discarding blocks...Done.
```

### 2.3 挂载

1. 挂载

   创建挂载点：批量创建

   ```text
   [root@mufeng ~]# mkdir -p /mufeng/{service,data}
   ```

   挂载：

   ```text
   [root@mufeng mufeng]# mount /dev/vdb1 /mufeng/service/
   [root@mufeng mufeng]# mount /dev/vdb2 /mufeng/data/
   ```

2. 查看磁盘 UUID

   ```TEXT
   [root@mufeng mufeng]# blkid 
   /dev/mapper/almalinux-swap: UUID="2fc87e59-234a-4f21-946c-5fd131d44a72" TYPE="swap"
   /dev/sr0: UUID="2024-11-13-09-58-49-00" LABEL="AlmaLinux-9-5-x86_64-dvd" TYPE="iso9660" PTUUID="096dfde5" PTTYPE="dos"
   /dev/mapper/almalinux-root: UUID="48cef2c2-9723-477a-90de-08cfc56fe9e9" TYPE="xfs"
   /dev/vda2: UUID="dbf4S2-DQJT-BjG5-UzCO-52Yl-S4Zq-heJHCW" TYPE="LVM2_member" PARTUUID="a81ec275-02"
   /dev/vda1: UUID="f89a0677-c2ec-486e-9e68-808c14cc447e" TYPE="xfs" PARTUUID="a81ec275-01"
   /dev/vdb2: UUID="71d3726a-61b8-4d2f-8be3-a3e0fe9f63da" TYPE="xfs" PARTLABEL="perimary" PARTUUID="39e9c0f7-cde4-442c-a996-cc0f15e053f3"
   /dev/vdb1: UUID="5dc8d086-b972-4d86-93b9-7a5d8d45df26" TYPE="xfs" PARTLABEL="perimary" PARTUUID="f7340660-3a9c-449e-acf0-7feafdb678be"
   ```

3. 编辑挂载表

   ```
   [root@mufeng mufeng]# vim /etc/fstab 
   ```

   ```
   /dev/mapper/almalinux-root                      /                       xfs     defaults        0 0
   UUID=f89a0677-c2ec-486e-9e68-808c14cc447e       /boot                   xfs     defaults        0 0
   /dev/mapper/almalinux-swap                      none                    swap    defaults        0 0
   UUID=5dc8d086-b972-4d86-93b9-7a5d8d45df26       /mufeng/service         xfs     defaults        0 0
   UUID=71d3726a-61b8-4d2f-8be3-a3e0fe9f63da       /mufeng/data         xfs     defaults        0 0
   ```

4. 执行挂载

   ```
   [root@mufeng mufeng]# mount -a
   ```

### 2.4 查看结果

```
[root@mufeng mufeng]# lsblk
NAME               MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS
sr0                 11:0    1    2G  0 rom  
vda                252:0    0  100G  0 disk 
├─vda1             252:1    0    1G  0 part /boot
└─vda2             252:2    0   99G  0 part 
  ├─almalinux-root 253:0    0   89G  0 lvm  /
  └─almalinux-swap 253:1    0   10G  0 lvm  [SWAP]
vdb                252:16   0 1000G  0 disk 
├─vdb1             252:17   0  300G  0 part /mufeng/service
└─vdb2             252:18   0  700G  0 part /mufeng/data
```

至此，该磁盘的新建以及分区挂载操作完成！