import type { Tag } from '@/types/tag';
import { getReadableTextColor } from '@/lib/utils';

interface TagBadgeProps {
  tag: Tag;
}

export function TagBadge({ tag }: TagBadgeProps) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm ring-1 ring-black/10 transition-[transform,box-shadow] duration-150 ease-out hover:brightness-105"
      style={{ backgroundColor: tag.color, color: getReadableTextColor(tag.color) }}
    >
      {tag.name}
    </span>
  );
}
