---
tags: 
  - Linux
  - 架构
  - 运维
  - LAMP
category: Linux 运维
---



# 第三步 编译安装PHP

## 1、安装前准备

```
#编译安装libmcrypt
[root@localhost app]# tar -xvf /app/packages/libmcrypt-2.5.8.tar.xz -C /app/
[root@localhost libmcrypt-2.5.8]# ./configure --prefix=/usr/local/libmcrypt
[root@localhost libmcrypt-2.5.8]# make && make install

#编译安装mhash
[root@localhost libmcrypt-2.5.8]# tar -xvf /app/packages/mhash-0.9.9.9.tar.xz -C /app/
[root@localhost mhash-0.9.9.9]# ./configure --prefix=/usr/local/mhash
[root@localhost mhash-0.9.9.9]# make && make install

#编译安装mcrypt
[root@localhost libmcrypt-2.5.8]# tar -xvf /app/packages/mcrypt-2.6.8.tar.xz -C /app/
[root@localhost mcrypt-2.6.8]# export LD_LIBRARY_PATH=/usr/local/libmcrypt/lib:/usr/local/mhash/lib 
[root@localhost mcrypt-2.6.8]# export LDFLAGS="-L/usr/local/mhash/lib -I/usr/local/mhash/include/" 
[root@localhost mcrypt-2.6.8]# export CFLAGS="-I/usr/local/mhash/include/" 
[root@localhost mcrypt-2.6.8]# ./configure --prefix=/usr/local/mcrypt --with-libmcrypt-prefix=/usr/local/libmcrypt
[root@localhost mcrypt-2.6.8]# make && make install
#编译安装oniguruma
[root@localhost packages]wget https://github.com/kkos/oniguruma/archive/v6.9.4.tar.gz -O oniguruma-6.9.4.tar.gz 
[root@localhost ~]# tar -xvf /app/packages/oniguruma-6.9.4.tar.gz -C /app/
[root@localhost oniguruma-6.9.4]# pwd
/app/oniguruma-6.9.4
[root@localhost oniguruma-6.9.4]# ./autogen.sh && ./configure --prefix=/usr #这里安装路径只能指定/usr
[root@localhost oniguruma-6.9.4]# make && make install
[root@localhost app]# dnf -y install libxml2-devel krb5-devel openssl-devel sqlite-devel libcurl-devel libxslt-devel  libjpeg-devel libzip-devel bzip2-devel libpng-devel  freetype-devel 
```

## 2、php编译选项参考

```
./configure --prefix=/usr/local/php --with-apxs2=/usr/local/apache/bin/apxs  --with-config-file-path=/usr/local/php/etc  --with-mysql --with-mysqli  --with-pdo-mysql --with-mysql-sock=/var/lib/mysql/mysql.sock  --enable-mbstring --enable-session --enable-fpm --enable-opcache --enable-fastcgi --with-fpm-user=daemon  --with-curl  --with-openssl --with-zlib --with-fpm-group=daemon  --enable-gd  --with-libmcrypt=/usr/local/libmcrypt --with-mcrypt=/usr/local/mcrypt  --with-freetype --with-jpeg --with-gettext  --enable-sockets --enable-xml --with-zip --with-libdir=lib64  --with-libxml --with-openssl --with-pear   -with-bz2  --with-session
```

## 3、解压包

```
[root@localhost app]# tar -xvf /app/packages/php-7.4.11.tar.xz -C /app/
```

## 4、编译安装

```
[root@localhost php-7.4.11]# ./configure --prefix=/usr/local/php --with-apxs2=/usr/local/apache/bin/apxs  --with-config-file-path=/usr/local/php/etc  --with-mysql --with-mysqli  --with-pdo-mysql --with-mysql-sock=/var/lib/mysql/mysql.sock  --enable-mbstring --enable-session --enable-fpm --enable-opcache --enable-fastcgi --with-fpm-user=daemon  --with-curl  --with-openssl --with-zlib --with-fpm-group=daemon  --enable-gd  --with-libmcrypt=/usr/local/libmcrypt --with-mcrypt=/usr/local/mcrypt  --with-freetype --with-jpeg --with-gettext  --enable-sockets --enable-xml --with-zip --with-libdir=lib64  --with-libxml --with-openssl --with-pear   -with-bz2  --with-session
[root@localhost php-7.4.11]# make && make install
```

## 5、创建配置文件

```
[root@localhost php-7.4.11]# pwd
/app/php-7.4.11
[root@localhost php-7.4.11]# cp -rf php.ini-production /usr/local/php/etc/php.ini

[root@localhost php-fpm.d]# pwd
/usr/local/php/etc/php-fpm.d
[root@localhost php-fpm.d]# cp -rf www.conf.default www.conf

[root@localhost etc]# pwd
/usr/local/php/etc
[root@localhost etc]# cp -rf php-fpm.conf.default php-fpm.conf

[root@localhost php]# pwd
/usr/local/php
[root@localhost php]# mkdir daemon

[root@localhost php-7.4.11]# pwd
/app/php-7.4.11     
[root@localhost php-7.4.11]# cp -rf sapi/fpm/init.d.php-fpm /usr/local/php/daemon/php-fpm

[root@localhost php]# cd daemon/
[root@localhost daemon]# pwd
/usr/local/php/daemon
[root@localhost daemon]# chmod 777 -R php-fpm 
```

## 6、测试启动php-fpm

```
[root@localhost daemon]# ./php-fpm start
Starting php-fpm  done
[root@localhost daemon]# ps auxfww | grep php | grep -v grep
root      132055  0.0  0.1 123664 10848 ?        Ss   16:53   0:00 php-fpm: master process (/usr/local/php/etc/php-fpm.conf)
daemon    132056  0.0  0.1 149940 10048 ?        S    16:53   0:00  \_ php-fpm: pool www
daemon    132057  0.0  0.1 149940 10048 ?        S    16:53   0:00  \_ php-fpm: pool www
```

## 7、配置php支持apache

### 7.1 编辑Apache配置文件

```
[root@localhost ~]# vim /usr/local/apache/conf/httpd.conf
#找到AddType 添加：
    AddType application/x-httpd-php .php
    AddType application/x-httpd-php-source .phps 
#找到
<IfModule dir_module>
    DirectoryIndex index.html
</IfModule>
#改为
<IfModule dir_module>
    DirectoryIndex index.html index.php
</IfModule>
```

### 7.2 编辑php.ini

```
[root@localhost ~]# vim /usr/local/php/etc/pht.ini
#找到display_startup_errors 和 log_errors
#改为：
log_errors = On
display_startup_errors = On
```

### 7.3 重启php apache

```
[root@localhost ~]# /usr/local/php/daemon/php-fpm restart
Gracefully shutting down php-fpm . done
Starting php-fpm  done
[root@localhost ~]# /usr/local/apache/bin/apachectl -k restart
```

### 7.4 验证

将一个php页面放到/usr/local/apache/htdocs

浏览器访问虚拟机ip

注：构建服务所需的包可在[server_source_2020.iso ](https://download.csdn.net/download/qq_45417634/13208956)请自行下载，您也可以在所需安装包官网下载
本地源配置、防火墙、selinux等是linux较为基础的内容，不再赘述。
本文均为原创，如需与博主交流可email至mufeng.yu@qq.com