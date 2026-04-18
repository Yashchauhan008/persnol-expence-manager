import { useState } from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useGetTags, useCreateTag, useUpdateTag, useDeleteTag } from '@/hooks/useTags';
import type { Tag } from '@/types/tag';

const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
  '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#64748b',
];

export default function ManageTags() {
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

  const ColorPicker = () => (
    <div className="space-y-2">
      <Label>Color</Label>
      <div className="flex flex-wrap gap-2">
        {PRESET_COLORS.map(c => (
          <button
            key={c}
            type="button"
            className="h-7 w-7 rounded-full transition-transform hover:scale-110 flex items-center justify-center"
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
            className="h-7 w-7 rounded cursor-pointer border border-slate-200"
          />
          <span className="text-xs text-slate-400">{color}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Tags</h1>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" />Create Tag
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      ) : tags.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-400 mb-3">No tags yet. Tags help categorize your expenses.</p>
          <Button size="sm" onClick={openCreate}>Create your first tag</Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {tags.map(tag => (
            <Card key={tag.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-2" style={{ backgroundColor: tag.color }} />
              <CardContent className="pt-3 pb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: tag.color }} />
                    <span className="font-medium text-sm text-slate-900 truncate">{tag.name}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(tag)}>
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-500 hover:text-red-600"
                    onClick={() => setDeleteId(tag.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
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
            <ColorPicker />
            <div className="flex items-center gap-2 pt-1">
              <span className="text-sm text-slate-500">Preview:</span>
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                style={{ backgroundColor: color }}
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
            <ColorPicker />
            <div className="flex items-center gap-2 pt-1">
              <span className="text-sm text-slate-500">Preview:</span>
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                style={{ backgroundColor: color }}
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
