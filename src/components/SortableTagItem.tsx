'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Tag } from '@/types/ranking';

interface SortableTagItemProps {
  tag: Tag;
  isSelected?: boolean;
  onToggleSelect?: (tagId: string) => void;
}

export function SortableTagItem({ tag, isSelected = false, onToggleSelect }: SortableTagItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tag.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleClick = () => {
    if (onToggleSelect) {
      onToggleSelect(tag.id);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      className={`
        relative bg-white border p-2 cursor-grab active:cursor-grabbing
        min-w-[100px] max-w-[150px] flex-shrink-0 transition-all
        ${isDragging ? 'opacity-50 scale-95' : 'hover:shadow-md'}
        ${isSelected ? 'border-red-500 bg-red-50 ring-2 ring-red-300' : 'border-gray-400'}
        select-none
      `}
    >
      {/* 选中状态指示器 */}
      {isSelected && (
        <div className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      {/* 标签内容 */}
      {tag.type === 'text' && (
        <div className="text-center">
          <span className="font-medium text-sm break-words">{tag.content}</span>
        </div>
      )}

      {tag.type === 'image' && tag.imageUrl && (
        <div className="flex flex-col items-center">
          <img
            src={tag.imageUrl}
            alt={tag.content}
            className="w-16 h-16 object-cover rounded"
          />
          {tag.content && (
            <span className="text-xs mt-1 truncate w-full text-center">
              {tag.content}
            </span>
          )}
        </div>
      )}

      {tag.type === 'mixed' && (
        <div className="flex flex-col items-center">
          {tag.imageUrl && (
            <img
              src={tag.imageUrl}
              alt={tag.content}
              className="w-14 h-14 object-cover rounded"
            />
          )}
          <span className="text-sm font-medium mt-1 text-center break-words">
            {tag.content}
          </span>
        </div>
      )}
    </div>
  );
}
