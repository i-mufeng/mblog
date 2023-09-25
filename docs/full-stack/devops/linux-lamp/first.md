---
tags: 
  - Linux
  - 架构
  - 运维
  - LAMP
category: Linux 运维
---

# 第一步 编译安装httpd服务器

# 1、安装前准备

解压apr apr-util pcre httpd expat包

```
[root@localhost app]# tar -xvf apr-1.6.5.tar.xz -C /app/
[root@localhost app]# tar -xvf apr-util-1.6.1.tar.xz -C /app/
[root@localhost app]# tar -xvf pcre-8.42.tar.xz -C /app/
[root@localhost app]# tar -xvf httpd-2.4.46.tar.xz -C /app/

[root@localhost app]# ls
apr-1.6.5  apr-util-1.6.1  httpd-2.4.46  packages  pcre-8.42

```

安装软件支持

```
[root@localhost apr-1.6.5]# dnf -y install gcc gcc-c++ make cmake gdb libstdc++* 
```

# 2、编译安装apr

```
[root@localhost apr-1.6.5]# pwd
/app/apr-1.6.5

[root@localhost apr-1.6.5]# ./configure --prefix=/usr/local/apr

[root@localhost apr-1.6.5]# make && make install
```

这里运行编译文件时可能会报错

```
rm: cannot remove 'libtoolT': No such file or directory
```

解决：

```
[root@localhost apr-1.6.5]# vim configure
#把RM='$RM'改为RM='$RM  -f'
```

# 3、编译安装expat

```
[root@localhost expat-2.2.3]# pwd
/app/expat-2.2.3
[root@localhost expat-2.2.3]# ./configure --prefix=/usr/local/expat
make && make install
```

# 4、编译安装apr-util

```
[root@localhost apr-util-1.6.1]# pwd
/app/apr-util-1.6.1
[root@localhost apr-util-1.6.1]# ./configure --prefix=/usr/local/apr-util --with-apr=/usr/local/apr --with-expat=/usr/local/expat
make && make install
```

# 5、编译安装pcre

```
[root@localhost pcre-8.42]# pwd
/app/pcre-8.42
[root@localhost pcre-8.42]# ./configure --prefix=/usr/local/pcre
[root@localhost pcre-8.42]# make && make install
```

# 6、编译安装httpd

```
[root@localhost httpd-2.4.46]# pwd
/app/httpd-2.4.46
[root@localhost httpd-2.4.46]# ./configure --prefix=/usr/local/apache --with-apr=/usr/local/apr --with-apr-util=/usr/local/apr-util --with-pcre=/usr/local/pcre  --enable-so   --enable-rewrite --enable-ssl  --with-ssl=/usr/lib  --enable-auth-digest --enable-cgi --enable-suexec  --with-suexec-caller=daemon --with-suexec-docroot=/usr/local/apache/htdocs
#这里的编译选项应当是需要什么加什么，具体选项见说明文档
```

> httpd服务的目录结构
>
> 服务目录：/usr/local/apache/
>
> 主配置文件：/usr/local/apache/conf/httpd.conf
>
> 网页目录：/usr/local/apache/htdocs/
>
> 服务脚本：/usr/local/apache/bin/apachectl
>
> 执行程序：/usr/local/apache/bin/httpd
>
> 访问日志： /usr/local/apache/log/access_log
>
> 错误日志： /usr/local/apache/log/error_log

# 7、selinux配置

```
[root@localhost httpd-2.4.46]# getsebool -a | grep httpd
httpd_anon_write --> off
httpd_builtin_scripting --> on
httpd_can_check_spam --> off
httpd_can_connect_ftp --> off
httpd_can_connect_ldap --> off
httpd_can_connect_mythtv --> off
httpd_can_connect_zabbix --> off
httpd_can_network_connect --> off
httpd_can_network_connect_cobbler --> off
httpd_can_network_connect_db --> off
httpd_can_network_memcache --> off
httpd_can_network_relay --> off
httpd_can_sendmail --> off
httpd_dbus_avahi --> off
httpd_dbus_sssd --> off
httpd_dontaudit_search_dirs --> off
httpd_enable_cgi --> on
httpd_enable_ftp_server --> off
httpd_enable_homedirs --> off
httpd_execmem --> off
httpd_graceful_shutdown --> off
httpd_manage_ipa --> off
httpd_mod_auth_ntlm_winbind --> off
httpd_mod_auth_pam --> off
httpd_read_user_content --> off
httpd_run_ipa --> off
httpd_run_preupgrade --> off
httpd_run_stickshift --> off
httpd_serve_cobbler_files --> off
httpd_setrlimit --> off
httpd_ssi_exec --> off
httpd_sys_script_anon_write --> off
httpd_tmp_exec --> off
httpd_tty_comm --> off
httpd_unified --> off
httpd_use_cifs --> off
httpd_use_fusefs --> off
httpd_use_gpg --> off
httpd_use_nfs --> off
httpd_use_opencryptoki --> off
httpd_use_openstack --> off
httpd_use_sasl --> off
httpd_verify_dns --> off

[root@localhost httpd-2.4.46]# setsebool -P httpd_anon_write on
[root@localhost httpd-2.4.46]# setsebool -P httpd_can_check_spam on
[root@localhost httpd-2.4.46]# setsebool -P httpd_can_network_connect on
[root@localhost httpd-2.4.46]# setsebool -P httpd_can_network_connect_db on
[root@localhost httpd-2.4.46]# setsebool -P httpd_can_network_relay on
[root@localhost httpd-2.4.46]# setsebool -P httpd_tmp_exec on
[root@localhost httpd-2.4.46]# setsebool -P httpd_ssi_exec  on
[root@localhost httpd-2.4.46]# setsebool -P httpd_enable_cgi  on
```

