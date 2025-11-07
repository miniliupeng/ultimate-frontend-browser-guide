# 14-实时通信：WebSocket 与 SSE

传统的 HTTP 是一种“拉”（pull）协议，客户端发起请求，服务器响应。在这种模型下，服务器无法主动向客户端推送数据。为了实现实时更新（如聊天、股价更新、通知），开发者们曾采用了一些“模拟”技术，但它们都存在延迟高、资源浪费等问题。

### 传统“模拟”实时技术

*   **轮询 (Polling)**：客户端**每隔一个固定的时间**（如 2 秒）就向服务器发送一次 HTTP 请求，询问是否有新数据。无论有无新数据，服务器都立即响应。这会产生大量无效请求，实时性也受限于轮询间隔。
*   **长轮询 (Long-Polling)**：客户端发送请求后，服务器**如果有新数据就立即响应**；如果**没有新数据，则会“挂起”这个连接**，直到有新数据产生时再响应。客户端收到响应后，立即发起下一次请求。相比轮询，它减少了无效请求，提高了实时性，但仍然是基于 HTTP 请求-响应模型的模拟，资源消耗和延迟相对较高。

为了从根本上解决 Web 实时通信的需求，现代浏览器提供了两种原生的解决方案：**WebSocket** 和 **Server-Sent Events (SSE)**。

## 1. WebSocket

WebSocket 是一种在**单个 TCP 连接**上进行**全双工 (Full-duplex)** 通信的协议。它允许客户端和服务器之间进行**双向的、实时的**数据传输。

### a. 核心特点

*   **真正的双向通信**：连接建立后，客户端和服务器都可以随时、主动地向对方发送数据。
*   **持久化连接**：与 HTTP 不同，WebSocket 连接一旦建立，就会保持活动状态，直到一方明确关闭连接。这避免了 HTTP 频繁建立和销毁连接的开销。
*   **低延迟、低开销**：WebSocket 的数据帧头部非常小（通常只有 2-10 字节），相比 HTTP 请求庞大的头部，传输开销极低，因此延迟也更小。
*   **独立的协议**：WebSocket 有自己的协议规范（`ws://` 和 `wss://`），它始于一次特殊的 HTTP “升级”请求。

### b. 连接过程

1.  **HTTP 握手 (Handshake)**：
    *   客户端首先发起一个标准的 HTTP GET 请求，但其中包含了特殊的升级头部：
        ```http
        GET /chat HTTP/1.1
        Host: server.example.com
        Connection: Upgrade
        Upgrade: websocket
        Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
        Sec-WebSocket-Version: 13
        ```
    *   服务器如果同意升级，会返回一个 `101 Switching Protocols` 的响应，确认连接升级为 WebSocket。
2.  **建立连接**：握手成功后，底层的 TCP 连接就被保留下来，用于后续的 WebSocket 通信。此后的数据传输都遵循 WebSocket 的帧格式，不再是 HTTP 协议。

### c. API 使用

```javascript
// 1. 创建 WebSocket 连接
// 第二个参数是可选的子协议数组，用于协商更高层的应用协议
const socket = new WebSocket('wss://example.com/socket', ['json-rpc', 'xml']);

// 2. 监听连接打开事件
socket.onopen = function(event) {
  console.log('Connection opened!');
  // 连接成功后，可以开始发送数据
  socket.send('Hello Server!');
};

// 3. 监听消息事件
socket.onmessage = function(event) {
  console.log('Message from server: ', event.data);
};

// 4. 监听错误事件
socket.onerror = function(error) {
  console.error('WebSocket Error: ', error);
};

// 5. 监听连接关闭事件
socket.onclose = function(event) {
  if (event.wasClean) {
    console.log(`Connection closed cleanly, code=${event.code}, reason=${event.reason}`);
  } else {
    // 例如，服务器进程被杀死或网络中断
    console.error('Connection died');
  }
};

// 6. 主动关闭连接
// socket.close();
```

### d. 弱网环境下的健壮性策略

在移动端或不稳定的网络环境下，WebSocket 连接可能会频繁断开。为了保证通信的可靠性，通常需要实现以下策略：

*   **1. 心跳机制 (Heartbeat)**
    *   **问题**: 在弱网环境下，连接可能已经“假死”（TCP 连接未断开，但双方无法通信），客户端和服务器都无法及时感知。
    *   **解决方案**: WebSocket 协议本身定义了 `Ping` 和 `Pong` 控制帧。客户端可以定期（例如每 30 秒）向服务器发送一个 `Ping` 帧。如果服务器在一定时间内没有收到客户端的 `Ping` 帧，或者客户端发送 `Ping` 后没有及时收到服务器的 `Pong` 响应，就可以认为连接已经断开，然后主动关闭连接。这可以快速检测到“僵尸连接”，并且占用的带宽极小。

*   **2. 自动重连 (Automatic Reconnection)**
    *   **问题**: 连接断开后，需要一种机制来自动恢复。
    *   **解决方案**: 客户端应该监听 WebSocket 的 `onclose` 事件。一旦连接关闭，就启动重连逻辑。为了避免在服务器或网络暂时不可用时，客户端发起大量无效的重连请求，应该采用**指数退避算法 (Exponential Backoff)**。例如，第一次断开后立即重连，如果失败，则等待 2 秒，再次失败则等待 4 秒、8 秒... 直到达到一个最大重试间隔。

