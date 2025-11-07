# 15-Web Workers：解放主线程的利器

我们在前面的章节中反复强调，JavaScript 是单线程的，长时间的同步代码会阻塞主线程，导致 UI 卡死。事件循环机制通过异步任务有效地解决了 **I/O 密集型**任务的阻塞问题，但它并不能解决 **CPU 密集型**任务带来的挑战。

## 1. 为什么需要 Web Worker？事件循环的局限

*   **I/O 密集型任务 (I/O-Bound)**
    *   **特点**：任务的大部分时间都在等待外部资源（如网络响应、磁盘读写），CPU 处于空闲状态。
    *   **事件循环如何解决**：通过异步回调，JS 主线程可以将 I/O 操作交给浏览器的其他线程处理，自己则继续响应用户交互和 UI 渲染，等 I/O 操作完成后再通过任务队列执行回调。

*   **CPU 密集型任务 (CPU-Bound)**
    *   **特点**：任务需要持续占用 CPU 进行大量的计算（如复杂的数学运算、图像处理、数据加解密等）。
    *   **事件循环的无力**：这类任务会持续霸占 JS 主线程的调用栈，直到计算完成。即使你把它放进 `setTimeout`，当它开始执行时，依然会冻结整个页面。

为了解决 CPU 密集型任务的阻塞问题，**Web Worker** 应运而生。它允许我们在**后台线程**中执行 JavaScript，这个线程完全独立于主线程，因此可以在不影响页面响应性的前提下处理耗时的计算任务。

## 2. Web Worker 基础

Web Worker 的核心思想是**让主线程专注于 UI 交互，而将复杂的计算任务交给 Worker 线程**。

### a. 创建与启动 Worker

创建一个 Worker 非常简单，只需提供一个独立的 JS 文件的路径即可：

```javascript
// main.js (主线程)
const myWorker = new Worker('worker.js');
```

`new Worker()` 的调用会创建一个新的操作系统级别的线程，并开始异步下载和执行 `worker.js` 文件中的代码。

> **现代化用法：模块化 Worker**
> 现代浏览器允许我们创建模块化的 Worker，这使得我们可以在 Worker 脚本中使用 `import`/`export` 语法，更好地与现代前端工程化集成。
> ```javascript
> // main.js
> const myModuleWorker = new Worker('worker-module.js', { type: 'module' });
> ```

### b. 主线程与 Worker 线程的通信

主线程和 Worker 线程是完全隔离的，它们存在于不同的全局上下文中（Worker 中没有 `window` 和 `document` 对象）。它们之间唯一的通信方式是通过一个类似事件监听的机制：`postMessage()` 和 `onmessage` 事件。

**从主线程向 Worker 发送消息：**

```javascript
// main.js (主线程)
const myWorker = new Worker('worker.js');

// 发送一个简单的字符串
myWorker.postMessage('Hello, Worker!');

// 发送一个对象
myWorker.postMessage({ command: 'start', data: [1, 2, 3] });
```

**在 Worker 线程中接收并响应消息：**

```javascript
// worker.js (Worker 线程)

// 监听来自主线程的消息
self.onmessage = function(event) {
  console.log('Message received from main script:', event.data);

  // 进行一些耗时的计算
  const result = processData(event.data);

  // 将计算结果发送回主线程
  self.postMessage(result);
};

// 也可以使用 addEventListener
// self.addEventListener('message', function(event) { ... });

function processData(data) {
  // 模拟一个耗时的 CPU 密集型任务
  let sum = 0;
  for (let i = 0; i < 1000000000; i++) {
    sum += i;
  }
  return `Processed data: ${data}, Result: ${sum}`;
}
```

**在主线程中接收来自 Worker 的消息：**

```javascript
// main.js (主线程)
myWorker.onmessage = function(event) {
  console.log('Message received from worker:', event.data);
  // 在这里可以用 worker 返回的结果来更新 UI
  document.getElementById('result').textContent = event.data;
};
```

### c. 终止 Worker

当不再需要 Worker 时，为了释放内存和系统资源，我们应该终止它。

*   **从主线程终止**：
    ```javascript
    myWorker.terminate();
    ```
*   **从 Worker 内部自我终止**：
    ```javascript
    // worker.js
    self.close();
    ```

