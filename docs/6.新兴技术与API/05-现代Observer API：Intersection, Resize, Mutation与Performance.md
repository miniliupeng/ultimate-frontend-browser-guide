# 19-现代Observer API：Intersection, Resize, Mutation与Performance

Web 平台提供了一系列现代的“观察者” (Observer) API，它们允许我们以一种**高性能、声明式**的方式来响应 DOM 中的各种变化。这些 API 将原本需要通过低效的轮询或事件监听才能完成的任务，交由浏览器在后台高效处理，极大地提升了性能和开发体验。

## 1. IntersectionObserver：交叉观察者

这是目前最常用、最重要的 Observer API 之一。

*   **解决的问题**：在 `IntersectionObserver` 出现之前，要实现图片懒加载、无限滚动、内容曝光统计等功能，开发者通常需要监听 `scroll` 事件，并在回调中频繁调用 `getBoundingClientRect()` 来计算元素位置。这种做法性能极差，很容易导致页面卡顿。
*   **核心原理**：`IntersectionObserver` 提供了一种**异步**的方式来观察一个目标元素（`target`）与其祖先元素或顶级文档视口（`root`）的**交叉状态变化**。所有复杂的计算都由浏览器在优化过的后台线程中完成。

### 使用方法

```javascript
const options = {
  root: null, // root 为 null 时，默认为浏览器视口
  rootMargin: '0px', // 在 root 四周形成一个外边距，用于提前或延迟触发
  threshold: 0.5 // 交叉区域占目标元素面积的比例，可以是数组 [0, 0.5, 1]
};

const callback = (entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // 目标元素进入了视口（或 root）
      console.log('Element is visible:', entry.target);
      // 在这里执行图片加载、数据请求等操作
      
      // 操作完成后，可以停止观察
      observer.unobserve(entry.target);
    }
  });
};

const observer = new IntersectionObserver(callback, options);

// 开始观察一个或多个目标元素
const target = document.querySelector('.lazy-load-image');
observer.observe(target);
```

**典型应用**：图片懒加载、无限滚动加载、广告曝光统计、到达页面底部时触发动画。

## 2. ResizeObserver：尺寸变化观察者

*   **解决的问题**：长期以来，Web 开发者只能监听 `window` 的 `resize` 事件来响应视口变化（媒体查询），但无法直接监听一个**元素自身尺寸**的变化。`ResizeObserver` 填补了这一空白，完美地解决了“元素查询 (Element Queries)”的需求。
*   **核心原理**：`ResizeObserver` 可以高效地监听一个或多个元素的内容区域或边框（`content-box` 或 `border-box`）尺寸的变化。

### 使用方法

```javascript
const callback = (entries) => {
  for (let entry of entries) {
    const { width, height } = entry.contentRect;
    console.log(`Element ${entry.target.id} size changed to ${width}x${height}`);
    
    // 在这里可以根据元素自身尺寸执行响应式逻辑
    if (width < 300) {
      entry.target.classList.add('small');
    } else {
      entry.target.classList.remove('small');
    }
  }
};

const observer = new ResizeObserver(callback);

const myComponent = document.getElementById('my-component');
observer.observe(myComponent);
```

**典型应用**：构建真正响应式的组件（根据自身而非视口尺寸调整布局）、动态图表库、文本编辑器等。

## 3. MutationObserver：DOM 变动观察者

*   **解决的问题**：提供一个标准化的、高性能的方式来**观察 DOM 树的变化**，包括节点的添加或移除、节点属性的变化、文本内容的变化等。它是 `Mutation Events` 这一旧有 API 的现代化替代品。
*   **核心原理**：与 `IntersectionObserver` 类似，`MutationObserver` 也是异步的。它会将短时间内发生的多次 DOM 变动记录下来，然后在当前同步代码执行完毕后，一次性地在微任务（microtask）中触发回调，避免了性能问题。

### 使用方法

```javascript
const targetNode = document.getElementById('some-element');

const config = { 
  attributes: true, // 观察属性变动
  childList: true,  // 观察子节点的增删
  subtree: true     // 观察所有后代节点
};

const callback = (mutationsList, observer) => {
  for(const mutation of mutationsList) {
    if (mutation.type === 'childList') {
      console.log('A child node has been added or removed.');
    } else if (mutation.type === 'attributes') {
      console.log(`The ${mutation.attributeName} attribute was modified.`);
    }
  }
};

const observer = new MutationObserver(callback);
observer.observe(targetNode, config);

// observer.disconnect(); // 停止观察
```

**典型应用**：当需要对一个不受你直接控制的 DOM 区域（例如由第三方库渲染的区域）的变化做出反应时；富文本编辑器；框架底层实现等。

## 4. PerformanceObserver：性能度量观察者

前面三种 Observer 主要关注 DOM 的变化，而 `PerformanceObserver` 则是一个专门用于**订阅和接收性能度量事件**的接口。它是现代前端性能监控，尤其是真实用户监控（RUM, Real User Monitoring）的基石。

*   **解决的问题**：替代了陈旧且功能有限的 `window.performance` API，提供了一种高效、异步的方式来获取浏览器的性能时间线（Performance Timeline）中的各种指标，避免了轮询 `performance.getEntries()` 的性能开销。
*   **核心原理**：你可以创建一个 `PerformanceObserver` 实例，并告诉它你对哪些类型的性能条目（`entryTypes`）感兴趣。当浏览器记录了这些类型的性能数据后，观察者的回调函数就会被异步触发。

### 使用方法

下面的例子展示了如何使用 `PerformanceObserver` 来监听核心 Web 指标之一的 LCP (Largest Contentful Paint)。

```javascript
// 检查浏览器是否支持 PerformanceObserver
if ('PerformanceObserver' in window) {
  const entryHandler = (list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'largest-contentful-paint') {
        console.log('LCP candidate:', entry.startTime);
        console.log('  - LCP element:', entry.element);
        console.log('  - LCP size:', entry.size);
        console.log('  - LCP loadTime:', entry.loadTime);
        
        // 在这里可以将更丰富的数据上报到你的监控系统
        // reportToAnalytics({ 
        //   lcp: entry.startTime,
        //   lcpElement: entry.element?.tagName,
        // });
      }
    }
  };

  const observer = new PerformanceObserver(entryHandler);

  // 订阅 'largest-contentful-paint' 类型的性能条目
  // buffered: true 意味着可以获取到在 observer 创建之前就已经发生的性能条目
  observer.observe({ type: 'largest-contentful-paint', buffered: true });
}
```

LCP `entry` 对象包含许多有用的调试信息：
*   **`startTime`**: 渲染时间戳，即 LCP 的值。
*   **`element`**: 对被视为最大内容的 DOM 元素的直接引用。
*   **`size`**: 元素渲染的像素大小。
*   **`url`**: 如果元素是图片，则为图片 URL。
*   **`loadTime`**: 资源加载完成的时间。

**可观察的 `entryTypes` 包括**：
*   `'largest-contentful-paint'` (LCP)
*   `'first-input'` (FID)
*   `'layout-shift'` (CLS)
*   `'paint'` (FCP)
*   `'navigation'`：页面导航计时
*   `'resource'`：资源加载计时
*   `'longtask'`：长任务检测
*   `'measure'` 和 `'mark'`：自定义性能标记

## 总结

现代 Observer API 族群将前端开发从命令式的、低效的事件监听中解放出来，转向了声明式的、高性能的“观察”模式。从 UI 交互到性能监控，它们为开发者提供了强大而精准的工具。熟练掌握它们，是每一位现代前端开发者提升应用性能和代码质量的必备技能。
