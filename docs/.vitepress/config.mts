import {defineConfig} from '@sugarat/theme/node'
import {blogTheme} from './blog-theme'


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
        logo: '/logo.svg',
        editLink: {
            pattern:
                'https://github.com/i-mufeng/mblog/tree/master/docs/:path',
            text: 'Edit On GitHub'
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
                text: '全栈知识体系',
                items: [
                    {text: "前端开发", link: '/full-stack/frontend/'},
                    {text: "后端开发", link: '/full-stack/backend/'},
                    {text: "数据库", link: '/full-stack/database/'},
                    {text: "系统运维", link: '/full-stack/devops/'},
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
        ]
    }
})
