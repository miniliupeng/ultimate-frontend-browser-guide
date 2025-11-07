# 07-File System Access API：让Web应用操作本地文件

传统的 Web 应用被严格限制在浏览器的沙箱内，与用户本地文件系统的交互仅限于 `<input type="file">` 的上传和 `<a>` 标签的下载。这种模式流程繁琐，限制了 Web 应用作为生产力工具的潜力。`File System Access API` 的出现，彻底改变了这一现状。

这个 API 是一套允许 Web 应用在用户明确授权后，直接与用户设备上的文件和目录进行交互的接口。它为构建功能强大的、体验媲美原生应用的 Web App（如在线 IDE、设计工具、富文本编辑器）铺平了道路。

## 1. 核心概念与安全模型

`File System Access API` 的设计将用户安全放在首位。

*   **用户授权是前提**：对文件或目录的任何访问都必须由用户通过一个明确的交互（如点击按钮）来发起，并由浏览器弹出的文件/目录选择器进行确认。浏览器会记住授权，在会话期间无需重复询问。
*   **句柄 (Handle) 模型**：当用户选择一个文件或目录后，API 会返回一个句柄对象（`FileSystemFileHandle` 或 `FileSystemDirectoryHandle`）。这个句柄是后续所有交互的入口，它代表了对该文件或目录的访问权限。
*   **安全上下文**：此 API 仅在安全上下文 (HTTPS) 中可用。

## 2. 读取本地文件

读取文件是最常见的操作。

```javascript
const button = document.getElementById('open-file-btn');

button.addEventListener('click', async () => {
  try {
    // 弹出文件选择器，让用户选择一个文件
    // 返回的是一个包含文件句柄的数组
    const [fileHandle] = await window.showOpenFilePicker();

    // 从句柄中获取文件对象
    const file = await fileHandle.getFile();

    // 读取文件内容
    const contents = await file.text();
    console.log(contents);

  } catch (err) {
    // 用户取消选择或发生其他错误
    console.error(err.name, err.message);
  }
});
```

`showOpenFilePicker()` 方法可以接受一个选项对象，用于配置可选的文件类型、是否允许多选等。

## 3. 写入本地文件

写入文件同样直观，并且 API 的设计考虑了数据写入的原子性和安全性。

```javascript
let fileHandle; // 在某处获取并保存文件句柄

async function saveFile(contents) {
  try {
    if (!fileHandle) {
      // 如果没有句柄，则弹出“另存为”对话框
      fileHandle = await window.showSaveFilePicker();
    }

    // 创建一个可写入的流
    const writable = await fileHandle.createWritable();

    // 写入内容
    await writable.write(contents);

    // 关闭流，确保所有内容都已写入磁盘
    await writable.close();

    console.log('File saved successfully!');
  } catch (err) {
    console.error(err.name, err.message);
  }
}
```
**关键点**：
*   `showSaveFilePicker()` 用于让用户选择保存位置或创建一个新文件。
*   写入操作是通过 `createWritable()` 创建一个 `FileSystemWritableFileStream` 来完成的，这种流式写入的方式对大文件非常友好。
*   `writable.close()` 是一个至关重要的步骤，它标志着写入操作的完成。

## 4. 更多能力

除了读写单个文件，`File System Access API` 还提供了：
*   **目录访问**：通过 `window.showDirectoryPicker()` 获取目录句柄，可以遍历目录下的文件和子目录，实现像 VS Code 打开项目文件夹一样的功能。
*   **拖放集成**：可以与 HTML 的拖放 API 结合，获取拖入文件的句柄。

## 总结

`File System Access API` 是将 Web 从一个“文档查看平台”转变为“应用运行平台”的关键一步。它极大地拓展了 Web 应用的能力边界，让开发者能够构建出更加强大、无缝和用户友好的在线工具。虽然目前还在不断发展中，但它所代表的方向无疑是 Web 的未来。
