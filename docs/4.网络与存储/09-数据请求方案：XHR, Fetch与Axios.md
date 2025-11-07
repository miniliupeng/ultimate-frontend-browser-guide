# 09-数据请求方案：XHR, Fetch 与 Axios

从网页诞生之初，异步从服务器获取数据就是其核心能力之一。多年来，我们与服务器对话的方式不断进化，从一个复杂繁琐的 API 演变成现代化的、功能强大的多种方案。本节将深入探讨三种最具代表性的数据请求技术：`XMLHttpRequest` (XHR)，现代标准 `Fetch API`，以及流行的第三方库 `Axios`。

## 1. XMLHttpRequest (XHR)

`XMLHttpRequest` 是一个诞生已久的浏览器 API，它为浏览器提供了在不刷新页面的情况下，与服务器进行数据交换的能力。它是 AJAX (Asynchronous JavaScript and XML) 技术革命的基石。

*   **API 特点**：基于事件和回调函数来处理异步操作。你需要监听 `readystatechange` 事件，并在不同的状态 (`readyState`) 下处理响应。
*   **优点**：
    *   **兼容性好**：作为一项老牌技术，它兼容所有浏览器，包括非常古老的 IE。
*   **缺点**：
    *   **API 繁琐**：配置和调用一个 XHR 请求需要编写大量的模板代码。
    *   **回调地狱**：基于事件的设计使其在处理复杂的、有依赖关系的请求链时，很容易陷入“回调地狱”。

### 示例：使用 XHR 发起 GET 请求

```javascript
const xhr = new XMLHttpRequest();

xhr.onreadystatechange = function() {
  // readyState === 4 表示请求已完成
  if (xhr.readyState === 4) {
    // status === 200 表示请求成功
    if (xhr.status === 200) {
      const responseData = JSON.parse(xhr.responseText);
      console.log(responseData);
    } else {
      console.error('XHR Error:', xhr.statusText);
    }
  }
};

xhr.onerror = function() {
  console.error('Network Error');
};

xhr.open('GET', 'https://api.example.com/data', true);
xhr.send(null);
```

## 2. Fetch API

`Fetch API` 是现代浏览器为网络请求提供的原生、标准化的接口，旨在替代 XHR。它在设计上更现代，并且基于 `Promise`，完美地融入了现代 JavaScript 的异步编程模型。

*   **API 特点**：基于 `Promise`，支持 `async/await` 语法。API 设计更简洁、语义化，将请求 (`Request`) 和响应 (`Response`) 抽象为独立的对象。
*   **优点**：
    *   **语法简洁**：链式调用和 `async/await` 让异步代码更易读、易写。
    *   **功能强大**：原生支持流式处理响应体，对处理大数据和实时数据流非常友好。
    *   **标准统一**：作为 W3C 标准，是未来的发展方向。
*   **值得注意的“怪癖”**：
    *   **HTTP 错误不 reject**：`fetch()` 返回的 Promise **只在网络层面失败**（如DNS错误、网络中断）时才会 `reject`。对于 `404 Not Found` 或 `500 Internal Server Error` 这样的 HTTP 错误状态，它会正常 `resolve`。你必须通过检查 `response.ok` 或 `response.status` 来手动判断请求是否成功。

### a. 核心概念：`Request`, `Response`, `Headers`

Fetch API 的强大之处在于其面向对象的设计，它将 HTTP 的各个部分抽象成了独立的对象。

*   **`Headers` 对象**：用于操作 HTTP 请求头和响应头。
    ```javascript
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('X-Custom-Header', 'my-value');
    ```

*   **`Request` 对象**：代表一个资源请求。你可以用它来构建一个复杂的请求。
    ```javascript
    const request = new Request('/api/users', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ name: 'John Doe' })
    });
    ```

*   **`Response` 对象**：代表对一个请求的响应。`fetch()` 返回的 Promise 会 resolve 这个对象。
    *   `response.ok`: 布尔值，表示状态码是否在 200-299 范围内。
    *   `response.status`: 数字，HTTP 状态码。
    *   `response.headers`: `Headers` 对象。
    *   **处理响应体的方法** (这些方法都返回 Promise):
        *   `response.json()`: 解析为 JSON 对象。
        *   `response.text()`: 解析为字符串。
        *   `response.blob()`: 解析为 Blob 对象（用于处理文件/图片）。
        *   `response.arrayBuffer()`: 解析为 ArrayBuffer（用于处理二进制数据）。

### b. POST 请求示例

```javascript
async function postData(url = '', data = {}) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('Success:', responseData);
    return responseData;
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

postData('https://api.example.com/users', { name: 'John Doe' });
```

### c. 中断请求：`AbortController`

这是 Fetch API 相较于 XHR 的一个巨大改进。

```javascript
// 1. 创建一个控制器
const controller = new AbortController();
const signal = controller.signal;

// 2. 将 signal 传递给 fetch
fetch('https://api.example.com/long-running-task', { signal })
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(err => {
    if (err.name === 'AbortError') {
      console.log('Fetch aborted');
    } else {
      console.error('Fetch error:', err);
    }
  });

// 3. 在需要的时候，调用 abort() 来中断请求
setTimeout(() => controller.abort(), 2000); // 2秒后中断请求
```

### d. 深入 Fetch：流式处理响应