### d. 错误处理

健壮的代码需要完善的错误处理机制。

*   **在主线程中捕获错误**：可以通过监听 Worker 实例的 `error` 事件来捕获 Worker 脚本中未被捕获的异常。
    ```javascript
    myWorker.onerror = function(event) {
      console.error('Error in worker:', event.message, 'at', event.filename, ':', event.lineno);
    };
    ```
*   **在 Worker 内部处理错误**：在 Worker 内部，同样可以使用 `try...catch` 来捕获和处理错误，并通过 `postMessage` 将结构化的错误信息发送回主线程。

## 3. Worker 的类型：Dedicated vs Shared

我们上面讨论的 `Worker`，在规范中被称为 **Dedicated Worker**（专用 Worker），它的特点是**只服务于创建它的那一个页面上下文**。除此之外，Web Worker API 还提供了另一种类型：`SharedWorker`。

*   **`SharedWorker` (共享 Worker)**：
    *   **特点**：一个 `SharedWorker` 实例可以被**多个同源的浏览上下文**（如多个标签页、`iframe`）所共享和访问。
    *   **用途**：非常适合实现**跨标签页的状态同步或通信**，例如多页面应用的“消息总线”或“数据同步中心”。
    *   **通信差异**：与 `SharedWorker` 的通信需要通过其 `port` 对象进行。每个连接到 `SharedWorker` 的页面都会创建一个独立的端口（port）。
        ```javascript
        // main.js - 连接到一个 SharedWorker
        const mySharedWorker = new SharedWorker('shared-worker.js');
        mySharedWorker.port.start(); // 必须启动端口
        mySharedWorker.port.postMessage('Hello from a page!');
        ```

## 4. Worker 的能力与限制

### a. Worker 可以做什么？

*   执行任意复杂的 JavaScript 计算。
*   使用 `setTimeout` 和 `setInterval`。
*   访问 `navigator` 对象的大部分属性（如 `userAgent`, `geolocation`）。
*   发起网络请求（`XMLHttpRequest`, `fetch`）。
*   创建新的 Worker（子 Worker）。
*   使用 `IndexedDB` 进行数据存储。

### b. Worker 不能做什么？

*   **无法直接访问 DOM**：这是最重要的限制。因为 Worker 运行在与主线程不同的线程中，直接操作 DOM 会引发竞态条件。所有 UI 更新都必须通过 `postMessage` 通知主线程来完成。
*   **无法访问 `window` 和 `document` 对象**。
*   **无法访问 `parent` 对象**。

## 5. 数据传输：结构化克隆算法

主线程和 Worker 之间通过 `postMessage` 传递数据时，并不是共享内存，而是**复制数据**。这个复制过程使用的是**结构化克隆算法（Structured Clone Algorithm）**。

*   **优点**：可以复制大多数复杂的 JavaScript 对象，包括 `Object`, `Array`, `Date`, `RegExp`，甚至 `File`, `Blob`, `ArrayBuffer` 等，解决了 `JSON.stringify` 无法处理循环引用和特定类型的问题。
*   **缺点**：每次通信都涉及数据的复制，如果数据量巨大，可能会产生显著的性能开销。

为了解决大数据传输的性能问题，Worker 提供了**可转移对象（Transferable Objects）** 的概念。通过它，可以实现内存的**所有权转移**，而不是复制。例如，在传输一个 `ArrayBuffer` 时，主线程会失去对它的控制权，将其所有权直接转移给 Worker，这是一个近乎瞬时的操作。

```javascript
// main.js
const buffer = new ArrayBuffer(1024);
myWorker.postMessage(buffer, [buffer]); // 第二个参数指定要转移的对象

// 此时，主线程中的 buffer 变量将无法再被访问
```

## 6. 典型应用场景

*   **大规模数据处理**：在前端解析和处理大型文件（如 CSV, JSON）、进行数据分析等。
*   **复杂科学计算**：如图形学计算、物理模拟、生物信息学分析等。
*   **图像、音频、视频处理**：在后台线程中对多媒体数据进行滤镜、编码解码、分析等操作。
*   **预取和缓存**：在后台提前请求和缓存应用所需的数据，提升用户体验。
*   **后台同步**：通过 Service Worker（一种特殊的 Worker）实现离线数据同步。
