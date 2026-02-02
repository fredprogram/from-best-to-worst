// 检测是否在 Electron 环境中
export const isElectron = () => {
  return typeof window !== 'undefined' && !!(window as any).electronAPI;
};

// 生成标签的统一接口
export async function generateTags(category: string, count: number = 5, apiKey?: string) {
  // Electron 环境
  if (isElectron()) {
    if (!apiKey) {
      return { success: false, error: '请先配置 API Key' };
    }

    const result = await (window as any).electronAPI.generateTags(apiKey, category, count);
    return result;
  }

  // Web 环境 - 调用 API 路由
  try {
    const response = await fetch('/api/generate-tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, count }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('生成标签失败:', error);
    return { success: false, error: '生成标签失败，请稍后重试' };
  }
}
