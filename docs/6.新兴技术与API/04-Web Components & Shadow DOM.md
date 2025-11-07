# 18-Web Components & Shadow DOM

Web Components 是一套由 W3C 标准支持的、浏览器原生的技术，它允许我们创建**可复用的、被封装的自定义 HTML 元素**。这些元素可以在任何 Web 应用中使用，并且能与现有的前端框架（如 React, Vue, Angular）良好地协同工作。

Web Components 的核心优势在于**封装**和**互操作性**。它解决了传统前端开发中 CSS 样式全局污染、JavaScript 逻辑冲突等问题。

Web Components 主要由以下三项核心技术组成：

## 1. Custom Elements (自定义元素)

这是 Web Components 的基石。它允许我们定义自己的 HTML 标签，并为其赋予特定的行为。

**核心 API**：`customElements.define()`

**流程**：
1.  创建一个继承自 `HTMLElement` 的类，这个类就是你自定义元素的“大脑”，负责定义其结构、样式和行为。
2.  使用 `customElements.define('tag-name', YourClass)` 来注册你的自定义元素。标签名必须包含一个连字符 (`-`)，以区别于标准的 HTML 标签。

```javascript
class MyCounter extends HTMLElement {
  constructor() {
    super(); // 必须首先调用 super()
    
    // 初始化组件的 state
    this.count = 0;
    
    // 设置组件的初始 HTML 结构
    this.innerHTML = `
      <span>Count: ${this.count}</span>
      <button>Increment</button>
    `;
    
    // 绑定事件监听
    this.querySelector('button').addEventListener('click', () => {
      this.count++;
      this.querySelector('span').textContent = `Count: ${this.count}`;
    });
  }
}

// 注册自定义元素 <my-counter>
customElements.define('my-counter', MyCounter);
```

现在，你就可以在 HTML 中像使用普通标签一样使用它了：
```html
<my-counter></my-counter>
```

**生命周期回调**：Custom Elements 提供了一系列生命周期回调函数，让我们可以在元素的不同阶段执行代码：
*   `connectedCallback()`: 当元素被插入到 DOM 中时调用。
*   `disconnectedCallback()`: 当元素从 DOM 中移除时调用。
*   `adoptedCallback()`: 当元素被移动到新的文档时调用。
*   `attributeChangedCallback(name, oldValue, newValue)`: 当元素的 `observedAttributes` 之一发生变化时调用。

## 2. Shadow DOM (影子 DOM)

Shadow DOM 是 Web Components 中**最强大、最核心**的技术。它解决了 CSS 样式全局污染和 DOM 结构脆弱的问题。

*   **核心原理**：Shadow DOM 允许我们将一个**隐藏的、独立的 DOM 树**附加到一个元素上。这个隐藏的 DOM 树（称为“Shadow Tree”）与主文档的 DOM（称为“Light DOM”）是**隔离**的。
*   **隔离性**：
    *   **样式隔离**：Shadow DOM 内部的 CSS 样式**只对内部生效**，不会影响到外部；外部页面的样式也**不会泄露**到 Shadow DOM 内部。
    *   **结构封装**：Shadow DOM 内部的结构对于外部的 JavaScript 来说是“黑盒”，外部的 `document.querySelector()` 无法直接选中 Shadow DOM 内部的元素。

**API**：`element.attachShadow({ mode: 'open' })`

*   `mode: 'open'`: 意味着外部 JavaScript 可以通过 `element.shadowRoot` 属性来访问 Shadow Tree。如果设置为 `'closed'`，则 `shadowRoot` 会返回 `null`，实现了更彻底的封装。

## 3. HTML Templates & Slots

### a. `<template>` 元素

*   **作用**：`<template>` 标签及其内容在页面加载时**不会被渲染**，也不会执行其中的脚本。它提供了一种高效的方式来声明一段可以被复用的 DOM 结构。
*   我们可以通过 JavaScript 获取 `<template>` 的 `content`，然后克隆它 (`cloneNode(true)`)，再将其附加到 DOM 或 Shadow DOM 中。

### b. `<slot>` 元素

*   **作用**：`<slot>` 是 Shadow DOM 的一个占位符。它允许我们将外部 Light DOM 中的内容，“投影”或“分发”到 Shadow DOM 内部的指定位置。
*   **命名插槽 (Named Slots)**：我们可以为 `<slot>` 元素添加 `name` 属性，然后在外部通过 `slot="name"` 属性，将内容精确地分发到对应的插槽中。

