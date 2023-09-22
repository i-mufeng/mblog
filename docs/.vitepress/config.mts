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
        lastUpdatedText: '上次更新于',
        footer: {
            message:
                '<a href="https://beian.miit.gov.cn/" target="_blank">陇ICP备2021003158号-1&nbsp;&nbsp;</a> | &nbsp;&nbsp;' +
                '<a target="_blank" href=http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=50011802010624">' +
                '<img style="display: inline;height: 14px" alt="" src="https://p0.meituan.net/travelcube/d0289dc0a46fc5b15b3363ffa78cf6c719256.png"/>' +
                '&nbsp;渝公网安备 50011802010624号</a>',
            copyright: 'Mblog © 2021-2023 Created by 沐风',
        },
        logo: '/logo.svg',
        editLink: {
          pattern:
            'https://github.com/i-mufeng/mblog/master/docs/:path',
          text: '去 GitHub 上编辑'
        },
        nav: [
            {text: '首页', link: '/'},
            {text: '技术笔记',
              items:[
                {text: "建站教程",link: '/technology/web/'},
                {text: "工具分享",link: '/technology/tools/'},
                {text: "折腾日记",link: '/technology/other/'},
              ]},
            {text: '全栈知识体系',
              items: [
                {text: "前端开发", link: '/fullstack/frontend/'},
                {text: "后端开发", link: '/fullstack/backend/'},
                {text: "数据库", link: '/fullstack/database/'},
                {text: "系统运维", link: '/fullstack/devops/'},
              ],
            },
            {text: '杂谈随笔', link: '/tittle-tattle/'},
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
