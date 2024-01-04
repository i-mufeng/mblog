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
            {text: '折腾日志',link: '/technology/'},
            {
                text: '后端开发分享',
                items: [
                    {text: "JAVA 学习笔记",
                        items: [
                            {text: 'JAVA 面向对象', link: '/full-stack/java/'},
                            {text: 'JAVA 并发编程', link: '#'},
                        ]
                    },
                    {text: "数据库相关",
                        items: [
                            {text: 'SQL 练习', link: '#'},
                            {text: 'NoSQL 相关', link: '#'},
                        ]
                    },
                    {text: "Spring 全家桶深入学习",
                        items: [
                            {text: 'Spring Framework', link: '#'},
                            {text: 'Spring Boot', link: '#'},
                            {text: 'Spring Cloud', link: '#'},
                        ]
                    },
                ],
            },
            {
                text: 'Linux 运维笔记',
                items: [
                    {
                        text: 'Linux 基本管理',
                        items: [
                            {text: 'Linux 基础',link:'#'},
                            {text: '网络管理',link:'#'},
                        ]
                    },
                ]
            },
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
