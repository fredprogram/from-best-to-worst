'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Wand2, Search, Key } from 'lucide-react';
import { Tag } from '@/types/ranking';
import { generateTags, isElectron } from '@/lib/tag-generator';

interface QuickAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTags: (tags: Tag[]) => void;
}

export function QuickAddDialog({ open, onOpenChange, onAddTags }: QuickAddDialogProps) {
  const [category, setCategory] = useState('');
  const [count, setCount] = useState(5);
  const [apiKey, setApiKey] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewTags, setPreviewTags] = useState<Tag[] | null>(null);
  const [summary, setSummary] = useState<string>('');

  const isElectronEnv = isElectron();

  const handleGenerate = async () => {
    if (!category.trim()) {
      alert('请输入类别');
      return;
    }

    setIsGenerating(true);
    setPreviewTags(null);
    setSummary('');

    try {
      const data = await generateTags(category, count, apiKey);

      if (data.success) {
        setPreviewTags(data.tags);
        setSummary(data.summary || '');
      } else {
        alert(data.error || '生成失败');
      }
    } catch (error) {
      console.error('生成标签失败:', error);
      alert('生成标签失败，请稍后重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddAll = () => {
    if (previewTags && previewTags.length > 0) {
      onAddTags(previewTags);
      handleClose();
    }
  };

  const handleClose = () => {
    setCategory('');
    setCount(5);
    setPreviewTags(null);
    setSummary('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            一键添加评价
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Electron 环境下的 API Key 输入 */}
          {isElectronEnv && (
            <div className="space-y-2">
              <Label htmlFor="apiKey" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                API Key（必填）
              </Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="请输入您的 LLM API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                API Key 仅保存在本地，不会上传到任何服务器
              </p>
            </div>
          )}

          {/* 输入区域 */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="category">类别</Label>
              <div className="flex gap-2">
                <Input
                  id="category"
                  placeholder="例如：奶茶店饮品店、餐厅美食、游戏角色..."
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleGenerate();
                    }
                  }}
                />
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !category.trim() || (isElectronEnv && !apiKey.trim())}
                  className="shrink-0"
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  生成
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="count">标签数量（可选）</Label>
              <Input
                id="count"
                type="number"
                min="1"
                max="20"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 5)}
              />
            </div>
          </div>

          {/* 生成结果预览 */}
          {previewTags && previewTags.length > 0 && (
            <div className="space-y-3">
              <Label>生成的标签预览</Label>

              {summary && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-900">{summary}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {previewTags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg p-2 hover:shadow-md transition-shadow"
                  >
                    {tag.imageUrl && (
                      <img
                        src={tag.imageUrl}
                        alt={tag.content}
                        className="w-10 h-10 object-cover rounded"
                      />
                    )}
                    <span className="font-medium text-sm">{tag.content}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>共生成 {previewTags.length} 个标签</span>
              </div>
            </div>
          )}

          {/* 加载中状态 */}
          {isGenerating && (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="text-sm text-gray-600">正在搜索并生成标签...</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            取消
          </Button>
          <Button
            onClick={handleAddAll}
            disabled={!previewTags || previewTags.length === 0}
          >
            全部添加
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
