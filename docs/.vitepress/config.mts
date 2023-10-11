import {defineConfig} from '@sugarat/theme/node'
import {blogTheme} from './blog-theme'

import timeline from "vitepress-markdown-timeline";
// Vitepress 默认配置
// 详见文档：https://vitepress.dev/reference/site-config
export default defineConfig({
    // 继承博客主题配置
    extends: blogTheme,
    lang: 'zh-cn',
    title: 'MBlog',
    description: '沐风的个人空间',
    head: [
        ['script',{},
        `var _hmt = _hmt || [];
(function() {
  var hm = document.createElement("script");
  hm.src = "https://hm.baidu.com/hm.js?9911a6b0c7d4d1799af72772dd527b1c";
  var s = document.getElementsByTagName("script")[0]; 
  s.parentNode.insertBefore(hm, s);
})();
`
        ]
    ],
    vite: {
        optimizeDeps: {
            include: ['element-plus'],
            exclude: ['@sugarat/theme']
        }
    },
    lastUpdated: true,
    themeConfig: {
        logo: '/logo.svg',
        editLink: {
            pattern:
                'https://github.com/i-mufeng/mblog/tree/master/docs/:path',
            text: '在 Github 打开'
        },
        nav: [
            {text: '首页', link: '/'},
            {
                text: '技术笔记',
                items: [
                    {text: "建站教程", link: '/technology/web/'},
                    {text: "工具分享", link: '/technology/tools/'},
                    {text: "折腾日记", link: '/technology/other/'},
                ]
            },
            {
                text: '全栈开发交流',
                items: [
                    {text: "前端开发", link: '/full-stack/#一、后端技术分享'},
                    {text: "后端开发", link: '/full-stack/#二、前端技术分享'},
                ],
            },
            {text: '杂谈随笔', link: '/tittle-tattle/'},
            {text: '每日一题', link: '/question-by-day/'},
            {text: '友链', link: '/friend-link-list/'},
            {text: '关于本站', link: '/about/'},
        ],
        socialLinks: [
            {
                icon: 'github',
                link: 'https://github.com/i-mufeng'
            }
        ],
        lastUpdated: {
            text: '更新于',
        }
    },
    markdown: {
        config: (md) => {
            md.use(timeline)
        }
    },
    sitemap: {
        hostname: 'https://www.imufeng.cn'
    }
})
