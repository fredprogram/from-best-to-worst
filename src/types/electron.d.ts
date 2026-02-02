// Electron 环境的类型定义
export interface ElectronAPI {
  generateTags: (apiKey: string, category: string, count?: number) => Promise<{
    success: boolean;
    tags?: any[];
    summary?: string;
    error?: string;
  }>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
