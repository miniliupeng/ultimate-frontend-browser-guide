import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "终极前端浏览器指南",
  description: "一个系统性的、深度和广度并存的、涵盖现代前端开发者所需掌握的核心浏览器知识的文档库。",
  base: '/ultimate-frontend-browser-guide/',
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/1.浏览器工作原理/01-浏览器核心架构：进程与线程' }
    ],

    sidebar: [
      {
        text: '第一章：浏览器工作原理',
        collapsed: false,
        items: [
          { text: '01-浏览器核心架构：进程与线程', link: '/1.浏览器工作原理/01-浏览器核心架构：进程与线程' },
          { text: '02-URL输入到页面展现的全过程', link: '/1.浏览器工作原理/02-URL输入到页面展现的全过程' },
          { text: '03-关键渲染路径', link: '/1.浏览器工作原理/03-关键渲染路径（Critical Rendering Path）' },
          { text: '04-浏览器的一帧：事件循环与渲染时机', link: '/1.浏览器工作原理/04-浏览器的一帧：事件循环与渲染时机' },
        ]
      },
      {
        text: '第二章：JavaScript执行机制',
        collapsed: true,
        items: [
          { text: '01-事件循环：宏任务与微任务', link: '/2.JavaScript执行机制/01-事件循环（Event Loop）：宏任务与微任务' },
          { text: '02-V8引擎工作原理', link: '/2.JavaScript执行机制/02-V8引擎工作原理' },
          { text: '03-浏览器垃圾回收（GC）机制', link: '/2.JavaScript执行机制/03-浏览器垃圾回收（GC）机制' },
          { text: '04-JS核心理论：执行上下文、作用域链与闭包', link: '/2.JavaScript执行机制/04-JS核心理论：执行上下文、作用域链与闭包' },
          { text: '05-深入JS内存：内存泄漏与调试', link: '/2.JavaScript执行机制/05-深入JS内存：内存泄漏与调试' },
        ]
      },
      {
        text: '第三章：页面渲染与性能优化',
        collapsed: true,
        items: [
            { text: '01-渲染流程：重排与重绘', link: '/3.页面渲染与性能优化/01-渲染流程：重排（Reflow）与重绘（Repaint）' },
            { text: '02-前端性能指标与优化策略', link: '/3.页面渲染与性能优化/02-前端性能指标与优化策略' },
            { text: '03-浏览器硬件加速', link: '/3.页面渲染与性能优化/03-浏览器硬件加速' },
            { text: '04-图片专题优化', link: '/3.页面渲染与性能优化/04-图片专题优化' },
            { text: '05-性能监控与DevTools工具', link: '/3.页面渲染与性能优化/05-性能监控与DevTools工具' },
            { text: '06-Web字体优化专题', link: '/3.页面渲染与性能优化/06-Web字体优化专题' },
            { text: '07-现代Web渲染模式', link: '/3.页面渲染与性能优化/07-现代Web渲染模式：SSR, SSG与ISR' },
            { text: '08-Web动画性能优化', link: '/3.页面渲染与性能优化/08-Web动画性能优化' },
        ]
      },
      {
        text: '第四章：网络与存储',
        collapsed: true,
        items: [
            { text: '01-TCP-IP协议族：TCP与UDP', link: '/4.网络与存储/01-TCP-IP协议族：TCP与UDP' },
            { text: '02-HTTP协议的前世今生', link: '/4.网络与存储/02-HTTP协议的前世今生' },
            { text: '03-HTTPS详解', link: '/4.网络与存储/03-HTTPS详解：让数据安全传输' },
            { text: '04-浏览器缓存机制详解', link: '/4.网络与存储/04-浏览器缓存机制详解' },
            { text: '05-实时通信：WebSocket与SSE', link: '/4.网络与存储/05-实时通信：WebSocket与SSE' },
            { text: '06-网络知识深化：DNS与CDN', link: '/4.网络与存储/06-网络知识深化：DNS与CDN' },
            { text: '07-QUIC协议详解', link: '/4.网络与存储/07-QUIC协议详解' },
            { text: '08-浏览器存储方案', link: '/4.网络与存储/08-浏览器存储方案：Cookie、LocalStorage、IndexedDB' },
            { text: '09-数据请求方案', link: '/4.网络与存储/09-数据请求方案：XHR, Fetch与Axios' },
        ]
      },
      {
        text: '第五章：浏览器安全',
        collapsed: true,
        items: [
            { text: '01-同源策略与跨域解决方案', link: '/5.浏览器安全/01-同源策略与跨域解决方案（CORS）' },
            { text: '02-Web安全：XSS、CSRF与防御', link: '/5.浏览器安全/02-Web安全：XSS、CSRF与防御策略' },
            { text: '03-HTTP安全头部详解', link: '/5.浏览器安全/03-HTTP安全头部详解' },
            { text: '04-Web安全深化：点击劫持等', link: '/5.浏览器安全/04-Web安全深化：点击劫持与其他攻击' },
            { text: '05-内容安全策略（CSP）详解', link: '/5.浏览器安全/05-内容安全策略（CSP）详解：构建坚不可摧的防线' },
            { text: '06-认证与授权：JWT安全实践', link: '/5.浏览器安全/06-认证与授权：JWT安全最佳实践' },
        ]
      },
      {
        text: '第六章：新兴技术与API',
        collapsed: true,
        items: [
            { text: '01-Web Workers', link: '/6.新兴技术与API/01-Web Workers：解放主线程的利器' },
            { text: '02-Service Worker与PWA', link: '/6.新兴技术与API/02-Service Worker与PWA' },
            { text: '03-WebAssembly（WASM）', link: '/6.新兴技术与API/03-WebAssembly（WASM）简介' },
            { text: '04-Web Components & Shadow DOM', link: '/6.新兴技术与API/04-Web Components & Shadow DOM' },
            { text: '05-现代Observer API', link: '/6.新兴技术与API/05-现代Observer API：Intersection, Resize, Mutation与Performance' },
            { text: '06-WebRTC', link: '/6.新兴技术与API/06-WebRTC：开启浏览器P2P实时通信' },
            { text: '07-File System Access API', link: '/6.新兴技术与API/07-File System Access API：让Web应用操作本地文件' },
            { text: '08-WebGPU', link: '/6.新兴技术与API/08-WebGPU：释放浏览器图形与计算的未来' },
            { text: '09-设备连接API', link: '/6.新兴技术与API/09-设备连接API：WebUSB, Web Bluetooth & Web Serial' },
            { text: '10-WebXR Device API', link: '/6.新兴技术与API/10-WebXR Device API：构建沉浸式虚拟与增强现实' },
        ]
      },
      {
        text: '第七章：Web可访问性 (A11y)',
        collapsed: true,
        items: [
            { text: '01-A11y入门与WAI-ARIA', link: '/7.Web可访问性/01-Web可访问性(A11y)入门与WAI-ARIA' },
            { text: '02-语义化HTML的重要性', link: '/7.Web可访问性/02-语义化HTML的重要性' },
            { text: '03-键盘导航与焦点管理', link: '/7.Web可访问性/03-键盘导航与焦点管理' },
            { text: '04-屏幕阅读器适配指南', link: '/7.Web可访问性/04-屏幕阅读器适配指南' },
            { text: '05-构建无障碍的表单', link: '/7.Web可访问性/05-构建无障碍的表单' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-repo' }
    ]
  }
})
