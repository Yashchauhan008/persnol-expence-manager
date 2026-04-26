import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PageBackButton } from '@/components/shared/PageBackButton';
import { useCreateIncome, useGetIncome, useUpdateIncome } from '@/hooks/useIncome';
import { todayISO, toInputDate } from '@/lib/utils';

export default function IncomeForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const { data: income } = useGetIncome(id ?? '');
  const { mutate: create, isPending: creating } = useCreateIncome();
  const { mutate: update, isPending: updating } = useUpdateIncome();

  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(() => (id ? '' : todayISO()));
  const [chartVisibility, setChartVisibility] = useState(true);

  useEffect(() => {
    if (!id) {
      setDate(todayISO());
    }
  }, [id]);

  useEffect(() => {
    if (income && id) {
      setAmount(String(income.amount));
      setSource(income.source);
      setNote(income.note ?? '');
      setDate(toInputDate(income.date));
      setChartVisibility(income.chart_visibility ?? true);
    }
  }, [income, id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      amount: parseFloat(amount),
      source,
      note: note || undefined,
      date,
      chart_visibility: chartVisibility,
    };

    if (isEditing && id) {
      update({ id, data: payload }, { onSuccess: () => navigate('/income') });
    } else {
      create(payload, { onSuccess: () => navigate('/income') });
    }
  };

  const isPending = creating || updating;

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <PageBackButton to="/income" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Income' : 'Add Income'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="source">Source *</Label>
              <Input
                id="source"
                placeholder="e.g. Salary, Freelance, Dividend"
                value={source}
                onChange={e => setSource(e.target.value)}
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

            <div className="flex items-center space-x-2 rounded-md border p-3">
              <input
                id="chart-visibility"
                type="checkbox"
                className="h-4 w-4 accent-indigo-600"
                checked={chartVisibility}
                onChange={e => setChartVisibility(e.target.checked)}
              />
              <Label htmlFor="chart-visibility" className="cursor-pointer">
                Show this income in dashboard chart
              </Label>
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : isEditing ? 'Update Income' : 'Add Income'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/income')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
