# 桌面应用快速使用指南

## 📦 三步打包桌面应用

### 步骤 1: 准备环境

确保您已安装：
- **Node.js 18+** [下载](https://nodejs.org/)
- **pnpm** (安装命令: `npm install -g pnpm`)

### 步骤 2: 安装依赖

在项目根目录执行：

```bash
# 进入项目目录
cd ranking-app

# 安装项目依赖
pnpm install

# 安装 Electron（使用国内镜像加速）
ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/ pnpm add -D electron electron-builder
```

### 步骤 3: 一键打包

```bash
# 使用快速打包脚本（推荐）
./scripts/build-desktop.sh

# 或者手动执行
pnpm run build:next
pnpm run build:electron
pnpm run electron:dist
```

## 🎉 安装和使用

打包完成后，在 `dist/electron-builder/` 目录找到安装文件：

### Windows 用户
1. 找到 `从夯到拉排名工具 Setup 0.1.0.exe`
2. 双击运行安装程序
3. 按提示完成安装
4. 从开始菜单启动应用

### macOS 用户
1. 找到 `从夯到拉排名工具-0.1.0.dmg`
2. 双击打开
3. 将应用拖拽到应用程序文件夹
4. 从启动台启动应用

### Linux 用户
```bash
# 找到从夯到拉排名工具-0.1.0.AppImage
chmod +x 从夯到拉排名工具-0.1.0.AppImage
./从夯到拉排名工具-0.1.0.AppImage
```

## 💡 使用桌面版功能

### 基础功能（无需网络）
- ✅ 拖拽排序
- ✅ 添加词条
- ✅ 删除词条
- ✅ 重置榜单

### AI 智能生成（需要网络 + API Key）

1. 点击"一键添加评价"按钮
2. 在"API Key"输入框中输入您的 LLM API Key
3. 输入类别（如：奶茶店、游戏角色）
4. 点击"生成"按钮
5. 预览标签后点击"全部添加"

**API Key 获取方式：**
- 推荐使用兼容 OpenAI 格式的 API Key
- API Key 仅保存在本地，不会上传到任何服务器
- 每次使用需要重新输入（可保存在文本文件中备用）

## 🔧 常见问题

### Q: 打包失败？
A: 确保 Node.js 版本 >= 18，且已安装 pnpm。

### Q: 找不到 .exe 文件？
A: 打包完成后文件在 `dist/electron-builder/` 目录。

### Q: Windows 上打不开？
A: 右键应用 → 属性 → 解除锁定 → 确认。

### Q: macOS 上提示"无法打开"？
A: 系统偏好设置 → 安全性与隐私 → 仍要打开。

## 📚 完整文档

- [桌面应用详细指南](./DESKTOP_APP_GUIDE.md)
- [配置总结](./BUILD_SUMMARY.md)
- [README](./README.md)
