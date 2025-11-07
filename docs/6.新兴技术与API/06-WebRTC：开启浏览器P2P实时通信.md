# 06-WebRTC：开启浏览器P2P实时通信

在 Web 的世界里，绝大部分通信都遵循着“客户端-服务器”模型。但如果我们需要实现视频会议、在线协作或 P2P 文件分享这类要求**超低延迟**的实时应用，数据在服务器间的中转就会成为性能瓶颈。`WebRTC` (Web Real-Time Communication) 正是为此而生的革命性技术。

WebRTC 是一项支持浏览器进行任意类型的实时、点对点（Peer-to-Peer, P2P）通信的开放标准。它允许音视频和任意数据在浏览器之间直接传输，无需经过服务器中转，从而极大地降低了延迟，减少了服务器成本。

## 1. WebRTC 的核心能力

*   **低延迟音视频流**：这是 WebRTC 最核心的应用场景，例如在线会议、视频聊天。
*   **任意数据传输**：除了媒体流，还可以创建数据通道（`RTCDataChannel`）来传输任何类型的二进制数据，可用于文件分享、实时同步游戏状态等。
*   **P2P 直连**：通过 ICE 协议，WebRTC 能够智能地穿透 NAT 和防火墙，在两个对等端之间建立直接连接。
*   **安全**：所有 WebRTC 组件都要求强制加密，所有数据流都通过 DTLS (Datagram Transport Layer Security) 进行加密。

## 2. 核心 API 组件

WebRTC 由几个核心的 JavaScript API 组成，它们协同工作以实现实时通信。

### a. `MediaDevices.getUserMedia()`

这是获取用户媒体设备（摄像头、麦克风）的入口。它会提示用户授权，成功后返回一个 `MediaStream` 对象，该对象可以被附加到 `<video>` 元素上进行本地预览，或添加到 P2P 连接中发送给对方。

```javascript
const videoElement = document.querySelector('video');

async function startMedia() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
    });
    // 在本地 <video> 元素上播放媒体流
    videoElement.srcObject = stream;
  } catch (error) {
    console.error('Error accessing media devices.', error);
  }
}
```

### b. `RTCPeerConnection`

这是 WebRTC 的核心接口，负责建立和管理两个对等端之间的连接。它处理了所有复杂的底层工作，包括媒体协商（使用 SDP）、NAT 穿透（使用 ICE）和连接生命周期管理。

### c. `RTCDataChannel`

`RTCDataChannel` 接口允许在对等端之间发送任意数据。它的 API 类似于 WebSocket，但数据是直接在两个浏览器之间传输的。

## 3. 理解“信令” (Signaling)

这是理解 WebRTC 工作方式的关键，也是最容易混淆的地方。

**WebRTC 自身不负责“发现”对方**。它只管建立连接和传输数据。但在连接建立之前，两个素未谋面的浏览器需要一个“中间人”来交换一些元数据，这个过程就叫做**信令 (Signaling)**。

你需要自己搭建一个信令服务器（通常使用 WebSocket 实现）来传递以下信息：

*   **会话控制消息**：用于打开或关闭通信。
*   **网络配置数据 (ICE Candidates)**：包含了浏览器所在网络的 IP 地址、端口等信息，用于 NAT 穿透。
*   **媒体能力数据 (SDP Offer/Answer)**：描述了本地媒体的配置，如分辨率、编解码器等。

**重要**：一旦信令交换完成，P2P 连接成功建立，信令服务器的任务就完成了。之后所有的音视频和数据流都会在浏览器之间直接传输，不再经过服务器。

## 4. 典型连接流程（简化版）

1.  **Peer A** 创建 `RTCPeerConnection` 实例，并调用 `createOffer()` 生成一个 SDP `offer`。
2.  **Peer A** 通过信令服务器将这个 `offer` 发送给 **Peer B**。
3.  **Peer B** 收到 `offer` 后，将其设置为自己的远程描述，然后调用 `createAnswer()` 创建一个 SDP `answer`。
4.  **Peer B** 通过信令服务器将 `answer` 回传给 **Peer A**。
5.  **Peer A** 收到 `answer` 后，将其设置为自己的远程描述。
6.  在此期间，A 和 B 会不断地通过信令服务器交换 ICE 候选者。一旦双方找到一条可用的 P2P 路径，连接就正式建立。

## 总结

WebRTC 是一项功能极其强大的技术，它将 Web 应用的能力从传统的请求-响应模型扩展到了实时的、端到端的通信领域。虽然其 API 和“信令”的概念相对复杂，但它为构建下一代互动式 Web 应用（如在线教育、远程协作、云游戏等）提供了无限可能。
