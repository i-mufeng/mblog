---
aside: false
hidden: true
readingTime: false
date: false
author: false
sidebar: false
---

::: details 友链申请格式


- **站点名称：** `沐风的小站`

- **站点地址：** `https://imufeng.cn`

- **一句话：** `但愿岁月如客，来去皆从容。`

- **头像链接：** `https://cravatar.cn/avatar/f1dcdc8fa782b81824df5d67022e4d4a`

- **其他平台：** `[Github/Twitter...](link)`


:::
<script setup>
	import { VPTeamMembers } from 'vitepress/theme';
  const webSiteSvg = '<svg t="1696924383734" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1978" xmlns:xlink="http://www.w3.org/1999/xlink" width="200" height="200"><path d="M736 864H288c-17.6 0-32 14.4-32 32s14.4 32 32 32h448c17.6 0 32-14.4 32-32s-14.4-32-32-32zM832 96H192c-70.4 0-128 57.6-128 128v416c0 70.4 57.6 128 128 128h640c70.4 0 128-57.6 128-128V224c0-70.4-57.6-128-128-128zM576 544c0 17.6-14.4 32-32 32H288c-17.6 0-32-14.4-32-32s14.4-32 32-32h256c17.6 0 32 14.4 32 32z m192-224c0 17.6-14.4 32-32 32H288c-17.6 0-32-14.4-32-32s14.4-32 32-32h448c17.6 0 32 14.4 32 32z" p-id="1979"></path></svg>'; 
	const authoritys = [
      {
        avatar: 'https://cdn.imufeng.cn/mblog/yyx.png',
        name: 'Evan You',
        title: 'Creator',
        links: [
          { icon: {svg: webSiteSvg}, link: 'https://evanyou.me/' },
          { icon: 'github', link: 'https://github.com/yyx990803' },
          { icon: 'twitter', link: 'https://twitter.com/youyuxi' }
        ]
      },
      {
        avatar: 'https://cdn.imufeng.cn/mblog/ruanyifeng.png',
        name: '阮一峰',
        title: '一个从未谋面的引路人',
        links: [
          { icon: {svg: webSiteSvg}, link: 'https://www.ruanyifeng.com/' },
          { icon: 'github', link: 'https://github.com/ruanyf' },
          { icon: 'twitter', link: 'https://twitter.com/ruanyf' }
        ]
      },
    ];
const friends = [
      {
        avatar: 'https://sugarat.top/logo.png',
        name: '粥里有勺糖',
        title: '你的指尖,拥有改变世界的力量',
        links: [
          { icon: {svg: webSiteSvg}, link: 'https://sugarat.top/' },
          { icon: 'github' , link: 'https://github.com/ATQQ' },
          { icon: 'twitter' , link: 'https://twitter.com/Mr_XiaoZou' },
        ]
      },
      {
        avatar: 'https://img2.moeblog.vip/images/ev3v.png',
        name: '白の后花园',
        title: '一片互联网自留地',
        links: [
          { icon: {svg: webSiteSvg}, link: 'https://justmyblog.net/' },
          { icon: 'twitter', link: 'https://twitter.com/verymoes' },
          { icon: 'github', link: 'https://github.com/verymoe' }
        ]
      },
      {
        avatar: 'https://static.lty.fun/weblogo/my.jpg',
        name: 'Luminous’ Home',
        title: '记录生活中的点滴',
        links: [
          { icon: {svg: webSiteSvg}, link: 'https://luotianyi.vc/' },
        ]
      },
      {
        avatar: 'https://www.aicsuk.net/imgs/avatar1.jpg',
        name: 'Aicsukの世界',
        title: '一个小小的博客',
        links: [
          { icon: {svg: webSiteSvg}, link: 'https://www.aicsuk.net' },
          { icon: "github", link: 'https://github.com/aicsuk' },
        ]
      },
      {
        avatar: 'https://img.puresys.net/wp-content/uploads/2021/05/cropped-1621683691-20210522193059-192x192.jpg',
        name: 'Puresys',
        title: ' 纯净系统-软件下载',
        links: [
          { icon: {svg: webSiteSvg}, link: 'https://www.puresys.net' },
        ]
      },
      {
        avatar: 'https://img.bestreven.top/20240308_1709872211169.png',
        name: 'BestReven博客',
        title: '一个专注技术分享的平台',
        links: [
          { icon: {svg: webSiteSvg}, link: 'https://www.bestreven.top' },
        ]
      },
      {
        avatar: 'https://www.wxmin.cn:9000/ants-file/imgUrl/logo_1661824383783.png',
        name: ' June 12',
        title: '小陈的个人博客。记录所学知识，分享开发经验！',
        links: [
          { icon: {svg: webSiteSvg}, link: 'https://www.wxmin.cn' },
          { icon: "github", link: 'https://github.com/cc-chenshuang' },
        ]
      }
]
</script>

### 膜拜大佬

<VPTeamMembers size="medium" :members="authoritys" />

### 友链

<VPTeamMembers size="small" :members="friends" />
