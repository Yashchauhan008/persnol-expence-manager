import { Badge } from '@/components/ui/badge';
import type { LoanStatus } from '@/types/loan';

interface LoanStatusBadgeProps {
  status: LoanStatus;
}

export function LoanStatusBadge({ status }: LoanStatusBadgeProps) {
  if (status === 'settled') return <Badge variant="success">Settled</Badge>;
  if (status === 'partial') return <Badge variant="warning">Partial</Badge>;
  return <Badge variant="secondary">Pending</Badge>;
}
