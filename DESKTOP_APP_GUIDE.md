# 桌面应用打包指南

## 概述

本项目已配置为可以使用 Electron 打包成桌面应用程序。桌面应用版本具有以下特点：

- ✅ 保留所有功能（包括 AI 智能生成标签）
- ✅ 支持离线使用（AI 功能除外，需要网络调用 LLM 接口）
- ✅ 跨平台支持（Windows、macOS、Linux）
- ✅ 无需安装 Node.js 和运行开发服务器
- ✅ API Key 本地存储，不会上传到任何服务器

## 前置要求

### Windows
- Windows 10 或更高版本
- Node.js 18+ 和 pnpm
- Visual Studio Build Tools（用于打包某些依赖）

### macOS
- macOS 10.15 (Catalina) 或更高版本
- Xcode 命令行工具：`xcode-select --install`
- Node.js 18+ 和 pnpm

### Linux
- Ubuntu 20.04+ 或其他主流发行版
- Node.js 18+ 和 pnpm
- 依赖库：
  ```bash
  sudo apt-get update
  sudo apt-get install -y libgtk-3-0 libnotify4 libnss3 libxss1 libxtst6 xauth xvfb
  ```

## 打包步骤

### 1. 安装依赖

```bash
# 安装 Electron 相关依赖（如果还没有安装）
ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/ pnpm add -D electron electron-builder
```

### 2. 构建项目

```bash
# 构建 Next.js 静态文件
pnpm run build:next

# 构建 Electron 代码
pnpm run build:electron
```

### 3. 打包应用

#### Windows
```bash
# 打包为 Windows 安装程序
pnpm run electron:dist
```

输出文件位于 `dist/electron-builder/` 目录：
- `从夯到拉排名工具 Setup 0.1.0.exe` - 安装程序

#### macOS
```bash
# 打包为 macOS 应用
pnpm run electron:dist
```

输出文件位于 `dist/electron-builder/` 目录：
- `从夯到拉排名工具-0.1.0.dmg` - DMG 安装文件

#### Linux
```bash
# 打包为 Linux 应用
pnpm run electron:dist
```

输出文件位于 `dist/electron-builder/` 目录：
- `从夯到拉排名工具-0.1.0.AppImage` - AppImage 可执行文件

### 4. 运行打包后的应用

#### Windows
- 双击 `.exe` 安装程序进行安装
- 或直接运行安装后的应用程序

#### macOS
- 双击 `.dmg` 文件打开
- 将应用拖拽到应用程序文件夹
- 从启动台启动应用

#### Linux
```bash
# 赋予执行权限
chmod +x 从夯到拉排名工具-0.1.0.AppImage

# 运行应用
./从夯到拉排名工具-0.1.0.AppImage
```

## 本地开发调试

如果你想在开发过程中测试 Electron 应用：

```bash
# 一键构建并运行（开发模式）
pnpm run electron:dev
```

## 使用说明

### Web 版本 vs 桌面版本

| 功能 | Web 版本 | 桌面版本 |
|------|---------|---------|
| 拖拽排序 | ✅ | ✅ |
| 添加词条 | ✅ | ✅ |
| AI 智能生成 | ✅ | ✅ |
| 离线使用 | ❌ | ✅ (AI 功能除外) |
| 安装部署 | 需要服务器 | 直接安装 |

### 桌面版 AI 功能配置

在桌面版本中，"一键添加评价"功能需要配置 API Key：

1. 点击"一键添加评价"按钮
2. 在"API Key"输入框中输入您的 LLM API Key
3. 输入类别和数量
4. 点击"生成"按钮

**重要提示：**
- API Key 仅保存在本地，不会上传到任何服务器
- 每次使用需要重新输入 API Key（可以手动保存到文本文件中备用）
- 支持 OpenAI 格式的 API Key

## 常见问题

### Q1: 打包时出现"libatk-1.0.so.0: cannot open shared object file"错误

**Linux 系统**：缺少系统库，安装依赖：
```bash
sudo apt-get install -y libatk-bridge2.0-0 libatk1.0-0 libcups2 libdrm2 libgbm1 libgtk-3-0 libnspr4 libnss3 libwayland-client0 libxcomposite1 libxdamage1 libxfixes3 libxkbcommon0 libxrandr2
```

### Q2: 打包后的应用无法启动

- 检查系统是否满足最低要求
- 确认杀毒软件没有阻止应用运行
- Windows 用户：右键点击应用，选择"属性" → "解除锁定"

### Q3: AI 功能无法使用

- 确认网络连接正常
- 检查 API Key 是否正确
- API Key 必须是有效的 LLM API Key

### Q4: 如何自定义应用图标

准备对应格式的图标文件：
- Windows: `build/icon.ico` (256x256)
- macOS: `build/icon.icns` (1024x1024)
- Linux: `build/icon.png` (512x512)

### Q5: 打包后的文件太大

Electron 应用包含完整的运行时，文件大小较大是正常的：
- Windows: 约 80-100 MB
- macOS: 约 90-110 MB
- Linux: 约 80-100 MB

可以通过 `electron-builder` 配置启用压缩来减小体积：
```json
{
  "compression": "maximum"
}
```

## 技术架构

### 文件结构
```
.
├── electron/
│   ├── main.ts          # Electron 主进程
│   └── preload.ts       # 预加载脚本
├── dist/
│   ├── electron/        # 编译后的 Electron 代码
│   └── out/             # Next.js 静态导出文件
├── electron-builder.json  # 打包配置
└── package.json         # 项目配置
```

### 双模式支持

应用自动检测运行环境：
- **Web 环境**：调用 Next.js API Routes (`/api/generate-tags`)
- **Electron 环境**：调用本地 IPC (`window.electronAPI.generateTags`)

代码位置：`src/lib/tag-generator.ts`

## 高级配置

### 修改应用名称

编辑 `electron-builder.json`：
```json
{
  "productName": "您的应用名称"
}
```

### 修改应用ID

编辑 `electron-builder.json`：
```json
{
  "appId": "com.yourcompany.appname"
}
```

### 自动更新配置

需要配置更新服务器，参考 electron-builder 文档。

## 技术支持

如有问题，请检查：
1. Node.js 和 pnpm 版本是否符合要求
2. 系统是否安装了必要的依赖库
3. 查看控制台输出的错误信息

---

**版本**: 0.1.0
**最后更新**: 2026-02-02