## 4. 组合使用：创建一个真正的 Web Component

现在，我们将这三项技术组合起来，重构之前的 `<my-counter>` 组件。

**HTML:**
```html
<template id="my-counter-template">
  <style>
    /* 这些样式只在 Shadow DOM 内部生效 */
    :host {
      display: inline-block;
      border: 1px solid #ccc;
      padding: 10px;
      /* 使用外部传入的 CSS 自定义属性，提供默认值 */
      background-color: var(--my-counter-bg, #fff);
    }
    span {
      color: red;
    }
    /* 使用 ::slotted() 为投影进来的 p 元素设置样式 */
    ::slotted(p) {
      margin: 5px 0 0;
      font-style: italic;
      color: #555;
    }
  </style>
  
  <span>Count: 0</span>
  <button>Increment</button>
  
  <!-- 定义一个用于显示外部内容的插槽 -->
  <div>
    <slot name="description">Default description</slot>
  </div>
</template>

<script src="my-counter.js"></script>

<!-- 使用组件 -->
<my-counter>
  <!-- 这段内容将被投影到名为 "description" 的插槽中 -->
  <p slot="description">This is my awesome counter.</p>
</my-counter>
```

**JavaScript (my-counter.js):**
```javascript
class MyCounter extends HTMLElement {
  constructor() {
    super();
    this.count = 0;
    
    // 1. 创建一个 Shadow Root
    this.attachShadow({ mode: 'open' });
    
    // 2. 获取 template 的内容
    const template = document.getElementById('my-counter-template');
    const templateContent = template.content;
    
    // 3. 将 template 的克隆附加到 Shadow Root
    this.shadowRoot.appendChild(templateContent.cloneNode(true));
    
    // 在 Shadow DOM 内部进行查询和事件绑定
    this.counterSpan = this.shadowRoot.querySelector('span');
    this.shadowRoot.querySelector('button').addEventListener('click', () => {
      this.count++;
      this.counterSpan.textContent = `Count: ${this.count}`;
    });
  }
}

customElements.define('my-counter', MyCounter);
```

**这个版本的优势**：
*   **完全封装**：组件的内部结构和样式被 Shadow DOM 完美地保护起来，不会与外部产生任何冲突。
*   **高效复用**：DOM 结构定义在 `<template>` 中，性能更佳。
*   **内容可定制**：通过 `<slot>`，我们可以从外部向组件内部传递内容，使其更具灵活性。
*   **样式可定制**：通过 CSS 自定义属性，外部可以安全地向组件内部传递样式，实现主题化。

这就是 Web Components 的真正威力所在，它为我们提供了一种与框架无关的、遵循 Web 标准的原生组件化方案。

## 5. 属性与事件：组件的数据交互

一个独立的组件还需要与外部进行数据交互。Web Components 主要通过 Attributes/Properties 和 Custom Events 来实现。

### a. 从外到内传递数据 (Props)

可以通过 **HTML Attributes** 和 **JavaScript Properties** 两种方式向组件传递数据。最佳实践是将它们进行**同步**。

```javascript
// my-counter.js
class MyCounter extends HTMLElement {
  // ... constructor ...

  // 1. 声明需要观察的 attribute
  static get observedAttributes() {
    return ['initial-count'];
  }

  // 2. attribute 变化时同步到 property
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'initial-count') {
      const initialValue = Number(newValue);
      this.count = initialValue;
      this.render();
    }
  }

  // 3. 定义 property 的 getter/setter
  get countValue() {
    return this.count;
  }

  set countValue(newValue) {
    this.count = newValue;
    this.render();
  }

  render() {
    this.counterSpan.textContent = `Count: ${this.count}`;
  }
  // ...
}
```

### b. 从内到外传递事件 (Events)

组件可以通过派发**自定义事件 (`CustomEvent`)** 来向外部通信，通知其内部状态发生了变化。

```javascript
// my-counter.js, 在 click 监听器中
this.shadowRoot.querySelector('button').addEventListener('click', () => {
  this.count++;
  this.render();

  // 派发一个自定义事件
  this.dispatchEvent(new CustomEvent('countChanged', {
    detail: {
      newCount: this.count
    }
  }));
});
```
外部就可以像监听普通 DOM 事件一样来监听这个自定义事件：
```javascript
const myCounter = document.querySelector('my-counter');
myCounter.addEventListener('countChanged', (event) => {
  console.log('The count is now:', event.detail.newCount);
});
```
