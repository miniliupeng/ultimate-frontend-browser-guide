# 13-同源策略与跨域解决方案

## 1. 同源策略 (Same-Origin Policy)

**同源策略**是浏览器最核心、最重要的安全策略。它规定，一个源（origin）的文档或脚本，不能与另一个源的资源进行交互。这个策略旨在隔离潜在的恶意文件，保护用户数据安全。

### a. 什么是“源” (Origin)？

“源”由**协议（protocol）**、**域名（domain/host）**和**端口（port）**三部分共同定义。只有当这三者完全相同时，两个 URL 才被认为是同源的。

**示例**：假设当前页面的 URL 是 `http://www.example.com/page.html`

| 待比较的 URL                     | 结果 | 原因                               |
| -------------------------------- | ---- | ---------------------------------- |
| `http://www.example.com/other.html` | 同源 | 协议、域名、端口均相同             |
| `https://www.example.com/page.html` | **跨域** | 协议不同 (`http` vs `https`)       |
| `http://api.example.com/data.json`  | **跨域** | 域名不同（二级域名不同）           |
| `http://www.example.com:8080/page.html` | **跨域** | 端口不同（默认 80 vs 8080）      |

### b. 同源策略的限制

同源策略主要限制了以下三种行为：

1.  **Cookie, LocalStorage, IndexedDB 的访问**：无法读取或设置非同源的客户端存储数据。
2.  **DOM 访问**：无法获取或操作非同源文档的 DOM 树。例如，一个页面无法通过 `iframe` 去操作另一个不同源的页面的 DOM。
3.  **AJAX 请求**：无法发送 `XMLHttpRequest` 或 `fetch` 请求到非同源的服务器地址。这是前端开发中最常遇到的限制。

**值得注意的是**，有一些标签天生就允许跨域加载资源，例如：
*   `<script src="...">`
*   `<link rel="stylesheet" href="...">`
*   `<img src="...">`
*   `<video src="...">`, `<audio src="...">`
*   `<iframe src="...">`

这些标签加载的资源可以被执行（JS）、渲染（CSS, 图片），但加载它们的页面通常无法访问其**内部数据**，这也是同源策略的一种体现。

## 2. 跨域解决方案

“跨域”就是通过各种技术手段来绕过浏览器的同源策略限制，实现不同源之间的资源共享。

### a. CORS (Cross-Origin Resource Sharing) - 跨源资源共享

**CORS 是目前官方推荐、也是最主流的跨域解决方案**。它是一种**服务器端**的机制，允许服务器在响应头中声明哪些源站有权限访问其资源。

#### 简单请求 (Simple Request)

如果一个请求同时满足以下两个条件，它就是一个“简单请求”：
1.  请求方法是 `GET`, `HEAD`, `POST` 之一。
2.  HTTP 头部信息不超出特定字段（如 `Accept`, `Content-Type` 等，且 `Content-Type` 的值仅限于 `text/plain`, `multipart/form-data`, `application/x-www-form-urlencoded`）。

**流程**：
1.  浏览器在请求头中自动添加一个 `Origin` 字段，表明该请求来自哪个源。
   `Origin: http://www.example.com`
2.  服务器收到请求后，检查 `Origin` 字段。如果该源在服务器的许可名单内，服务器会在响应头中添加 `Access-Control-Allow-Origin` 字段。
   `Access-Control-Allow-Origin: http://www.example.com` (或者 `*` 表示允许任何源)
3.  浏览器接收到响应后，检查 `Access-Control-Allow-Origin` 的值是否匹配当前源。如果匹配，请求成功；否则，浏览器会拦截该响应，并在控制台报错。

#### 预检请求 (Preflight Request)

对于不满足“简单请求”条件的“非简单请求”（例如请求方法是 `PUT`, `DELETE`，或者 `Content-Type` 是 `application/json`），浏览器会在发送**正式请求**之前，自动发送一个**预检请求**。

**预检请求**使用 `OPTIONS` 方法，其目的是向服务器“咨询”：即将发送的这个正式请求，是否在你的许可范围之内？

**流程**：
1.  **浏览器发送预检请求 (`OPTIONS`)**：
    *   请求头中包含 `Origin`。
    *   `Access-Control-Request-Method`: 告知服务器，正式请求将使用的方法（如 `PUT`）。
    *   `Access-Control-Request-Headers`: 告知服务器，正式请求将携带的自定义头部。
2.  **服务器响应预检请求**：
    *   如果服务器允许该跨域请求，响应头中会包含：
        *   `Access-Control-Allow-Origin`: 允许的源。
        *   `Access-Control-Allow-Methods`: 允许的方法列表（如 `GET, POST, PUT`）。
        *   `Access-Control-Allow-Headers`: 允许的头部列表。
        *   `Access-Control-Max-Age`: 预检请求的有效时间（秒），在此期间内，同样的请求无需再次发送预检。
3.  **浏览器处理预检响应**：
    *   如果预检响应中的许可信息与即将发送的正式请求匹配, 浏览器才会发送**正式的跨域请求**。
    *   否则, 浏览器会在控制台报错, 正式请求不会被发出。

#### 携带凭证的请求 (Requests with Credentials)

默认情况下，跨域的 `fetch` 或 `XMLHttpRequest` 请求是**不会**发送 `Cookie`、HTTP认证信息等凭证的。如果需要发送，则必须满足以下条件：