在处理大型数据或实时数据流时，一次性将所有数据读入内存可能会导致应用卡顿甚至崩溃。`fetch` API 原生支持**流式处理（Streaming）**响应体，允许我们分块处理数据，这正是它的强大之处。

`response.body` 是一个**可读流 (ReadableStream)** 对象。使用流可以**降低内存占用**、**提升响应速度**（在数据完全到达前开始处理）。

**使用 `getReader()`**

```javascript
fetch('/streaming-data')
  .then(response => {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    function readChunk() {
      return reader.read().then(({ done, value }) => {
        if (done) {
          console.log('Stream finished.');
          return;
        }
        const chunkText = decoder.decode(value);
        console.log('Received chunk:', chunkText);
        return readChunk();
      });
    }
    return readChunk();
  });
```

**现代语法：Async Iterators**

对于现代浏览器，我们可以使用 `for await...of` 循环来更优雅地处理流。

```javascript
async function processStream() {
  try {
    const response = await fetch('/streaming-data');
    const decoder = new TextDecoder();

    // 使用 for await...of 循环来遍历流中的数据块
    for await (const chunk of response.body) {
      const chunkText = decoder.decode(chunk);
      console.log('Received chunk:', chunkText);
    }
    console.log('Stream finished.');
  } catch (error) {
    console.error('Streaming error:', error);
  }
}

processStream();
```

## 3. Axios

`Axios` 是一个基于 Promise 的、目前最流行的第三方 HTTP 客户端库。它可以在浏览器和 Node.js 中使用。你可以把它看作是在 XHR 之上封装的一层更易用、功能更丰富的 API。

*   **API 特点**：同样基于 `Promise`，提供了许多开箱即用的便利功能。
*   **优点**：
    *   **API 极其易用**：自动转换 JSON 数据，无需手动处理。
    *   **请求与响应拦截器**：这是 Axios 最强大的功能之一。你可以在请求发送前或响应返回后，进行全局的、统一的逻辑处理（如添加 token、处理全局错误、显示 loading 状态等）。
    *   **错误处理更直观**：任何非 `2xx` 的状态码都会导致 Promise 被 `reject`，这更符合大多数开发者的直觉。
    *   **客户端支持防御 XSRF**。
    *   **请求取消**功能。

### 示例：使用 Axios 并设置拦截器

```javascript
// main.js - 全局配置
axios.defaults.baseURL = 'https://api.example.com';

// 添加请求拦截器
axios.interceptors.request.use(function (config) {
  // 在发送请求之前做些什么，例如添加 token
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, function (error) {
  return Promise.reject(error);
});

// a-component.js - 在组件中使用
async function getUser() {
  try {
    const response = await axios.get('/users/1');
    console.log(response.data);
  } catch (error) {
    // 任何非 2xx 的状态码都会在这里被捕获
    console.error('Axios Error:', error.response.data);
  }
}
```

## 4. 终极对比

| 特性             | XMLHttpRequest (XHR)                 | Fetch API                                    | Axios                                                        |
| ---------------- | ------------------------------------ | -------------------------------------------- | ------------------------------------------------------------ |
| **API 风格**     | 基于事件和回调                       | 基于 Promise，现代、原生                     | 基于 Promise，封装良好                                       |
| **易用性**       | 繁琐，需要大量模板代码               | 简洁，但有学习曲线（如错误处理）             | 非常易用，开箱即用                                           |
| **JSON 解析**    | 手动 (`JSON.parse`)                  | 手动 (`response.json()`)                     | 自动                                                         |
| **拦截器**       | 不支持                               | 不支持                                       | **支持 (核心优势)**                                          |
| **错误处理**     | 通过 `onerror` 和 `readyState` 判断    | **只对网络错误 reject**，需手动检查 `response.ok` | **对所有非 2xx 状态码 reject**，更符合直觉                   |
| **请求取消**     | `abort()`                            | `AbortController` (标准方案)                 | `CancelToken` / `AbortController` (v0.22.0+ 支持)            |
| **浏览器支持**   | 所有浏览器                           | 所有现代浏览器，IE 不支持                    | 所有浏览器 (底层使用 XHR)                                    |
| **环境**         | 仅浏览器                             | 浏览器原生，Node.js 需 polyfill 或 v18+ 支持 | 浏览器和 Node.js                                             |
| **流式处理**     | 不支持                               | **支持 (核心优势)**                          | 不直接支持                                                   |

## 5. 总结与选型建议

*   **`XMLHttpRequest`**: 除非你需要兼容非常古老的浏览器，否则在现代项目中**没有理由**再直接使用它。
*   **`Fetch API`**: 作为**浏览器原生标准**，它是未来的方向。对于简单的、一次性的数据请求，或者需要处理**流式响应**的场景，它是绝佳的选择。你需要习惯于它的错误处理方式。
*   **`Axios`**: 对于**复杂的、大型的 Web 应用**，Axios 仍然是首选。它的**拦截器**机制对于构建可维护、可扩展的 API 请求层至关重要。自动 JSON 转换和更直观的错误处理也极大地提升了开发效率。

总的来说，一个常见的最佳实践是：在小型项目或个人项目中拥抱 `Fetch` 标准，在需要工程化、可维护性的大型项目中，则可以放心地依赖像 `Axios` 这样成熟可靠的库。
