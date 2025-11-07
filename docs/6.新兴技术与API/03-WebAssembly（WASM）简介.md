# 17-WebAssembly (WASM) 简介

WebAssembly (简称 Wasm) 是一种新兴的、开放的 Web 标准。它为 Web 浏览器定义了一种**可移植的、体积小、加载快**的**二进制指令格式**，旨在成为 Web 平台的高性能编译目标。

简单来说，WebAssembly 就是一种可以让 C, C++, Rust 等高性能语言编写的代码，以接近原生的速度在浏览器中运行的技术。

## 1. WebAssembly 不是要取代 JavaScript

这是一个非常重要的核心概念：**Wasm 并非 JavaScript 的替代品，而是其强大的伙伴。**

*   **JavaScript** 非常灵活、动态，拥有庞大的生态系统，非常适合用于处理 Web 应用的**业务逻辑、DOM 操作、事件处理**等“胶水层”的工作。
*   **WebAssembly** 则专注于**性能和计算密集型任务**。它提供了一个类似于汇编的底层指令集，让那些对性能要求极高的模块（如游戏引擎、音视频处理、科学计算）可以发挥出接近原生的速度。

两者的关系是**互补**的：JavaScript 负责应用的整体控制和与 Web API 的交互，当遇到性能瓶颈的计算任务时，就调用 Wasm 模块来高效地完成。

## 2. 核心特性

### a. 高性能 (Fast)

Wasm 代码是一种底层的二进制格式，浏览器无需像解析 JavaScript 那样进行复杂的词法、语法分析和多次优化编译。它可以被非常快速地解码并直接编译成高效的机器码，因此其执行速度远超 JavaScript，非常接近原生应用的水平。

此外，Wasm 还支持 **SIMD (单指令多数据流)** 等高级硬件指令，允许对数据进行高效的并行计算，这在图像处理、多媒体编解码等领域能带来巨大的性能提升。

### b. 可移植 (Portable)

Wasm 被设计成独立于硬件、操作系统和编程语言的通用指令集。这意味着，用 C++/Rust 等语言编写的代码，只需一次编译成 `.wasm` 文件，就可以在所有支持 Wasm 的现代浏览器中以可预测的方式运行。

Wasm 的愿景不止于浏览器。通过 **WASI (WebAssembly System Interface)**，Wasm 可以在服务器、边缘计算节点等任何环境中，以标准化的方式与底层系统交互，真正实现“一次编写，到处运行”。

### c. 安全 (Secure)

Wasm 代码运行在一个**沙箱化 (Sandboxed)** 的执行环境中，其内存是独立的。它无法直接访问或干扰外部的 JavaScript 上下文或操作系统的任意内存。Wasm 模块必须通过明确导入的 JavaScript 函数，才能与外部世界（如 DOM）进行交互，这保证了其安全性。

## 3. 工作流程

WebAssembly 的使用通常遵循以下步骤：

1.  **编写**：使用 C, C++, Rust, Go 等支持 Wasm 编译目标的语言编写源代码。
2.  **编译**：使用相应的工具链（如 Emscripten for C/C++, `wasm-pack` for Rust）将源代码编译成一个 `.wasm` 二进制文件。这个工具链通常还会生成一个 `.js` 的“胶水”文件，用于简化 Wasm 模块的加载和与 JavaScript 的交互。
3.  **加载与实例化**：在你的 Web 应用中，使用 JavaScript 来加载这个 `.wasm` 文件。
    *   可以通过 `WebAssembly.instantiateStreaming(fetch('module.wasm'))` API 来高效地流式加载和编译 Wasm 模块。
4.  **调用**：一旦模块实例化成功，JavaScript 就可以像调用一个普通的 JS 对象的方法一样，调用从 Wasm 模块中**导出 (export)** 的函数。同时，Wasm 模块也可以调用从 JavaScript 中**导入 (import)** 的函数。

**示例（伪代码）：**
```javascript
// main.js
// 假设 'module.wasm' 导出了一个名为 'add' 的函数

// 准备一个导入对象，让 Wasm 可以调用 JS 函数
const importObject = {
  console: {
    log: (arg) => console.log(arg)
  }
};

WebAssembly.instantiateStreaming(fetch('module.wasm'), importObject)
  .then(obj => {
    // 调用 Wasm 导出的 'add' 函数
    const result = obj.instance.exports.add(2, 3);
    console.log(result); // 输出 5
  });
```

## 4. 与 JavaScript 的交互：内存模型

Wasm 与 JavaScript 之间的交互是其设计的核心。

*   **数值类型**：`i32`, `f64` 等数字类型可以直接、高效地在 JS 和 Wasm 函数的参数和返回值之间传递。
*   **复杂类型**：对于字符串、数组、对象等复杂数据类型，**无法直接传递**。它们必须存储在 Wasm 模块的**线性内存 (Linear Memory)** 中。
    *   线性内存是 Wasm 模块内部的一块连续的、可由 JS 读写的内存空间，表现为一个 `ArrayBuffer` 对象。
    *   JS 需要通过 `Uint8Array` 等 `ArrayBuffer` 的视图，将数据写入或从这块内存中读出。
    *   **“胶水”代码的作用**：像 Emscripten 或 `wasm-pack` 这样的工具链，会自动生成 JavaScript “胶水”代码。这些代码的核心职责之一，就是**封装复杂的内存读写操作**，例如将 JS 字符串编码后写入 Wasm 内存，或从 Wasm 内存中解码出字符串返回给 JS，从而为开发者提供友好、易用的 API。

## 5. 典型应用场景

WebAssembly 的核心价值在于将那些以往受限于性能而无法在 Web 上流畅运行的应用变为可能。

*   **游戏**：大型 3D 游戏引擎（如 Unity, Unreal Engine）可以将它们的核心代码编译成 Wasm，让复杂的 3D 游戏可以直接在浏览器中以高性能运行。
*   **音视频处理**：实时视频编辑、音频混音、编解码等计算密集型任务。
*   **科学计算与数据可视化**：物理模拟、生物信息学分析、大规模数据可视化等。
*   **CAD 与 3D 设计软件**：像 AutoCAD, Figma 等桌面级复杂应用，可以通过 Wasm 将其核心功能移植到 Web 平台。
*   **遗留系统移植**：将一些用 C/C++ 编写的、经过长期验证的桌面应用或库，平滑地迁移到 Web 环境中。

## 总结

WebAssembly 为 Web 平台开启了性能的新纪元。它通过提供一个安全、快速、可移植的二进制格式，让 C++/Rust 等高性能语言生态与 JavaScript 生态实现了完美的结合。它使得浏览器不再仅仅是一个文档查看器，而真正成为了一个能够承载桌面级复杂应用的强大平台。
