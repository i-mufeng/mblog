import { defineConfig } from '@sugarat/theme/node'
import { blogTheme } from './blog-theme'


// Vitepress 默认配置
// 详见文档：https://vitepress.dev/reference/site-config
export default defineConfig({
  // 继承博客主题配置
  extends: blogTheme,
  lang: 'zh-cn',
  title: 'MBlog',
  description: '沐风的个人空间',
  vite: {
    optimizeDeps: {
      include: ['element-plus'],
      exclude: ['@sugarat/theme']
    }
  },
  lastUpdated: true,
  themeConfig: {
    lastUpdatedText: '上次更新于',
    footer: {
      message: 'Mblog © 2021-2023 Created by 沐风 </a>',
      copyright:
        '<div style="display:inline-block"><span style="float: left" >Theme By <a target="_blank" href="https://theme.sugarat.top/">@sugarat</a>&nbsp;&nbsp;|&nbsp;&nbsp;</span><a  style="float: left" href="https://beian.miit.gov.cn/" target="_blank">陇ICP备2021003158号-1&nbsp;&nbsp;|&nbsp;&nbsp;</a><a  style="float: left" target="_blank" href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=50011802010624"><img  style="float: left" alt="" src="https://p0.meituan.net/travelcube/d0289dc0a46fc5b15b3363ffa78cf6c719256.png"/>渝公网安备 50011802010624号</a></div>',
    },
    logo: '/logo.svg',
    // editLink: {
    //   pattern:
    //     'https://github.com/ATQQ/sugar-blog/tree/master/packages/blogpress/:path',
    //   text: '去 GitHub 上编辑内容'
    // },
    nav: [
      {text: '首页', link: '/'},
      {
        text: '我的博客',
        items: [
          {text: '全栈笔记', link: '/full-stack/'},
          {text: '我的分享', link: '/full-stack/'},
          {text: '杂谈随笔', link: '/tittle-tattle/'},
        ]
      },
      {text: '友链', link: '/friend-link-list/'},
      {text: '关于本站',  link: '/about/'},
    ],
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/i-mufeng'
      }
    ]
  }
})
