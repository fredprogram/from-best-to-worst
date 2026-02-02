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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Type, Image as ImageIcon, Layers } from 'lucide-react';
import { TagType } from '@/types/ranking';

interface AddTagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTag: (content: string, type: TagType, imageUrl?: string) => void;
}

export function AddTagDialog({ open, onOpenChange, onAddTag }: AddTagDialogProps) {
  const [content, setContent] = useState('');
  const [type, setType] = useState<TagType>('text');
  const [imageUrl, setImageUrl] = useState('');

  const handleAdd = () => {
    if (!content.trim()) return;

    onAddTag(content, type, type === 'image' || type === 'mixed' ? imageUrl : undefined);

    // 重置表单
    setContent('');
    setImageUrl('');
    setType('text');
    onOpenChange(false);
  };

  const handleCancel = () => {
    setContent('');
    setImageUrl('');
    setType('text');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>添加词条</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 词条名称 */}
          <div className="space-y-2">
            <Label htmlFor="content">词条名称</Label>
            <Input
              id="content"
              placeholder="输入词条名称"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          {/* 词条类型 */}
          <div className="space-y-2">
            <Label>词条类型</Label>
            <RadioGroup value={type} onValueChange={(v) => setType(v as TagType)}>
              <div className="flex gap-4">
                <Label className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="text" />
                  <Type className="h-4 w-4" />
                  文字
                </Label>
                <Label className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="image" />
                  <ImageIcon className="h-4 w-4" />
                  图片
                </Label>
                <Label className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="mixed" />
                  <Layers className="h-4 w-4" />
                  图文
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* 图片URL */}
          {(type === 'image' || type === 'mixed') && (
            <div className="space-y-2">
              <Label htmlFor="imageUrl">图片URL</Label>
              <Input
                id="imageUrl"
                placeholder="输入图片链接"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            取消
          </Button>
          <Button onClick={handleAdd} disabled={!content.trim()}>
            添加
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
