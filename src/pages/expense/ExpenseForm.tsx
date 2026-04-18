import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PageBackButton } from '@/components/shared/PageBackButton';
import { useCreateExpense, useGetExpense, useUpdateExpense } from '@/hooks/useExpenses';
import { useGetTags } from '@/hooks/useTags';
import { todayISO, toInputDate } from '@/lib/utils';
import type { Tag } from '@/types/tag';

export default function ExpenseForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const { data: expense } = useGetExpense(id ?? '');
  const { data: allTags = [] } = useGetTags();
  const { mutate: create, isPending: creating } = useCreateExpense();
  const { mutate: update, isPending: updating } = useUpdateExpense();

  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(() => (id ? '' : todayISO()));
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

  useEffect(() => {
    if (!id) {
      setDate(todayISO());
    }
  }, [id]);

  useEffect(() => {
    if (expense && id) {
      setAmount(String(expense.amount));
      setTitle(expense.title);
      setNote(expense.note ?? '');
      setDate(toInputDate(expense.date));
      setSelectedTags(expense.tags ?? []);
    }
  }, [expense, id]);

  const toggleTag = (tag: Tag) => {
    setSelectedTags(prev =>
      prev.find(t => t.id === tag.id) ? prev.filter(t => t.id !== tag.id) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      amount: parseFloat(amount),
      title,
      note: note || undefined,
      date,
      tag_ids: selectedTags.map(t => t.id),
    };

    if (isEditing && id) {
      update({ id, data: payload }, { onSuccess: () => navigate('/expenses') });
    } else {
      create(payload, { onSuccess: () => navigate('/expenses') });
    }
  };

  const isPending = creating || updating;

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <PageBackButton to="/expenses" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Expense' : 'Add Expense'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g. Groceries, Rent, Coffee"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="amount">Amount (₹) *</Label>
              <Input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {selectedTags.map(tag => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                      style={{ backgroundColor: tag.color }}
                    >
                      {tag.name}
                      <X className="h-3 w-3" />
                    </button>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-1.5">
                {allTags
                  .filter(t => !selectedTags.find(s => s.id === t.id))
                  .map(tag => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className="rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors hover:opacity-80"
                      style={{ borderColor: tag.color, color: tag.color }}
                    >
                      + {tag.name}
                    </button>
                  ))}
              </div>
              {allTags.length === 0 && (
                <p className="text-xs text-slate-400">
                  No tags yet. <a href="/tags" className="text-indigo-500 hover:underline">Create some tags</a> first.
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="note">Note</Label>
              <Textarea
                id="note"
                placeholder="Optional note..."
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : isEditing ? 'Update Expense' : 'Add Expense'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/expenses')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
