# 15-HTTP安全头部详解

除了我们在 XSS 和 CSRF 章节中讨论的防御策略，现代浏览器还支持一系列的 HTTP 响应头，它们可以作为多层防御体系（Defense-in-Depth）的一部分，极大地增强 Web 应用的安全性。配置好这些安全头部，是每一个线上应用的必修课。

## 1. Content-Security-Policy (CSP)

*   **作用**：**缓解 XSS 攻击**。
*   **原理**：CSP 是防御 XSS 的一道强有力的防线。它通过设置一个“白名单”，告知浏览器只允许加载和执行来自指定来源的资源。即使攻击者成功注入了恶意脚本，由于其来源不在白名单内，浏览器也会拒绝执行它。
*   **配置示例**：
    ```http
    Content-Security-Policy: default-src 'self'; script-src 'self' https://apis.google.com; img-src *;
    ```
    *   `default-src 'self'`: 默认只允许加载来自同源的资源。
    *   `script-src 'self' https://apis.google.com`: 脚本只能来自同源或 `https://apis.google.com`。
    *   `img-src *`: 图片可以来自任何来源。
*   **重要性**：CSP 是防止 XSS 的最佳实践之一，虽然配置可能相对复杂，但提供了极高的安全收益。

## 2. HTTP Strict-Transport-Security (HSTS)

*   **作用**：**强制浏览器使用 HTTPS 通信**，防止中间人攻击（MITM）中的 SSL 剥离攻击。
*   **原理**：当用户首次通过 HTTPS 访问网站时，服务器返回 `Strict-Transport-Security` 头部。浏览器收到后会记录下来，在接下来指定的时间内（`max-age`），任何对该网站的 **HTTP** 访问请求，都会在**浏览器内部**被自动转换为 **HTTPS** 请求。
*   **配置示例**：
    ```http
    Strict-Transport-Security: max-age=31536000; includeSubDomains
    ```
    *   `max-age=31536000`: 强制 HTTPS 的有效期为一年。
    *   `includeSubDomains`: 策略同样适用于所有子域名。
*   **重要性**：对于提供了 HTTPS 服务的网站，HSTS 是必不可少的安全配置，它从根本上杜绝了降级到不安全 HTTP 的可能性。

## 3. X-Frame-Options

*   **作用**：**防止点击劫持 (Clickjacking)**。
*   **原理**：点击劫持是一种视觉欺骗攻击，攻击者使用一个透明的 `<iframe>` 覆盖在你的网站上，诱导用户点击 `<iframe>` 中的按钮，而用户实际上点击的是被覆盖的、你网站上的危险操作（如“删除账户”按钮）。
    `X-Frame-Options` 头部可以控制你的网站是否允许被嵌入到 `<iframe>` 或 `<frame>` 中。
*   **配置选项**：
    *   `DENY`: 完全禁止任何页面嵌入。
    *   `SAMEORIGIN`: 只允许同源的页面嵌入。
    *   `ALLOW-FROM uri`: (已废弃) 只允许来自指定 URI 的页面嵌入。
*   **现代替代方案**：虽然 `X-Frame-Options` 仍然广泛使用，但更现代的做法是使用 CSP 的 `frame-ancestors` 指令，它提供了更灵活的控制。
    ```http
    Content-Security-Policy: frame-ancestors 'self' https://partner.com;
    ```

## 4. X-Content-Type-Options

*   **作用**：**防止 MIME 类型嗅探攻击**。
*   **原理**：某些旧版本的浏览器会尝试“猜测”（嗅探）资源的 `Content-Type`，而不是严格遵守服务器返回的类型。例如，一个本应是图片的 URL，如果返回的内容看起来像 JavaScript，浏览器可能会尝试执行它，从而导致 XSS 漏洞。
    这个头部只有一个值 `nosniff`，它会禁用浏览器的这种嗅探行为，强制浏览器严格遵守 `Content-Type` 头部。
*   **配置示例**：
    ```http
    X-Content-Type-Options: nosniff
    ```
*   **重要性**：这是一个简单但有效的安全加固措施。

## 5. Referrer-Policy

*   **作用**：**控制 `Referer` 头部的发送策略，保护用户隐私**。
*   **原理**：`Referer` 请求头包含了当前请求是从哪个 URL 跳转而来的。这在某些情况下可能会泄露用户的敏感信息（例如，一个 URL `.../reset_password?token=...`）。`Referrer-Policy` 允许网站控制在何种情况下发送 `Referer` 头部，以及发送多少信息。
*   **常用配置选项**：
    *   `no-referrer`: 完全不发送 `Referer` 头部。
    *   `strict-origin-when-cross-origin` (默认行为):
        *   同源请求时，发送完整的 URL。
        *   跨域请求时，只发送源（协议+域名+端口），不包含路径和参数。
        *   在从 HTTPS 向 HTTP 降级请求时不发送。
    *   `same-origin`: 只在同源请求时发送 `Referer`。
*   **配置示例**：
    ```http
    Referrer-Policy: strict-origin-when-cross-origin
    ```

## 6. Permissions-Policy

*   **作用**：**控制浏览器功能的访问权限**，遵循“最小权限原则”。
*   **原理**：这是一个较新的安全头部（取代了旧的 `Feature-Policy`），允许网站明确声明哪些浏览器功能（如摄像头 `camera`、麦克风 `microphone`、地理位置 `geolocation` 等）是被允许的，以及允许在哪些源中使用。
*   **作用**：可以有效防止页面被第三方脚本（如广告、`iframe`）滥用敏感的浏览器 API，增强网站的安全性和对用户隐私的保护。
*   **配置示例**：
    ```http
    Permissions-Policy: camera=(), microphone=(), geolocation=(self "https://trusted-partner.com")
    ```
    *   `camera=()`: 在当前页面及所有 `iframe` 中禁用摄像头 API。
    *   `geolocation=(self "https://trusted-partner.com")`: 只允许同源及 `trusted-partner.com` 的 `iframe` 使用地理位置 API。

## 7. 跨域隔离相关头部 (COOP & COEP)

这两个头部通常需要配合使用，用于开启“跨域隔离” (Cross-Origin Isolation) 状态，以防御“幽灵 (Spectre)”等旁路攻击，并解锁 `SharedArrayBuffer` 等强大的 Web API。

### a. `Cross-Origin-Opener-Policy` (COOP)
*   **作用**：隔离**顶级窗口**之间的上下文关系，防止恶意窗口通过 `window.opener` 引用你的页面并发起攻击。
*   **常用配置**：
    *   `same-origin`: 确保只有同源的窗口才能建立 `opener` 关系。
    *   `same-origin-allow-popups`: 在保持隔离的同时，允许页面打开的弹出窗口保留对 `opener` 的引用。

### b. `Cross-Origin-Embedder-Policy` (COEP)
*   **作用**：控制页面可以嵌入哪些**跨域资源**。
*   **常用配置**：
    *   `require-corp`: 要求所有跨域资源（如图片、脚本）都必须通过 CORS 或 CORP (`Cross-Origin-Resource-Policy`) 头部明确授权嵌入。
*   **重要性**：开启跨域隔离是 Web 安全的未来方向，虽然配置较为复杂，但它为构建高安全、高性能的应用提供了基础。

## 总结

配置这些 HTTP 安全头部是一种低成本、高收益的安全投资。它们与应用代码的防御逻辑（如输入校验、权限控制）相辅相成，共同构建起一个纵深防御体系，有效提升应用的整体安全性。