*   **3. 消息队列与确认机制 (ACK)**
    *   **问题**: `socket.send()` 方法只是将消息放入发送缓冲区，在弱网下消息容易丢失，它并不保证对方一定能收到。
    *   **解决方案**: 实现一个应用层的确认机制。
        1.  每条消息都带有一个唯一的 ID。
        2.  发送方发送消息后，将其存入一个“待确认”列表，并启动一个超时计时器。
        3.  接收方收到消息后，向发送方回复一个包含该消息 ID 的 ACK 消息。
        4.  发送方收到 ACK 后，将消息从“待确认”列表中移除。
        5.  如果超时仍未收到 ACK，发送方会重新发送该消息。

*   **4. 断线续传与状态同步**
    *   **问题**: 重连成功后，客户端需要知道自己离线期间错过了哪些消息。
    *   **解决方案**: 为消息增加连续的序列号。客户端重连后，可以把自己最后收到的消息序列号发给服务器。服务器根据客户端的序列号，将所有后续的离线消息重新发送给客户端。

*   **5. 数据压缩**
    *   **问题**: 在带宽有限的弱网环境中，减少数据传输量可以有效提高通信效率。
    *   **解决方案**: WebSocket 协议支持 `permessage-deflate` 扩展，可以在协议层面对消息进行压缩。同时，也可以考虑使用更紧凑的应用层数据格式（如 Protocol Buffers）替代 JSON。

## 2. Server-Sent Events (SSE)

Server-Sent Events 是一种允许服务器**单向**向客户端推送事件和数据的技术。它基于标准的 HTTP 协议，非常轻量和易用。

### a. 核心特点

*   **服务器单向推送**：连接建立后，只有服务器可以向客户端发送数据。客户端无法通过此连接向服务器发送消息。
*   **基于 HTTP**：SSE 运行在单个持久化的 HTTP 连接之上，无需新的协议。
*   **自动重连**：SSE 内置了断线重连机制。如果连接意外中断，浏览器会在一段时间后自动尝试重新连接。
*   **事件流**：服务器发送的数据是一个持续的事件流，可以为不同的消息定义事件类型。

### b. 协议与数据格式

服务器端的响应必须包含特定的 `Content-Type: text/event-stream` 头部。响应体由一系列的事件消息组成，每条消息由一个或多个 `key: value` 格式的行构成，并以两个换行符 `\n\n` 结尾。

*   `data`: 消息的数据内容。
*   `event`: 事件类型，客户端可以据此监听不同类型的消息。
*   `id`: 消息的唯一 ID。当连接断开并自动重连时，浏览器会自动在请求头中附带一个 `Last-Event-ID` 字段，其值就是上一次成功接收到的消息的 `id`。这样，服务器就可以根据这个 ID，补发所有客户端离线期间错过的消息。
*   `retry`: 指示浏览器在断线后应该等待多少毫秒再尝试重连。

**服务器端响应示例 (Node.js):**
```
HTTP/1.1 200 OK
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive

// 发送一条简单的消息
data: Some message\n\n

// 发送一条带有事件类型的消息
event: user-login
data: {"username": "John"}\n\n

// 发送一条带有 ID 和重试时间的消息
id: 12345
data: Another message
retry: 10000\n\n
```

### c. API 使用

```javascript
// 1. 创建 EventSource 实例
const evtSource = new EventSource('/events');

// 2. 监听默认的 'message' 事件
evtSource.onmessage = function(event) {
  console.log('Default message: ', event.data);
};

// 3. 监听自定义的 'user-login' 事件
evtSource.addEventListener('user-login', function(event) {
  const userData = JSON.parse(event.data);
  console.log('User login: ', userData.username);
});

// 4. 监听错误事件
evtSource.onerror = function(err) {
  console.error("EventSource failed:", err);
  // 如果发生致命错误，可以关闭连接
  // evtSource.close();
};

// 5. 主动关闭连接
// evtSource.close();
```

## 3. WebSocket vs SSE - 总结与对比

| 特性         | WebSocket                                  | SSE (Server-Sent Events)                      |
| ------------ | ------------------------------------------ | --------------------------------------------- |
| **通信方向** | **双向通信 (全双工)**                      | **服务器 -> 客户端 (单向)**                   |
| **底层协议** | 独立的 `ws`/`wss` 协议                     | 标准的 HTTP/HTTPS 协议                        |
| **自动重连** | 否 (需要手动实现)                          | **是 (内置机制)**                             |
| **API**      | `WebSocket` API                            | `EventSource` API                             |
| **数据类型** | 文本、二进制数据                           | 纯文本 (UTF-8)                                |
| **错误处理** | 简单的 `onerror` 事件                      | 相对更详细的错误处理                          |
| **兼容性**   | 现代浏览器普遍支持                         | 所有现代浏览器支持 (IE/Edge Legacy 不支持)    |

**如何选择？**
*   **当你需要真正的双向通信时**，例如：
    *   在线多人游戏
    *   协同编辑应用
    *   即时聊天室（客户端需要频繁发送消息）
    *   **选择 `WebSocket`**

*   **当你只需要从服务器接收实时更新时**，例如：
    *   股票价格、体育比分更新
    *   新闻、动态资讯推送
    *   站内信、新订单通知
    *   **选择 `SSE`**。它更轻量、更简单，并且利用了现有的 HTTP 基础，更容易在现有架构上实现。

