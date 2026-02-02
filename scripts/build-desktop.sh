#!/bin/bash

# 桌面应用打包脚本

echo "========================================="
echo "  从夯到拉排名工具 - 桌面应用打包脚本"
echo "========================================="
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js，请先安装 Node.js 18+"
    exit 1
fi

echo "✅ Node.js 版本: $(node -v)"

# 检查 pnpm
if ! command -v pnpm &> /dev/null; then
    echo "❌ 错误: 未找到 pnpm，请先安装 pnpm"
    echo "   安装命令: npm install -g pnpm"
    exit 1
fi

echo "✅ pnpm 版本: $(pnpm -v)"
echo ""

# 步骤 1: 构建 Next.js
echo "📦 步骤 1/3: 构建 Next.js 静态文件..."
pnpm run build:next
if [ $? -ne 0 ]; then
    echo "❌ Next.js 构建失败"
    exit 1
fi
echo "✅ Next.js 构建完成"
echo ""

# 步骤 2: 构建 Electron
echo "⚡ 步骤 2/3: 构建 Electron 代码..."
pnpm run build:electron
if [ $? -ne 0 ]; then
    echo "❌ Electron 构建失败"
    exit 1
fi
echo "✅ Electron 构建完成"
echo ""

# 步骤 3: 打包应用
echo "🎉 步骤 3/3: 打包桌面应用..."
pnpm run electron:dist
if [ $? -ne 0 ]; then
    echo "❌ 应用打包失败"
    exit 1
fi

echo ""
echo "========================================="
echo "  ✅ 打包完成！"
echo "========================================="
echo ""
echo "📂 输出目录: dist/electron-builder/"
echo ""

# 显示输出文件
if [ -d "dist/electron-builder" ]; then
    echo "📦 生成的文件:"
    ls -lh dist/electron-builder/
else
    echo "⚠️  警告: 未找到输出目录"
fi

echo ""
echo "📖 使用说明:"
echo "   - Windows: 双击 .exe 文件安装"
echo "   - macOS: 双击 .dmg 文件安装"
echo "   - Linux: 运行 AppImage 文件"
echo ""
echo "📚 详细文档: 请查看 DESKTOP_APP_GUIDE.md"
echo ""
