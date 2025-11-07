# 终极前端浏览器指南

这是一个系统性的、深度和广度并存的、涵盖现代前端开发者所需掌握的核心浏览器知识的文档库。

本指南旨在构建一个“T”型的知识体系：
*   **广度 (横向)**：覆盖从浏览器底层工作原理到上层新兴技术与Web可访问性的全链路知识。
*   **深度 (纵向)**：在关键节点进行深度剖析，如关键渲染路径、现代网络协议、浏览器安全模型等，并补充了大量现代Web API的最佳实践。

---

## 目录

### [第一章：浏览器工作原理](./docs/1.浏览器工作原理/)
*   [01-浏览器核心架构：进程与线程](./docs/1.浏览器工作原理/01-浏览器核心架构：进程与线程.md)
*   [02-URL输入到页面展现的全过程](./docs/1.浏览器工作原理/02-URL输入到页面展现的全过程.md)
*   [03-关键渲染路径（Critical Rendering Path）](./docs/1.浏览器工作原理/03-关键渲染路径（Critical%20Rendering%20Path）.md)
*   [04-浏览器的一帧：事件循环与渲染时机](./docs/1.浏览器工作原理/04-浏览器的一帧：事件循环与渲染时机.md)

### [第二章：JavaScript执行机制](./docs/2.JavaScript执行机制/)
*   [01-事件循环（Event Loop）：宏任务与微任务](./docs/2.JavaScript执行机制/01-事件循环（Event%20Loop）：宏任务与微任务.md)
*   [02-V8引擎工作原理](./docs/2.JavaScript执行机制/02-V8引擎工作原理.md)
*   [03-浏览器垃圾回收（GC）机制](./docs/2.JavaScript执行机制/03-浏览器垃圾回收（GC）机制.md)
*   [04-JS核心理论：执行上下文、作用域链与闭包](./docs/2.JavaScript执行机制/04-JS核心理论：执行上下文、作用域链与闭包.md)
*   [05-深入JS内存：内存泄漏与调试](./docs/2.JavaScript执行机制/05-深入JS内存：内存泄漏与调试.md)

### [第三章：页面渲染与性能优化](./docs/3.页面渲染与性能优化/)
*   [01-渲染流程：重排（Reflow）与重绘（Repaint）](./docs/3.页面渲染与性能优化/01-渲染流程：重排（Reflow）与重绘（Repaint）.md)
*   [02-前端性能指标与优化策略](./docs/3.页面渲染与性能优化/02-前端性能指标与优化策略.md)
*   [03-浏览器硬件加速](./docs/3.页面渲染与性能优化/03-浏览器硬件加速.md)
*   [04-图片专题优化](./docs/3.页面渲染与性能优化/04-图片专题优化.md)
*   [05-性能监控与DevTools工具](./docs/3.页面渲染与性能优化/05-性能监控与DevTools工具.md)
*   [06-Web字体优化专题](./docs/3.页面渲染与性能优化/06-Web字体优化专题.md)
*   [07-现代Web渲染模式：SSR, SSG与ISR](./docs/3.页面渲染与性能优化/07-现代Web渲染模式：SSR,%20SSG与ISR.md)
*   [08-Web动画性能优化](./docs/3.页面渲染与性能优化/08-Web动画性能优化.md)

### [第四章：网络与存储](./docs/4.网络与存储/)
*   [01-TCP-IP协议族：TCP与UDP](./docs/4.网络与存储/01-TCP-IP协议族：TCP与UDP.md)
*   [02-HTTP协议的前世今生](./docs/4.网络与存储/02-HTTP协议的前世今生.md)
*   [03-HTTPS详解：让数据安全传输](./docs/4.网络与存储/03-HTTPS详解：让数据安全传输.md)
*   [04-浏览器缓存机制详解](./docs/4.网络与存储/04-浏览器缓存机制详解.md)
*   [05-实时通信：WebSocket与SSE](./docs/4.网络与存储/05-实时通信：WebSocket与SSE.md)
*   [06-网络知识深化：DNS与CDN](./docs/4.网络与存储/06-网络知识深化：DNS与CDN.md)
*   [07-QUIC协议详解](./docs/4.网络与存储/07-QUIC协议详解.md)
*   [08-浏览器存储方案：Cookie、LocalStorage、IndexedDB](./docs/4.网络与存储/08-浏览器存储方案：Cookie、LocalStorage、IndexedDB.md)
*   [09-数据请求方案：XHR, Fetch与Axios](./docs/4.网络与存储/09-数据请求方案：XHR,%20Fetch与Axios.md)

