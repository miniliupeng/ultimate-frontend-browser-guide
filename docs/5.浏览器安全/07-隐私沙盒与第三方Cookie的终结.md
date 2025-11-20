# 07-隐私沙盒与第三方 Cookie 的终结

2024 年是 Web 隐私保护的分水岭。以 Google Chrome 为首的现代浏览器正在逐步淘汰第三方 Cookie (Third-Party Cookies)，并用一套名为 **隐私沙盒 (Privacy Sandbox)** 的 API 取而代之。

这是一场从“隐式追踪”到“显式许可”、从“个体识别”到“群体聚合”的根本性变革。

## 1. 为什么淘汰第三方 Cookie？

第三方 Cookie 长期以来一直是跨站追踪（Cross-Site Tracking）的核心技术。

*   **原理**：当你在 A 网站浏览时，加载了来自 B 网站（如广告商）的图片或脚本，B 网站就可以读取它之前在你浏览器中留下的 Cookie。通过在成千上万个网站上部署这种脚本，广告商可以构建出你完整的浏览画像。
*   **问题**：这种追踪是在用户毫不知情、无法控制的情况下进行的，严重侵犯了用户隐私。

为了解决这个问题，浏览器厂商（Safari 的 ITP, Firefox 的 ETP, Chrome 的 Privacy Sandbox）决定从技术底层切断这种能力。

## 2. 隐私沙盒 (Privacy Sandbox) 核心 API

隐私沙盒是一组 API 的集合，旨在**在保护用户隐私的前提下，依然满足广告投放、转化归因、反欺诈等合理的商业需求**。

### a. Topics API：基于兴趣的广告 (替代 Cookie 追踪)

Topics API 旨在替代基于 Cookie 的用户画像追踪。

*   **核心思想**：浏览器在**本地**根据你的浏览历史，计算出你感兴趣的“主题”（如“旅游”、“汽车”、“摇滚乐”），而不是将你的具体浏览记录发送给服务器。
*   **工作流程**：
    1.  **本地计算**：浏览器每周根据浏览记录计算出 top 5 的兴趣主题（Topic）。
    2.  **隐私保护**：这些 Topic 也是来自一个公开的、标准化的分类列表（约 350 个），不包含敏感信息（如种族、宗教）。
    3.  **API 调用**：当广告商调用 `document.browsingTopics()` 时，浏览器会随机返回过去三周内的 3 个 Topic。
    4.  **结果**：广告商只能知道“这个用户对旅游感兴趣”，而无法知道“这个用户具体访问了哪个旅游网站”。

### b. Protected Audience API (FLEDGE)：再营销 (Remarketing)

这个 API (原名 FLEDGE) 用于解决“再营销”场景（例如：用户浏览了鞋子商品页但没买，稍后在新闻网站给他推这款鞋子的广告）。

*   **变革点**：竞价和广告选择的过程从**服务端**移到了**浏览器本地**。
*   **工作流程**：
    1.  **加入兴趣组**：当用户访问鞋类网站 A 时，网站 A 调用 `navigator.joinAdInterestGroup()` 将用户加入“红鞋爱好者”组。这个信息存储在浏览器本地，第三方无法读取。
    2.  **本地竞价**：当用户访问新闻网站 B（有广告位）时，浏览器在本地运行一个独立的 JS Worklet。它会拉取“红鞋爱好者”组的广告信息，并在本地进行竞价。
    3.  **渲染**：浏览器选择出胜出的广告，并将其渲染在一个隔离的 `Fenced Frame` 中。网站 B 甚至无法知道最终展示了什么广告。

### c. Attribution Reporting API：广告归因

用于在不识别具体用户身份的情况下，衡量广告点击和转化效果（如用户点击了广告后是否购买了商品）。

*   **核心机制**：浏览器在本地记录点击和转化事件，并对报告数据添加**噪声 (Noise)** 和**延迟 (Delay)**，然后发送给广告商。这确保了无法通过归因数据反推回具体的用户身份。

## 3. 应对策略：Storage Access API

随着第三方 Cookie 的封禁，一些合法的跨站业务（如：在 A 网站嵌入 B 网站的客服聊天窗口，且需要保持 B 的登录态）也会受到影响。

**Storage Access API** 是解决此类问题的标准方案。它允许嵌入在 iframe 中的第三方内容，**显式地向用户申请**访问其第一方 Cookie 的权限。

### 使用示例

```javascript
// 在 iframe 内部执行
async function requestAccess() {
  try {
    // 1. 检查是否已有权限
    const hasAccess = await document.hasStorageAccess();
    if (hasAccess) {
      return true;
    }

    // 2. 向用户请求权限（通常需要由用户交互触发，如点击按钮）
    // 浏览器可能会弹出一个提示框询问用户
    await document.requestStorageAccess();
    
    // 3. 成功获取权限，现在可以读取 Cookie 了
    console.log("Access granted!", document.cookie);
  } catch (err) {
    console.error("Access denied:", err);
  }
}

// 绑定到按钮点击事件
document.getElementById('login-btn').addEventListener('click', requestAccess);
```

### CHIPS (Cookies Having Independent Partitioned State)

对于不需要跨站共享，只需要在特定顶级站点下保持状态的第三方 Cookie（例如：嵌入的地图组件保存用户的偏好设置），可以使用 **CHIPS**（也称为分区 Cookie）。

*   **用法**：在 Set-Cookie 时增加 `Partitioned` 属性。
    ```http
    Set-Cookie: __Host-name=value; Secure; Path=/; SameSite=None; Partitioned;
    ```
*   **效果**：该 Cookie 只能在“当前顶级域名 + 嵌入的第三方域名”这个组合下被读取。如果同一个第三方域名嵌入到另一个顶级网站中，它将无法读取之前的 Cookie。

## 总结

隐私沙盒并非简单的 API 替换，而是 Web 广告和数据生态的重构。

*   **核心趋势**：计算**本地化**（边缘化），数据**去标识化**。
*   **开发者行动**：
    1.  全面排查项目中的第三方 Cookie 依赖。
    2.  对于必须的跨站状态共享，迁移至 **Storage Access API**。
    3.  对于非共享的跨站状态，使用 **Partitioned Cookie (CHIPS)**。
    4.  广告相关业务需尽快接入 Topics 和 Attribution Reporting API。

