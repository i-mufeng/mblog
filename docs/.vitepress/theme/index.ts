import BlogTheme from '@sugarat/theme'
// 默认颜色仍然使用绿色
import './green-theme.var.css'
// 自定义样式重载
import './style.scss'
// 时间线样式
import "vitepress-markdown-timeline/dist/theme/index.css";
import googleAnalytics from 'vitepress-plugin-google-analytics';
export default {
    ... BlogTheme,
    enhanceApp: (ctx) => {
        googleAnalytics({
            id: 'G-38J2Q2X6HV',
        })
    }
}
