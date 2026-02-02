'use client';

import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { Tag, RankLevel, RANK_LEVELS } from '@/types/ranking';
import { SortableTagItem } from './SortableTagItem';
import { useDroppable } from '@dnd-kit/core';

interface TierRowProps {
  level: RankLevel;
  tags: Tag[];
  selectedTags?: Set<string>;
  onToggleSelect?: (tagId: string) => void;
}

export function TierRow({ level, tags, selectedTags = new Set(), onToggleSelect }: TierRowProps) {
  const config = RANK_LEVELS[level];
  const { setNodeRef, isOver } = useDroppable({ id: config.id });

  return (
    <div className="flex gap-0 mb-2">
      {/* 左侧标签 */}
      <div
        className="flex-shrink-0 flex items-center justify-center font-bold"
        style={{
          width: '90px',
          backgroundColor: config.color,
          color: config.textColor,
          fontSize: '22px',
          minHeight: '100px',
        }}
      >
        {config.name}
      </div>

      {/* 右侧横向列表 */}
      <div
        ref={setNodeRef}
        className={`
          flex-1 p-2 min-h-[100px] overflow-x-auto
          ${isOver ? 'bg-blue-100' : ''}
        `}
        style={{
          backgroundColor: '#d9d9d9',
          minHeight: '100px',
        }}
      >
        <SortableContext items={tags} strategy={horizontalListSortingStrategy}>
          <div className="flex flex-wrap gap-2 min-h-[100px] pointer-events-none">
            {tags.map((tag) => (
              <div key={tag.id} className="pointer-events-auto">
                <SortableTagItem
                  tag={tag}
                  isSelected={selectedTags.has(tag.id)}
                  onToggleSelect={onToggleSelect}
                />
              </div>
            ))}
            {tags.length === 0 && (
              <div className="flex items-center justify-center w-full min-h-[100px] text-gray-400 text-sm">
                <span className="opacity-50">拖拽词条到这里</span>
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}
