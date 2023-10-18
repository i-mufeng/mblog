---
description: 使用 acme.sh 部署 Let's Encrypt 泛域名证书。
categories: 
   - 工具分享
tags: 
   - Linux
   - 运维
sticky: 1
---

# 泛域名证书申请以及部署

> 由于目前所有的域名服务商对于免费CA证书仅提供由`digicert`机构颁发的，只允许有20个子域名且不支持泛子域名。故使用 `Let's Encrypt` 的SSL证书

Let’s Encrypt 是一个证书颁发机构，向 Let’s Encrypt 申请证书是免费的。Let's Encrypt 支持泛域名证书，不需要为每个子域名单独申请证书。

## 一、`acme.sh`部署工具

根据 `acme.sh` [中文说明]([说明 · acmesh-official/acme.sh Wiki (github.com)](https://github.com/acmesh-official/acme.sh/wiki/说明))，`acme.sh` 实现了 `acme` 协议, 可以从 `let‘s encrypt` 生成免费的证书。

1. 其安装只需要执行以下命令，所有用户均可安装：

   ```shell
   curl https://get.acme.sh | sh -s email=my@example.com
   ```

2. 该工具将会安装在 `~/.acme.sh/`  目录下。

## 二、生成证书

`acme.sh` 实现了 **`acme`** 协议支持的所有验证协议. 一般有两种方式验证: http 和 dns 验证.

### 2.1 http 方式

http方式需要在该网站根目录放置一个文件来验证域名所有权。

可以执行以下命令生成：

```shell
acme.sh --issue -d mydomain.com -d www.mydomain.com --webroot /home/wwwroot/mydomain.com/
```

如果你使用apache或者nginx服务，执行以下命令会自动识别并完成验证，完成后还将为你删除文件，做到用户无感验证。

```shell
acme.sh --issue -d mydomain.com --apache/nginx
```

如果你的服务器80端口是空闲的，`acme.sh`还将自动配置一个webserver，监听80端口并自动完成配置。

### 2.2 DNS 方式

DNS方式只需要在配置DNS解析记录即可，且TXT的解析记录对你的服务不会产生影响。

执行以下命令，按照提示配置DNS解析记录即可：

```shell
acme.sh --issue --dns -d mydomain.com \
 --yes-I-know-dns-manual-mode-enough-go-ahead-please
```

解析完成后，执行以下命令来完成验证并重新生成证书：

```shell
acme.sh --renew -d mydomain.com \
  --yes-I-know-dns-manual-mode-enough-go-ahead-please
```

> 注意：若没有配置Automatic DNS API，该方法将无法自动更新你的域名证书。

### 2.3 DNS进阶版

DNS方式还支持使用域名解析商提供的接口自动进行配置。以阿里云为例：

首先将阿里云的阿里云 API 的密钥以以下格式配置到环境变量：

```shell
# 腾讯云dnspod
export DP_Id="XXXXXXXXXX"
export DP_Key="XXXXXXXXXX"

# 阿里云
export Ali_Key="XXXXXXXXXX"
export Ali_Secret="XXXXXXXXXX“
```

然后就可以通过以下命令生成证书：

```shell
# 腾讯云
acme.sh --issue --dns dns_dp -d example.com -d *.example.com

# 阿里云
acme.sh --issue --dns dns_ali -d example.com -d *.example.com
```

## 三、安装配置证书

此处以Podman Nginx容器配置证书举例。

### 3.1 生成Nginx配置

NGINX配置文件可以使用[NGINXCONF.IO]([NGINXConfig | DigitalOcean](https://www.digitalocean.com/community/tools/nginx?global.app.lang=zhCN))配置。页面为中文且较为友好。

### 3.2 生成 dhparam.pem

openssl dhparam用于生成和管理dh文件。dh(Diffie-Hellman)是著名的密钥交换协议，或称为密钥协商协议，它可以保证通信双方安全地交换密钥。但注意，它不是加密算法，所以不提供加密功能，仅仅只是保护密钥交换的过程。在openvpn中就使用了该交换协议。

执行以下命令即可生成：

```shell
openssl dhparam -out ~/dhparam.pem 2048
```

如果你使用上面提供的NGINXCONFIG.IO生成了配置文件，此处配置在nginx.conf文件中：

```ini
# Diffie-Hellman parameter for DHE ciphersuites                                         
ssl_dhparam /etc/nginx/dhparam.pem;
```

### 3.3 自动更新证书

以下为podman Nginx容器自动更新证书的命令：

```shell
~/.acme.sh/acme.sh --install-cert \ 
-d example.com \ 
--key-file /etc/nginx/ssl/example.com.key \ # 私钥地址
--fullchain-file /etc/nginx/ssl/example.com.cer  \ # 公钥地址
--reloadcmd "podman exec -it nginx nginx force-reload"
```

> 注意：`nginx reload` 命令并不会更新证书，需要使用 `nginx force-reload`

## 四、查看已安装证书信息

```shell
acme.sh --info -d example.com
# 会输出如下内容：
DOMAIN_CONF=/root/.acme.sh/example.com/example.com.conf
Le_Domain=example.com
Le_Alt=no
Le_Webroot=dns_ali
Le_PreHook=
Le_PostHook=
Le_RenewHook=
Le_API=https://acme-v02.api.letsencrypt.org/directory
Le_Keylength=
Le_OrderFinalize=https://acme-v02.api.letsencrypt.org/acme/finalize/23xxxx150/781xxxx4310
Le_LinkOrder=https://acme-v02.api.letsencrypt.org/acme/order/233xxx150/781xxxx4310
Le_LinkCert=https://acme-v02.api.letsencrypt.org/acme/cert/04cbd28xxxxxx349ecaea8d07
Le_CertCreateTime=1649358725
Le_CertCreateTimeStr=Thu Apr  7 19:12:05 UTC 2022
Le_NextRenewTimeStr=Mon Jun  6 19:12:05 UTC 2022
Le_NextRenewTime=1654456325
Le_RealCertPath=
Le_RealCACertPath=
Le_RealKeyPath=/etc/acme/example.com/privkey.pem
Le_ReloadCmd=service nginx force-reload
Le_RealFullChainPath=/etc/acme/example.com/chain.pem
```

## 五、更新证书

目前证书在 60 天以后会自动更新，使用crontab 工具。无需任何操作。

```shell
crontab  -l

56 * * * * "/root/.acme.sh"/acme.sh --cron --home "/root/.acme.sh" > /dev/null
```

## 六、修改ReloadCmd

根据官网的说法，不建议直接修改`example.conf`文件来达到修改ReloadCmd的目的，且目前修改`ReloadCmd`没有专门的命令，可以通过重新安装证书来修改。

## 七、更新 acme.sh

升级 acme.sh 到最新版 :

```shell
acme.sh --upgrade
```

如果你不想手动升级, 可以开启自动升级:

```shell
acme.sh --upgrade --auto-upgrade
```

之后, acme.sh 就会自动保持更新了.

你也可以随时关闭自动更新:

```shell
acme.sh --upgrade --auto-upgrade  0
```



## 参考链接

- [acme.sh中文文档  (github.com)](https://github.com/acmesh-official/acme.sh/wiki/说明)

- [Let's Encrypt SSL 泛域名证书申请和配置 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/445852299)

- [acme.sh · Issue #1439 · (github.com)](https://github.com/acmesh-official/acme.sh/issues/1439)
- [NGINXConfig | DigitalOcean](https://www.digitalocean.com/community/tools/nginx?global.app.lang=zhCN)
- [openssl dhparam(密钥交换) - 骏马金龙 - 博客园 (cnblogs.com)](https://www.cnblogs.com/f-ck-need-u/p/7103791.html)