# 05-内容安全策略（CSP）详解：构建坚不可摧的防线

在 Web 安全的攻防战中，跨站脚本攻击（XSS）无疑是最常见、最持久的威胁之一。尽管我们采取了输入过滤、输出转义等多种防御手段，但只要有任何一处疏漏，攻击者就可能成功注入恶意脚本。为了彻底改变这种被动的局面，浏览器提供了一项强大的“终极防御”机制——**内容安全策略 (Content Security Policy, CSP)**。

CSP 的核心思想非常简单：**通过建立一个可信资源来源的“白名单”，让浏览器只执行和加载来自这些来源的资源，从而从根本上杜绝未知来源的脚本执行**。即使攻击者成功地向页面注入了 `<script>` 标签，由于其来源不在白名单上，浏览器也会直接拒绝执行它。

CSP 是通过 `Content-Security-Policy` HTTP 头部来启用的。

## 1. 核心指令详解

一个 CSP 策略由一系列指令（directives）组成，每个指令控制一类资源的加载策略。

*   **`default-src`**: 这是一个备用指令，用于设置其他所有指令（`*-src`）的默认值。如果某个特定指令（如 `script-src`）没有被设置，那么它就会继承 `default-src` 的值。
    *   示例：`default-src 'self' https://trusted.com;` (只信任当前域名和 `trusted.com` 的资源)

*   **`script-src`**: 定义 JavaScript 的有效来源。这是 CSP 中**最重要、最核心**的指令。
    *   示例：`script-src 'self' https://apis.google.com;` (只允许加载来自本域和 `apis.google.com` 的脚本)

*   **`style-src`**: 定义 CSS 样式表的有效来源。
    *   示例：`style-src 'self' https://fonts.googleapis.com;`

*   **`img-src`**: 定义图片和图标的有效来源。
    *   示例：`img-src 'self' data:;` (允许来自本域和 `data:` URI 的图片)

*   **`connect-src`**: 定义了可以通过脚本接口（如 `Fetch`, `XHR`, `WebSocket`）加载的 URL。
    *   示例：`connect-src 'self' wss://api.example.com;`

*   **`font-src`**, **`media-src`**, **`object-src`**: 分别定义字体、音视频 (`<audio>`, `<video>`) 和插件 (`<object>`, `<embed>`) 的来源。

**特殊源值**:
*   `'self'`: 指向当前文档所在的源，但不包括其子域名。
*   `'none'`: 阻止加载任何来源的资源。
*   `'unsafe-inline'`: 允许使用内联资源，如内联的 `<script>` 元素、`javascript:` URI 或内联的事件处理器（如 `onclick`）。**强烈不推荐使用**。
*   `'unsafe-eval'`: 允许使用 `eval()` 等通过字符串创建代码的机制。**同样强烈不推荐**。

## 2. 应对内联脚本：`nonce` 与 `hash`

一个严格的 CSP 通常会禁止所有内联脚本（`'unsafe-inline'`），但这会给许多现有应用带来麻烦。CSP 提供了两种更安全的方式来允许特定的内联脚本执行。

*   **`nonce` (一次性随机数)**：
    1.  服务器为每个请求生成一个唯一的、随机的、无法猜测的 Base64 字符串（nonce）。
    2.  在 CSP 头部中指定这个 nonce：`script-src 'self' 'nonce-R4nd0m...';`
    3.  在 HTML 的内联 `<script>` 标签中也加入这个 nonce：`<script nonce="R4nd0m...">...</script>`
    4.  浏览器只会执行 nonce 值匹配的内联脚本。

*   **`hash` (哈希值)**：
    1.  对内联脚本的内容（不包括 `<script>` 标签）计算其 SHA256、SHA384 或 SHA512 哈希值。
    2.  在 CSP 头部中指定这个哈希值：`script-src 'self' 'sha256-B2y...';`
    3.  浏览器在执行内联脚本前，会计算其哈希值并与策略中的值进行比对。

`nonce` 更适合动态生成的页面，而 `hash` 更适合静态页面。

## 3. 监控与报告

部署 CSP 的一个挑战是可能会意外地阻止正常的应用资源。为此，CSP 提供了报告机制。

*   **`Content-Security-Policy-Report-Only`**: 这是一个与主策略并行的 HTTP 头部。使用这个头部，浏览器**不会实际阻止**任何资源，但会将所有违反策略的行为**上报**到一个指定的端点。这对于在不破坏应用的前提下测试和迭代 CSP 策略至关重要。

*   **`report-uri` / `report-to`**: 这两个指令用于告诉浏览器将违规报告发送到哪里。
    *   示例：`report-uri /csp-violation-report-endpoint;`

## 4. 实践案例：一个严格的 CSP 配置

```http
Content-Security-Policy:
  default-src 'self';
  script-src 'self' https://www.google-analytics.com 'nonce-abcdef123';
  style-src 'self' https://fonts.googleapis.com;
  font-src https://fonts.gstatic.com;
  img-src 'self' data: https://www.google-analytics.com;
  connect-src 'self' https://www.google-analytics.com;
  object-src 'none';
  frame-ancestors 'none';
  report-uri /csp-reports;
```
这个策略的含义是：
*   默认只信任同源资源。
*   脚本只能来自同源和谷歌分析，并且允许一个 nonce 值为 `abcdef123` 的内联脚本。
*   样式表来自同源和谷歌字体。
*   字体只能来自 `fonts.gstatic.com`。
*   图片来自同源、`data:` URI 和谷歌分析。
*   API 请求只能发往同源和谷歌分析。
*   禁止加载任何插件 (`object-src 'none'`)。
*   禁止页面被嵌入到 `<iframe>` 中 (`frame-ancestors 'none'`)。
*   将所有违规行为上报到 `/csp-reports`。

## 总结

内容安全策略（CSP）是现代 Web 应用纵深防御体系中威力最大、也最值得投入精力去配置的一环。它将防御的主动权从“亡羊补牢”式的过滤转义，转变为了“白名单授权”式的主动设防。虽然初次配置可能较为复杂，但一旦建立起一套严格的 CSP，它就能像一道坚不可摧的城墙，保护你的应用免受绝大多数内容注入类攻击的威胁。
