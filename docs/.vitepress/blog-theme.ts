// 主题独有配置
import { getThemeConfig } from '@sugarat/theme/node';

// 开启RSS支持（RSS配置）
// import type { Theme } from '@sugarat/theme'

// const baseUrl = 'https://sugarat.top'
// const RSS: Theme.RSSOptions = {
//   title: '粥里有勺糖',
//   baseUrl,
//   copyright: 'Copyright (c) 2018-present, 粥里有勺糖',
//   description: '你的指尖,拥有改变世界的力量（大前端相关技术分享）',
//   language: 'zh-cn',
//   image: 'https://img.cdn.sugarat.top/mdImg/MTY3NDk5NTE2NzAzMA==674995167030',
//   favicon: 'https://sugarat.top/favicon.ico',
// }


// 所有配置项，详见文档: https://theme.sugarat.top/
const blogTheme = getThemeConfig({
  // 开启RSS支持
  // RSS,
  
  // 默认开启pagefind离线的全文搜索支持（如使用其它的可以设置为false）
  // 如果npx pagefind 时间过长，可以手动将其安装为项目依赖 pnpm add pagefind
  // search: false,

  // 主题色修改
  themeColor: 'vp-green',

  // 文章默认作者
  author: '沐风',

  comment: {
    repo: 'i-mufeng/mblog',
    repoId: 'R_kgDOKW0QNw',
    category: 'General',
    categoryId: 'DIC_kwDOKW0QN84CZimX'
  },
  footer: [
    {
      message: "Mblog © 2021-2023 Created by 沐风",
      copyright: {
        message: "CC BY-NC-SA 4.0 国际许可协议",
        link: "https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hans/"
      },
      icpRecord: {
        icon: `<img src="https://www.upyun.com/static/favicon-16x16.png" alt="youpai ico"/>`,
        name: "本站由 又拍云 提供CDN加速服务",
        link: "https://www.upyun.com/?utm_source=lianmeng&utm_medium=referral"
      }
    },
    {
      version: true,
      icpRecord: {
        name: '陇ICP备2021003158号-1',
        link: 'https://beian.miit.gov.cn/'
      },
      securityRecord: {
        name: '渝公网安备 50011802010624号',
        link: 'https://www.beian.gov.cn/portal/registerSystemInfo?recordcode=50011802010624'
      },
    }
  ],
  // 友链
  friend: [
    {
      nickname: '粥里有勺糖',
      des: '你的指尖用于改变世界的力量',
      avatar:
        'https://img.cdn.sugarat.top/mdImg/MTY3NDk5NTE2NzAzMA==674995167030',
      url: 'https://sugarat.top',
    },
  ],
  //   {
  //     nickname: 'Vitepress',
  //     des: 'Vite & Vue Powered Static Site Generator',
  //     avatar:
  //       'https://vitepress.dev/vitepress-logo-large.webp',
  //     url: 'https://vitepress.dev/',
  //   },
  // ],

  // popover: {
  //   title: '公告',
  //   body: [
  //     {
  //       type: 'text',
  //       content:
  //         'QQ交流群：681489336 🎉🎉',
  //     },
  //     {
  //       type: 'text',
  //       content:
  //         '👇公众号👇---👇 微信 👇',
  //     },
  //     {
  //       type: 'image',
  //       src: 'https://img.cdn.sugarat.top/mdImg/MTYxNTAxODc2NTIxMA==615018765210',
  //     },
  //     {
  //       type: 'text',
  //       content:
  //         '欢迎大家加群&私信交流',
  //     },
  //     {
  //       type: 'button',
  //       content: '博客',
  //       link: 'https://sugarat.top',
  //     },
  //   ],
  //   duration: 0,
  // },
});

export { blogTheme };