### [第五章：浏览器安全](./docs/5.浏览器安全/)
*   [01-同源策略与跨域解决方案（CORS）](./docs/5.浏览器安全/01-同源策略与跨域解决方案（CORS）.md)
*   [02-Web安全：XSS、CSRF与防御策略](./docs/5.浏览器安全/02-Web安全：XSS、CSRF与防御策略.md)
*   [03-HTTP安全头部详解](./docs/5.浏览器安全/03-HTTP安全头部详解.md)
*   [04-Web安全深化：点击劫持与其他攻击](./docs/5.浏览器安全/04-Web安全深化：点击劫持与其他攻击.md)
*   [05-内容安全策略（CSP）详解：构建坚不可摧的防线](./docs/5.浏览器安全/05-内容安全策略（CSP）详解：构建坚不可摧的防线.md)
*   [06-认证与授权：JWT安全最佳实践](./docs/5.浏览器安全/06-认证与授权：JWT安全最佳实践.md)

### [第六章：新兴技术与API](./docs/6.新兴技术与API/)
*   [01-Web Workers：解放主线程的利器](./docs/6.新兴技术与API/01-Web%20Workers：解放主线程的利器.md)
*   [02-Service Worker与PWA](./docs/6.新兴技术与API/02-Service%20Worker与PWA.md)
*   [03-WebAssembly（WASM）简介](./docs/6.新兴技术与API/03-WebAssembly（WASM）简介.md)
*   [04-Web Components & Shadow DOM](./docs/6.新兴技术与API/04-Web%20Components%20&%20Shadow%20DOM.md)
*   [05-现代Observer API：Intersection, Resize, Mutation与Performance](./docs/6.新兴技术与API/05-现代Observer%20API：Intersection,%20Resize,%20Mutation与Performance.md)
*   [06-WebRTC：开启浏览器P2P实时通信](./docs/6.新兴技术与API/06-WebRTC：开启浏览器P2P实时通信.md)
*   [07-File System Access API：让Web应用操作本地文件](./docs/6.新兴技术与API/07-File%20System%20Access%20API：让Web应用操作本地文件.md)
*   [08-WebGPU：释放浏览器图形与计算的未来](./docs/6.新兴技术与API/08-WebGPU：释放浏览器图形与计算的未来.md)
*   [09-设备连接API：WebUSB, Web Bluetooth & Web Serial](./docs/6.新兴技术与API/09-设备连接API：WebUSB,%20Web%20Bluetooth%20&%20Web%20Serial.md)
*   [10-WebXR Device API：构建沉浸式虚拟与增强现实](./docs/6.新兴技术与API/10-WebXR%20Device%20API：构建沉浸式虚拟与增强现实.md)

### [第七章：Web可访问性 (A11y)](./docs/7.Web可访问性/)
*   [01-Web可访问性(A11y)入门与WAI-ARIA](./docs/7.Web可访问性/01-Web可访问性(A11y)入门与WAI-ARIA.md)
*   [02-语义化HTML的重要性](./docs/7.Web可访问性/02-语义化HTML的重要性.md)
*   [03-键盘导航与焦点管理](./docs/7.Web可访问性/03-键盘导航与焦点管理.md)
*   [04-屏幕阅读器适配指南](./docs/7.Web可访问性/04-屏幕阅读器适配指南.md)
*   [05-构建无障碍的表单](./docs/7.Web可访问性/05-构建无障碍的表单.md)
