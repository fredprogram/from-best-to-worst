'use client';

import { useState } from 'react';
import { TierRow } from '@/components/TierRow';
import { UnsortedPool } from '@/components/UnsortedPool';
import { AddTagDialog } from '@/components/AddTagDialog';
import { QuickAddDialog } from '@/components/QuickAddDialog';
import { Button } from '@/components/ui/button';
import { SortableTagItem } from '@/components/SortableTagItem';
import { Plus, Trash2, RotateCcw, Wand2 } from 'lucide-react';
import { Tag, RankState, RankLevel } from '@/types/ranking';
import {
  DndContext,
  pointerWithin,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
} from '@dnd-kit/core';

export default function Home() {
  const [rankState, setRankState] = useState<RankState>({
    hong: [],
    top: [],
    ren: [],
    npc: [],
    la: [],
    unassigned: [],
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isQuickAddDialogOpen, setIsQuickAddDialogOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeIdStr = String(active.id);
    const sourceZone = findTagZone(activeIdStr);
    const targetZone = String(over.id) as RankLevel;

    // 检查目标区域是否有效
    const validZones: RankLevel[] = ['hong', 'top', 'ren', 'npc', 'la', 'unassigned'];
    if (!validZones.includes(targetZone)) return;

    if (sourceZone === targetZone) return;

    const newState: RankState = { ...rankState };
    const tagToMove = newState[sourceZone].find(tag => tag.id === activeIdStr);

    if (tagToMove) {
      newState[sourceZone] = newState[sourceZone].filter(tag => tag.id !== activeIdStr);
      newState[targetZone] = [...newState[targetZone], tagToMove];
      setRankState(newState);
    }
  };

  const findTagZone = (id: string): RankLevel => {
    for (const level of Object.keys(rankState) as RankLevel[]) {
      if (rankState[level].find(tag => tag.id === id)) {
        return level;
      }
    }
    return 'unassigned';
  };

  const findTagById = (id: string): Tag | undefined => {
    for (const level of Object.keys(rankState) as RankLevel[]) {
      const tag = rankState[level].find(t => t.id === id);
      if (tag) return tag;
    }
    return undefined;
  };

  const handleAddTag = (content: string, type: 'text' | 'image' | 'mixed', imageUrl?: string) => {
    const newTag: Tag = {
      id: Date.now().toString(),
      type,
      content,
      imageUrl,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setRankState(prev => ({
      ...prev,
      unassigned: [...prev.unassigned, newTag],
    }));
  };

  const handleToggleSelect = (tagId: string) => {
    setSelectedTags(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(tagId)) {
        newSelected.delete(tagId);
      } else {
        newSelected.add(tagId);
      }
      return newSelected;
    });
  };

  const handleAddTags = (tags: Tag[]) => {
    setRankState(prev => ({
      ...prev,
      unassigned: [...prev.unassigned, ...tags],
    }));
  };

  const handleDeleteSelected = () => {
    if (selectedTags.size === 0) {
      alert('请先选择要删除的词条');
      return;
    }

    const newState: RankState = { ...rankState };
    for (const level of Object.keys(newState) as RankLevel[]) {
      newState[level] = newState[level].filter(tag => !selectedTags.has(tag.id));
    }

    setRankState(newState);
    setSelectedTags(new Set());
  };

  const handleReset = () => {
    if (confirm('确定要重置所有词条到未排序池吗？')) {
      const allTags: Tag[] = [];
      for (const level of ['hong', 'top', 'ren', 'npc', 'la'] as RankLevel[]) {
        allTags.push(...rankState[level]);
      }

      setRankState({
        hong: [],
        top: [],
        ren: [],
        npc: [],
        la: [],
        unassigned: [...rankState.unassigned, ...allTags],
      });
    }
  };

  const activeTag = activeId ? findTagById(activeId) : undefined;

  return (
    <div className="min-h-screen bg-gray-100 pb-32">
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-xl font-bold text-gray-900 text-center">从夯到拉 排名工具 by.Fred</h1>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* 拖拽区域 */}
        <div className="pointer-events-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={pointerWithin}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <DragOverlay>
              {activeTag && (
                <div className="opacity-80 rotate-3 pointer-events-none">
                  <SortableTagItem tag={activeTag} />
                </div>
              )}
            </DragOverlay>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <TierRow level="hong" tags={rankState.hong} selectedTags={selectedTags} onToggleSelect={handleToggleSelect} />
              <TierRow level="top" tags={rankState.top} selectedTags={selectedTags} onToggleSelect={handleToggleSelect} />
              <TierRow level="ren" tags={rankState.ren} selectedTags={selectedTags} onToggleSelect={handleToggleSelect} />
              <TierRow level="npc" tags={rankState.npc} selectedTags={selectedTags} onToggleSelect={handleToggleSelect} />
              <TierRow level="la" tags={rankState.la} selectedTags={selectedTags} onToggleSelect={handleToggleSelect} />
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm mt-4">
              <UnsortedPool tags={rankState.unassigned} selectedTags={selectedTags} onToggleSelect={handleToggleSelect} />
            </div>
          </DndContext>
        </div>

        {/* 按钮区域 */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-[9999] pointer-events-auto">
          <div className="container mx-auto max-w-5xl">
            <div className="flex gap-2 justify-center flex-wrap">
              <Button
                onClick={() => setIsQuickAddDialogOpen(true)}
                className="bg-purple-500 hover:bg-purple-600"
              >
                <Wand2 className="mr-2 h-4 w-4" />
                一键添加评价
              </Button>
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Plus className="mr-2 h-4 w-4" />
                添加词条
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteSelected}
                disabled={selectedTags.size === 0}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                删除选中词条{selectedTags.size > 0 && ` (${selectedTags.size})`}
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={Object.entries(rankState)
                  .filter(([key]) => key !== 'unassigned')
                  .every(([_, tags]) => tags.length === 0)}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                重置
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AddTagDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddTag={handleAddTag}
      />

      <QuickAddDialog
        open={isQuickAddDialogOpen}
        onOpenChange={setIsQuickAddDialogOpen}
        onAddTags={handleAddTags}
      />
    </div>
  );
}
