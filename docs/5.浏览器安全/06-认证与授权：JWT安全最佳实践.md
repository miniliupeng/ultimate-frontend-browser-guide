# 06-认证与授权：JWT 安全最佳实践

在现代 Web 应用，尤其是单页应用（SPA）中，JSON Web Token (JWT) 已成为事实上的标准认证授权方案。它通过一个紧凑且自包含的字符串，在客户端和服务端之间安全地传递用户信息。然而，JWT 的广泛使用也带来了新的安全挑战，其中最核心的问题就是：**JWT 应该如何安全地存储在浏览器端？**

## 1. JWT 结构回顾

一个 JWT 由三部分组成，通过 `.` 分隔：
`Header.Payload.Signature`

*   **Header (头部)**：包含了令牌的类型（`typ`: "JWT"）和所使用的签名算法（如 `alg`: "HS256"）。
*   **Payload (载荷)**：包含了“声明 (claims)”，是关于实体（通常是用户）和其他数据的陈述。例如 `sub` (主题), `name` (用户名), `exp` (过期时间)。**Payload 中的数据是 Base64 编码的，并非加密，因此绝对不能存放敏感信息！**
*   **Signature (签名)**：用于验证消息在传递过程中没有被篡改。它是通过对编码后的 `Header` 和 `Payload`、一个密钥 (`secret`) 以及 `Header` 中指定的算法进行计算得出的。

## 2. 核心问题：JWT 的存储

这是一个长期以来在前端社区中激烈辩论的话题。主要有两种方案，它们各自权衡了不同的安全风险。

### a. 方案一：存储在 `LocalStorage` / `SessionStorage`

这是最简单直接的方式。客户端在登录后将获取到的 JWT 存入 `LocalStorage`，之后在每个需要认证的 API 请求中，通过 JavaScript 读取它，并放入 `Authorization` HTTP 头部。

*   **优点**：
    *   API 简单，使用方便。
    *   服务端无需关心 CSRF 防御，因为浏览器不会自动携带 `LocalStorage` 中的数据。
*   **致命缺点：易受 XSS 攻击**：
    *   如果应用存在任何 XSS 漏洞，攻击者注入的恶意脚本就可以**直接读取** `LocalStorage` 中的所有数据，从而轻松窃取 JWT。一旦 JWT 被盗，攻击者就可以在有效期内冒充用户身份，为所欲为。

**结论**：由于 XSS 漏洞在复杂应用中难以完全根除，将 JWT 存储在 `LocalStorage` 中被认为是一种**高风险、不推荐**的做法。

### b. 方案二（推荐）：存储在 `HttpOnly` Cookie

在这种方案中，服务端在用户登录成功后，通过 `Set-Cookie` HTTP 头部将 JWT 写入浏览器的 Cookie。

```http
Set-Cookie: accessToken=...; HttpOnly; Secure; SameSite=Strict
```

*   **优点**：
    *   **有效防御 XSS**：`HttpOnly` 标志使得该 Cookie **无法通过 JavaScript (`document.cookie`) 访问**。这意味着，即使应用存在 XSS 漏洞，攻击者的脚本也无法读取到这个 Cookie，从而保护了 JWT 不被窃取。
    *   **自动发送**：浏览器会在后续的每个同源请求中自动携带这个 Cookie，无需前端手动处理。
*   **需要应对的风险：CSRF 攻击**：
    *   由于 Cookie 会被自动发送，这使得应用面临 CSRF 攻击的风险。幸运的是，我们可以通过设置 Cookie 的 `SameSite` 属性来有效缓解。
    *   `SameSite=Strict`：最严格的模式，完全禁止第三方 Cookie，可以完全防御 CSRF，但可能会影响某些跨站链接的用户体验。
    *   `SameSite=Lax`：默认值。允许在用户从外部网站导航到你的网站时（如点击链接）发送 Cookie，但在跨域的 `POST` 请求等场景下会阻止，能防御大部分 CSRF 攻击。
    *   `Secure` 标志确保 Cookie 只在 HTTPS 连接中被发送。

**结论**：将 JWT 存储在配置了 `HttpOnly`, `Secure` 和 `SameSite` 属性的 Cookie 中，是目前公认的**最安全、最推荐**的最佳实践。

## 3. Refresh Token 模式：提升长期安全性

直接存储的 JWT（`Access Token`）通常生命周期很短（如15分钟-1小时），以减少泄露后的风险。但这会导致用户需要频繁重新登录。为了解决这个问题，引入了 `Refresh Token` 模式。

*   **Access Token**：用于访问受保护的资源，生命周期**短**。它可以被存储在内存中，或者如上所述的 `HttpOnly` Cookie 里。
*   **Refresh Token**：用于获取新的 `Access Token`，生命周期**长**（如几天或几周）。它**必须被极其安全地存储**，通常是在一个独立的、设置了 `HttpOnly` 和 `Path`（指向刷新API的特定路径）的 Cookie 中。

**流程**：
1.  用户登录，服务器返回一个短期的 `Access Token` 和一个长期的 `Refresh Token`。
2.  客户端使用 `Access Token` 访问 API。
3.  当 `Access Token` 过期时，API 返回 401 错误。
4.  客户端自动向一个特定的刷新端点（如 `/refresh_token`）发送 `Refresh Token`。
5.  服务器验证 `Refresh Token`，如果有效，则签发一个新的 `Access Token`，客户端用新令牌重试刚才失败的请求。
6.  如果 `Refresh Token` 也过期了，用户才需要重新登录。

## 4. JWT 安全清单

*   [ ] **始终使用 HTTPS** 来传输 JWT。
*   [ ] **不要在 Payload 中存放任何敏感信息**。
*   [ ] **使用 `HttpOnly`、`Secure`、`SameSite` Cookie** 来存储 JWT，防御 XSS 和 CSRF。
*   [ ] **设置一个合理的、较短的过期时间** (`exp`) 给 `Access Token`。
*   [ ] **采用 Refresh Token 模式** 来改善用户体验和长期安全性。
*   [ ] **考虑实现 Refresh Token 的吊销机制**，以便在用户登出或密码修改时能立即废止其所有会话。

## 总结

JWT 的安全性高度依赖于其正确的实现和存储策略。通过将 JWT 存储在配置严格的 `HttpOnly` Cookie 中，并配合 Refresh Token 模式，我们可以在防御 XSS 和 CSRF 攻击之间找到最佳平衡点，为现代 Web 应用构建一个强大而可靠的认证授权体系。
