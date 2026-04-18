import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageBackButton } from '@/components/shared/PageBackButton';
import { useCreateLoan, useGetLoan, useUpdateLoan } from '@/hooks/useLoans';
import { todayISO, toInputDate } from '@/lib/utils';
import type { LoanType } from '@/types/loan';

export default function LoanForm() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const defaultType = (searchParams.get('type') as LoanType) || 'given';
  const { data: loan } = useGetLoan(id ?? '');
  const { mutate: create, isPending: creating } = useCreateLoan();
  const { mutate: update, isPending: updating } = useUpdateLoan();

  const [type, setType] = useState<LoanType>(defaultType);
  const [personName, setPersonName] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(() => (id ? '' : todayISO()));
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (!id) {
      setDate(todayISO());
    }
  }, [id]);

  useEffect(() => {
    if (loan && id) {
      setType(loan.type);
      setPersonName(loan.person_name);
      setAmount(String(loan.amount));
      setNote(loan.note ?? '');
      setDate(toInputDate(loan.date));
      setDueDate(loan.due_date ? toInputDate(loan.due_date) : '');
    }
  }, [loan, id]);

  const backTo = `/loans/${type === 'given' ? 'given' : 'taken'}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      type,
      person_name: personName,
      amount: parseFloat(amount),
      note: note || undefined,
      date,
      due_date: dueDate || null,
    };

    if (isEditing && id) {
      update(
        { id, data: { person_name: payload.person_name, note: payload.note, date: payload.date, due_date: payload.due_date } },
        { onSuccess: () => navigate(backTo) }
      );
    } else {
      create(payload, { onSuccess: () => navigate(backTo) });
    }
  };

  const isPending = creating || updating;

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <PageBackButton to={backTo} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Loan' : 'Record Loan'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isEditing && (
              <div className="space-y-1.5">
                <Label>Loan Type *</Label>
                <Select value={type} onValueChange={(v) => setType(v as LoanType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="given">Given (money I lent out)</SelectItem>
                    <SelectItem value="taken">Taken (money I borrowed)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="person">
                {type === 'given' ? 'Lent to (Person Name) *' : 'Borrowed from (Person Name) *'}
              </Label>
              <Input
                id="person"
                placeholder="Person's name"
                value={personName}
                onChange={e => setPersonName(e.target.value)}
                required
                autoFocus
              />
            </div>

            {!isEditing && (
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
            )}

            <div className="space-y-1.5">
              <Label htmlFor="date">Date *</Label>
              <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="due-date">Due Date (optional)</Label>
              <Input id="due-date" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
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
                {isPending ? 'Saving...' : isEditing ? 'Update Loan' : 'Record Loan'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(backTo)}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
