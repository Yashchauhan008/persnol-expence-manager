import { useState } from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { useGetTags, useCreateTag, useUpdateTag, useDeleteTag } from '@/hooks/useTags';
import { useTheme } from '@/context/useTheme';
import { cn, formatCurrency, getReadableTextColor, hexToRgba } from '@/lib/utils';
import type { Tag } from '@/types/tag';

const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
  '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#64748b',
];

function TagColorPicker({
  color,
  setColor,
}: {
  color: string;
  setColor: (c: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>Color</Label>
      <div className="flex flex-wrap gap-2">
        {PRESET_COLORS.map(c => (
          <button
            key={c}
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full ring-2 ring-transparent transition-[transform,box-shadow,ring-color] duration-150 hover:scale-110 hover:ring-white/80"
            style={{ backgroundColor: c }}
            onClick={() => setColor(c)}
          >
            {color === c && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
          </button>
        ))}
        <div className="flex items-center gap-1">
          <input
            type="color"
            value={color}
            onChange={e => setColor(e.target.value)}
            className="h-8 w-8 cursor-pointer overflow-hidden rounded-lg border border-zinc-200/90 transition-shadow duration-150 hover:shadow-md"
          />
          <span className="text-xs tabular-nums text-zinc-400 dark:text-zinc-300">{color}</span>
        </div>
      </div>
    </div>
  );
}

export default function ManageTags() {
  const { isDark } = useTheme();
  const { data: tags = [], isLoading } = useGetTags();
  const { mutate: createTag, isPending: creating } = useCreateTag();
  const { mutate: updateTag, isPending: updating } = useUpdateTag();
  const { mutate: deleteTag, isPending: deleting } = useDeleteTag();

  const [createOpen, setCreateOpen] = useState(false);
  const [editTag, setEditTag] = useState<Tag | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [color, setColor] = useState('#6366f1');

  const openCreate = () => {
    setName('');
    setColor('#6366f1');
    setCreateOpen(true);
  };

  const openEdit = (tag: Tag) => {
    setName(tag.name);
    setColor(tag.color);
    setEditTag(tag);
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    createTag({ name: name.trim(), color }, { onSuccess: () => setCreateOpen(false) });
  };

  const handleUpdate = () => {
    if (!editTag || !name.trim()) return;
    updateTag({ id: editTag.id, data: { name: name.trim(), color } }, { onSuccess: () => setEditTag(null) });
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteTag(deleteId, { onSuccess: () => setDeleteId(null) });
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader title="Tags" description="Labels for expenses. The stripe matches each tag color; totals are all-time.">
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Create tag
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-[7.5rem] animate-pulse rounded-xl bg-zinc-100/80 dark:bg-zinc-800/60" />
          ))}
        </div>
      ) : tags.length === 0 ? (
        <div className="py-16 text-center">
          <p className="mb-4 text-sm text-zinc-400 dark:text-zinc-300">No tags yet. Tags help categorize your expenses.</p>
          <Button size="sm" onClick={openCreate}>
            Create your first tag
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {tags.map(tag => {
            const total = Number(tag.total_expense_amount ?? 0);
            return (
              <article
                key={tag.id}
                className={cn(
                  'group flex min-h-[7.5rem] flex-col justify-between rounded-xl border-y border-r border-zinc-400/80 border-l-[3px] px-3 py-3 shadow-sm',
                  'transition-[box-shadow,filter] duration-150 ease-out hover:shadow-md'
                )}
                style={{
                  borderLeftColor: tag.color,
                  background: isDark
                    ? `linear-gradient(180deg, ${hexToRgba(tag.color, 0.2)} 0%, rgba(24,24,27,0.92) 48%, rgba(9,9,11,0.98) 100%)`
                    : `linear-gradient(180deg, ${hexToRgba(tag.color, 0.07)} 0%, #ffffff 48%, #fafafa 100%)`,
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 flex-1 items-start gap-2">
                    <span
                      className="mt-1.5 h-2 w-2 shrink-0 rounded-full ring-1 ring-zinc-900/10"
                      style={{ backgroundColor: tag.color }}
                      aria-hidden
                    />
                    <h3 className="line-clamp-2 min-w-0 flex-1 break-words text-[13px] font-medium leading-snug tracking-tight text-zinc-900 dark:text-zinc-100">
                      {tag.name}
                    </h3>
                  </div>
                  <div className="flex shrink-0 gap-0.5 opacity-80 transition-opacity duration-150 group-hover:opacity-100">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-zinc-500 hover:bg-zinc-200/60 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-700/60 dark:hover:text-zinc-100"
                      onClick={() => openEdit(tag)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-zinc-500 hover:bg-rose-50 hover:text-rose-600 dark:text-zinc-300 dark:hover:bg-rose-500/20 dark:hover:text-rose-300"
                      onClick={() => setDeleteId(tag.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <p
                  className="mt-3 text-lg font-semibold tabular-nums tracking-tight sm:text-xl"
                  style={{
                    color: isDark
                      ? `color-mix(in srgb, ${tag.color} 34%, rgb(244 244 245))`
                      : `color-mix(in srgb, ${tag.color} 30%, rgb(24 24 27))`,
                  }}
                >
                  {formatCurrency(total)}
                </p>
              </article>
            );
          })}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Create Tag</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="tag-name">Name *</Label>
              <Input
                id="tag-name"
                placeholder="e.g. Food, Travel, Health"
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
              />
            </div>
            <TagColorPicker color={color} setColor={setColor} />
            <div className="flex items-center gap-2 pt-1">
              <span className="text-sm text-zinc-500 dark:text-zinc-300">Preview:</span>
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                style={{ backgroundColor: color, color: getReadableTextColor(color) }}
              >
                {name || 'Tag name'}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={creating || !name.trim()}>
              {creating ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editTag} onOpenChange={open => !open && setEditTag(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Tag</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-tag-name">Name *</Label>
              <Input
                id="edit-tag-name"
                placeholder="Tag name"
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
              />
            </div>
            <TagColorPicker color={color} setColor={setColor} />
            <div className="flex items-center gap-2 pt-1">
              <span className="text-sm text-zinc-500 dark:text-zinc-300">Preview:</span>
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                style={{ backgroundColor: color, color: getReadableTextColor(color) }}
              >
                {name || 'Tag name'}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTag(null)}><X className="h-4 w-4" />Cancel</Button>
            <Button onClick={handleUpdate} disabled={updating || !name.trim()}>
              {updating ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={open => !open && setDeleteId(null)}
        title="Delete Tag"
        description="This tag will be removed from all expenses. This action cannot be undone."
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
