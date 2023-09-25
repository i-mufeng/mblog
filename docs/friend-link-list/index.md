---
aside: false
hidden: true
readingTime: false
date: false
author: false
sidebar: false
---

::: details 友链申请格式
- **昵称：** `Mufeng`

- **E-mail：** `admin@imufeng.cn`

- **Github：** `i-mufeng`

- **其他站点：** `[username](link)`

- **一句话：** `但愿岁月如客，来去皆从容。`

- **站点名称：** `沐风的小站`

- **站点地址：** `https://imufeng.cn`

- **头像链接：** `https://cn.gravatar.com/avatar/f1dcdc8fa782b81824df5d67022e4d4a`

:::
<script setup>
	import { VPTeamMembers } from 'vitepress/theme'
	const members = [
      {
        avatar: 'https://www.github.com/yyx990803.png',
        name: 'Evan You',
        title: 'Creator',
        links: [
          { icon: 'github', link: 'https://github.com/yyx990803' },
          { icon: 'twitter', link: 'https://twitter.com/youyuxi' }
        ]
      },
    ]
</script>

# 友情链接

<VPTeamMembers size="small" :members="members" />