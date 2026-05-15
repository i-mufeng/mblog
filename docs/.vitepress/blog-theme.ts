// 主题独有配置
import { getThemeConfig } from '@sugarat/theme/node';

// 开启RSS支持（RSS配置）
import type { Theme } from '@sugarat/theme'

const baseUrl = 'https://www.imufeng.cn'

const RSS: Theme.RSSOptions = {
  title: 'Mblog - 沐风的个人博客',
  baseUrl,
  copyright: 'Mblog © 2021-2025 Created by 沐风',
  description: '但愿岁月如客，来去皆从容。（后端开发技术交流）',
  language: 'zh-cn',
  image: baseUrl+'/logo.svg',
  favicon: baseUrl+'/favicon.ico',
}


// 所有配置项，详见文档: https://theme.sugarat.top/
const blogTheme = getThemeConfig({
  // 开启RSS支持
  RSS,

  // 默认开启pagefind离线的全文搜索支持（如使用其它的可以设置为false）
  // 如果npx pagefind 时间过长，可以手动将其安装为项目依赖 pnpm add pagefind
  search: false,


  // 主题色修改
  themeColor: 'vp-green',

  // 文章默认作者
  author: '沐风',

  comment: {
    repo: 'i-mufeng/mblog',
    repoId: 'R_kgDOKW0QNw',
    category: 'General',
    categoryId: 'DIC_kwDOKW0QN84CZimY'
  },
  buttonAfterArticle: {
    openTitle: '赞赏一下',
    closeTitle: '下次一定',
    content: '<img src="https://cdn.imufeng.cn/mblog/5dac797f91625543d0fdda29b0336eca.jpg" alt="赞赏码">',
    icon: 'wechatPay',
  },
  footer: [
    {
      message: "Mblog © 2021-2026 Created by 沐风",
      copyright: {
        message: "CC BY-NC-SA 4.0 国际许可协议",
        link: "https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hans/"
      },
      icpRecord: {
        icon: `<img src="https://www.upyun.com/static/favicon-16x16.png" alt="youpai ico"/>`,
        name: "本站由 又拍云 提供CDN加速服务",
        link: "https://www.upyun.com/?utm_source=lianmeng&utm_medium=referral"
      },
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
  // friend: [
  //   {
  //     nickname: '粥里有勺糖',
  //     des: '你的指尖用于改变世界的力量',
  //     avatar:
  //       'https://img.cdn.sugarat.top/mdImg/MTY3NDk5NTE2NzAzMA==674995167030',
  //     url: 'https://sugarat.top',
  //   },
  // ],
  //   {
  //     nickname: 'Vitepress',
  //     des: 'Vite & Vue Powered Static Site Generator',
  //     avatar:
  //       'https://vitepress.dev/vitepress-logo-large.webp',
  //     url: 'https://vitepress.dev/',
  //   },
  // ],

  popover: {
    title: '公告',
    body: [
      {
        type: 'text',
        content:
          '👇微信扫码添加好友👇',
      },
      {
        type: 'image',
        src: 'https://cdn.imufeng.cn/mblog/mufeng_wechatcode_transparent.png',
      },
      {
        type: 'button',
        content: `本站已支持IPV6访问`,
        link: 'https://ipw.cn/ipv6webcheck/?site=www.imufeng.cn',

      },
    ],
    duration: 0,
  },
});

export { blogTheme };
