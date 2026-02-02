'use client';

import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { Tag } from '@/types/ranking';
import { SortableTagItem } from './SortableTagItem';
import { useDroppable } from '@dnd-kit/core';

interface UnsortedPoolProps {
  tags: Tag[];
  selectedTags?: Set<string>;
  onToggleSelect?: (tagId: string) => void;
}

export function UnsortedPool({ tags, selectedTags = new Set(), onToggleSelect }: UnsortedPoolProps) {
  const { setNodeRef, isOver } = useDroppable({ id: 'unassigned' });

  return (
    <div className="mt-6">
      {/* 标题 */}
      <div className="font-bold mb-2 text-gray-700">未排序词条</div>

      {/* 未排序池列表 */}
      <div
        ref={setNodeRef}
        className={`
          p-2 min-h-[120px] overflow-x-auto
          ${isOver ? 'bg-blue-50' : ''}
        `}
        style={{
          backgroundColor: '#d9d9d9',
          minHeight: '120px',
        }}
      >
        <SortableContext items={tags} strategy={horizontalListSortingStrategy}>
          <div className="flex flex-wrap gap-2 min-h-[120px] pointer-events-none">
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
              <div className="flex items-center justify-center w-full min-h-[120px] text-gray-400 text-sm">
                <span className="opacity-50">拖拽词条到这里</span>
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}
