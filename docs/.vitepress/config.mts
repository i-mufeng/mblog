import {defineConfig} from '@sugarat/theme/node'
import {blogTheme} from './blog-theme'

import timeline from "vitepress-markdown-timeline";
import mdItSub from "markdown-it-sub"
import mdItSup from "markdown-it-sup"
import mdItMark from "markdown-it-mark"
// Vitepress 默认配置
// 详见文档：https://vitepress.dev/reference/site-config
export default defineConfig({
    // 继承博客主题配置
    extends: blogTheme,
    lang: 'zh-cn',
    title: 'MBlog',
    description: '沐风的个人空间',
    head: [
        ['script', {},
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
                text: '全栈开发',
                items: [
                    {text: '大前端', link: '/full-stack/front-end/'},
                    {text: 'JAVA', link: '/full-stack/java/'},
                    {text: 'RUST', link: '/full-stack/rust/'},
                    {text: '数据库', link: '/full-stack/database/'},
                    {text: '其他', link: '/full-stack/other/'},
                ]
            },
            {
                text: '计算机基础',
                items: [
                    {text: '计算机网络', link: '/computer-basics/network/'},
                    {text: '操作系统', link: '/computer-basics/operating-system/'},
                    {text: '数据结构与算法', link: '/computer-basics/data-structure/'},
                ]
            },
            {
                text: '折腾日志',
                items: [
                    {text: 'Linux 企业级运维', link: '/training/linux/'},
                    {text: '软件工具分享', link: '/training/software/'},
                ]
            },
            {
                text: '面试分享',
                items: [
                    {text: '每日一题', link: '/interview/question-by-day/'},
                    {text: '面试分享', link: '/interview/skills/'},
                ]
            },
            {
                text: '杂谈日志',
                items: [
                    {text: '科技周报', link: '/notes/technology-weekly/'},
                    {text: '读书笔记', link: '/notes/reading-notes/'},
                    {text: '生活随笔', link: '/notes/life-notes/'},
                ]
            },
            {text: '友链', link: '/friend-link-list/'},
            {text: '关于', link: '/about/'},
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
        math: true,
        config: (md) => {
            md.use(timeline)
            md.use(mdItSub)
            md.use(mdItSup)
            md.use(mdItMark)
        }
    },
    sitemap: {
        hostname: 'https://www.imufeng.cn'
    },

});