# 8、防火墙配置

```
[root@localhost httpd-2.4.46]# firewall-cmd  --add-port=80/tcp --permanent 
success
[root@localhost httpd-2.4.46]# firewall-cmd  --add-port=443/tcp --permanent 
success
[root@localhost httpd-2.4.46]# firewall-cmd  --add-port=8080/tcp --permanent 
success
[root@localhost httpd-2.4.46]# firewall-cmd  --add-port=8888/tcp --permanent 
success
[root@localhost httpd-2.4.46]# firewall-cmd  --add-service=http  --permanent 
success
[root@localhost httpd-2.4.46]# firewall-cmd  --add-service=https  --permanent 
success
[root@localhost httpd-2.4.46]# firewall-cmd  --reload
success
```

# 9、修改主配置文件httpd.conf

```
[root@localhost conf]# pwd
/usr/local/apache/conf
[root@localhost conf]# vim httpd.conf 

ServerAdmin mufeng.yu@qq.com		#管理员邮箱
ServerName www.mufeng.com:80	#站点名称
```

> ServerRoot：服务目录
>
> ServerAdmin：管理员邮箱
>
> User：运行服务的用户身份
>
> Group：运行服务的组身份
>
> ServerName：网站服务器的域名
>
> DocumentRoot：网页文档的根目录
>
> Listen：监听的IP地址、端口号
>
> PidFile：保存httpd进程PID号的文件
>
> DirectoryIndex：默认的索引页文件
>
> ErrorLog：错误日志文件的位置
>
> CustomLog：访问日志文件的位置
>
> LogLevel：记录日志的级别，默认为warn
>
> Timeout：网络连接超时，默认为300秒
>
> KeepAlive：是否保持连接，可选On或Off
>
> MaxKeepAliveRequests：每次连接最多请求文件数
>
> KeepAliveTimeout：保持连接状态时的超时时间
>
> Include：需要包含进来的其他配置文件

# 10、http.conf 语法检查

```
[root@localhost conf]# /usr/local/apache/bin/apachectl  -t
Syntax OK
```

# 11、启动httpd服务

```
[root@localhost conf]# /usr/local/apache/bin/apachectl start 
```

# 12、测试

```
[root@localhost conf]# wget www.mufeng.com
--2020-12-01 08:41:48--  http://www.mufeng.com/
Resolving www.mufeng.com (www.mufeng.com)... 192.35.35.1
Connecting to www.mufeng.com (www.mufeng.com)|192.35.35.1|:80... connected.
HTTP request sent, awaiting response... 200 OK
Length: 45 [text/html]
Saving to: ‘index.html’

index.html                        100%[==========================================================>]      45  --.-KB/s    in 0s      

2020-12-01 08:41:48 (7.99 MB/s) - ‘index.html’ saved [45/45]

[root@localhost conf]# vim index.html 
<html><body><h1>It works!</h1></body></html>
```

> 这个测试完全可以通过ip地址来实现，如果想通过域名访问，需要配置自己的DNS域名服务器bind

# 13、测试本机httpd服务器的性能

ab命令格式说明

```
ab [-q] -c 并发请求数 -n 总的请求数 [http://]域名[:端口]/路径
```

```
[root@localhost conf]# ulimit -n 3600
[root@localhost bin]# pwd
/usr/local/apache/bin
[root@localhost bin]# ./ab -q -c 2000 -n 4000 http://www.mufeng.com/ 
This is ApacheBench, Version 2.3 <$Revision: 1879490 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking www.mufeng.com (be patient).....done


Server Software:        Apache/2.4.46
Server Hostname:        www.mufeng.com
Server Port:            80

Document Path:          /
Document Length:        45 bytes

Concurrency Level:      2000
Time taken for tests:   0.519 seconds
Complete requests:      4000
Failed requests:        0
Total transferred:      1156000 bytes
HTML transferred:       180000 bytes
Requests per second:    7703.79 [#/sec] (mean)
Time per request:       259.613 [ms] (mean)
Time per request:       0.130 [ms] (mean, across all concurrent requests)
Transfer rate:          2174.21 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    9  17.2      4      71
Processing:     0   17  46.8      8     428
Waiting:        0   16  46.7      7     428
Total:          0   26  58.4     12     498

Percentage of the requests served within a certain time (ms)
  50%     12
  66%     13
  75%     15
  80%     16
  90%     24
  95%     81
  98%    283
  99%    288
 100%    498 (longest request)
```


注：构建服务所需的包可在[server_source_2020.iso ](https://download.csdn.net/download/qq_45417634/13208956)请自行下载，您也可以在所需安装包官网下载
本地源配置、防火墙、selinux等是linux较为基础的内容，不再赘述。
本文均为原创，如需与博主交流可email至mufeng.yu@qq.com