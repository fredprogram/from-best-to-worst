import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { LLMClient, Config } from 'coze-coding-dev-sdk';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // 加载构建后的静态文件
  const htmlPath = path.join(__dirname, '../out/index.html');
  mainWindow.loadFile(htmlPath);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC 处理：生成标签
ipcMain.handle('generate-tags', async (event: any, apiKey: string, category: string, count: number = 5) => {
  try {
    const config = new Config({ apiKey });
    const client = new LLMClient(config);

    const systemPrompt = `你是一个专业的标签生成助手。你的任务是根据用户提供的类别，生成真实、准确、知名的品牌或项目名称列表。

要求：
1. 只生成真实的品牌、产品、公司或项目名称
2. 不要生成广告内容、推广信息或虚假内容
3. 品牌名称要准确、真实、知名度高
4. 返回格式必须是有效的JSON数组，每个元素包含：
   - name: 品牌名称（字符串）
   - type: 标签类型（text、image或mixed，默认text）
5. 数量要准确匹配用户要求
6. 不要添加任何额外的文字说明，只返回JSON数组`;

    const userPrompt = `请为"${category}"这个类别生成${count}个知名品牌或项目名称的JSON列表。只返回JSON数组，不要其他内容。`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt },
    ];

    const response = await client.invoke(messages, {
      temperature: 0.7,
    });

    // 解析AI返回的JSON
    let parsedData: any;
    try {
      parsedData = JSON.parse(response.content);
    } catch (e) {
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('无法解析AI返回的数据');
      }
    }

    // 转换为标签格式
    const tags = [];
    const items = Array.isArray(parsedData) ? parsedData : [];

    for (let i = 0; i < Math.min(count, items.length); i++) {
      const item = items[i];
      const name = item.name || item.brand || item.content || String(item);

      tags.push({
        id: `ai-${Date.now()}-${i}`,
        type: 'text',
        content: name.trim(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return {
      success: true,
      tags,
      summary: `已为您生成${tags.length}个${category}相关的标签`,
    };
  } catch (error) {
    console.error('AI生成标签失败:', error);
    return {
      success: false,
      error: '生成标签失败，请检查API Key是否正确',
    };
  }
});