1.  **前端设置**：在 `fetch` 请求中添加 `credentials: 'include'` 选项。对于 `XMLHttpRequest`，则需要设置 `withCredentials = true`。
2.  **服务器端设置**：
    *   响应头中必须包含 `Access-Control-Allow-Credentials: true`。
    *   响应头中的 `Access-Control-Allow-Origin` **不能**是通配符 `*`，必须是明确指定的、与请求源一致的域名。

### b. JSONP (JSON with Padding)

*   **原理**：利用 `<script>` 标签没有跨域限制的“漏洞”。
*   **流程**：
    1.  前端定义一个全局回调函数（如 `handleResponse`）。
    2.  通过 `<script>` 标签请求一个跨域的 URL，并将回调函数名作为参数传递过去，例如 `http://api.others.com/data?callback=handleResponse`。
    3.  服务器收到请求后，将要返回的数据作为参数，包裹在一个对该回调函数的调用中，并返回一个 JavaScript 脚本，内容如 `handleResponse({ "data": "some value" })`。
    4.  浏览器接收并执行这个脚本，从而触发了前端定义好的 `handleResponse` 函数，数据也就被成功获取。
*   **缺点**：
    *   **只支持 GET 请求**。
    *   **安全性差**：容易遭受 XSS 攻击，因为它是直接执行外部脚本。
    *   **实现相对复杂**，不如 CORS 直观。
    *   是一种**历史遗留**的解决方案，在现代 Web 开发中**强烈不推荐**使用，除非需要兼容极其古老的浏览器。

### c. 代理 (Proxy)

*   **原理**：利用服务器之间不存在跨域限制的特点。
*   **流程**：
    1.  前端将跨域请求发送给**自己的同源服务器**。
    2.  同源服务器作为一个“中间人”，再将请求转发给目标服务器。
    3.  目标服务器将响应返回给同源服务器。
    4.  同源服务器再将响应返回给前端。
*   **实现**：在开发环境中, 可以通过 Webpack 的 `devServer.proxy` 或 Vite 的 `server.proxy` 快速配置。在生产环境中, 通常通过 Nginx 等反向代理服务器来实现。
*   **优点**：实现简单, 无需目标服务器做任何修改, 是解决跨域问题的一种常用且有效的方式。

### d. 其他跨域通信方式

除了上述主要用于解决 AJAX 请求跨域的方案外，还存在一些适用于特定场景的跨域通信技术。

#### 1. `window.postMessage` (推荐)

`window.postMessage` 是 HTML5 引入的 API，被认为是目前最安全、最推荐的**跨窗口/iframe**通信方式，无论窗口之间是否同源。

*   **发送消息**：`otherWindow.postMessage(message, targetOrigin, [transfer]);`
    *   `otherWindow`: 目标窗口的 `window` 对象引用。
    *   `message`: 要发送的数据。
    *   `targetOrigin`: 目标窗口的源，用于限制消息接收范围，确保安全。

*   **接收消息**：通过监听 `message` 事件。
    *   `event.data`: 接收到的消息数据。
    *   `event.origin`: 发送方窗口的源。**必须校验 `event.origin`**，确保消息来自可信的来源。

**示例：**
```html
<!-- 父窗口: http://a.com/index.html -->
<iframe id="myFrame" src="http://b.com/iframe.html"></iframe>
<script>
    const myFrame = document.getElementById('myFrame');
    myFrame.onload = function() {
        myFrame.contentWindow.postMessage('Hello from parent!', 'http://b.com');
    };

    window.addEventListener('message', function(event) {
        // 必须校验来源
        if (event.origin !== 'http://b.com') return;
        console.log('Received from iframe:', event.data);
    });
</script>

<!-- 子窗口: http://b.com/iframe.html -->
<script>
    window.addEventListener('message', function(event) {
        // 必须校验来源
        if (event.origin !== 'http://a.com') return;
        console.log('Received from parent:', event.data);
        
        // 向父窗口回送消息
        event.source.postMessage('Hi, I am iframe!', event.origin);
    });
</script>
```

#### 2. WebSocket

WebSocket 协议本身支持跨域通信。它的握手请求（一个 HTTP Upgrade 请求）遵循同源策略，因此可能需要服务器进行 CORS 验证。一旦连接成功建立，后续的数据帧传输就不再受同源策略的限制，可以实现持久化的全双工跨域通信。

#### 3. 历史方案 (不推荐)

以下是一些在 `postMessage` 出现之前被使用的“hack”方案，因实现复杂或有安全隐患，在现代开发中已基本被取代。

*   **`iframe + window.name`**: 利用 `window.name` 属性在一个窗口的生命周期内（即使 URL 变化）都保持不变的特点。通过让 `iframe` 先加载一个跨域页面，将数据赋给 `window.name`，然后再将 `iframe` 跳转回同源页面，此时父窗口就可以安全地读取 `iframe` 的 `window.name` 来获取数据。
*   **`iframe + location.hash`**: 利用 URL 的 hash 值（`#` 后面的部分）发生改变不会导致页面刷新的特性。父窗口可以通过修改子窗口的 URL hash 来传递信息，子窗口可以通过定时器监听 `location.hash` 的变化来接收信息。通过一个同源的中间 `iframe`，可以实现更复杂的双向通信。
