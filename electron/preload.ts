import { contextBridge, ipcRenderer } from 'electron';

// 向渲染进程暴露安全的 API
contextBridge.exposeInMainWorld('electronAPI', {
  generateTags: (apiKey: string, category: string, count: number) => {
    return ipcRenderer.invoke('generate-tags', apiKey, category, count);
  },
});
