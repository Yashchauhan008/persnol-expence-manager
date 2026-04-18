import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

interface PageBackButtonProps {
  to?: string;
  label?: string;
}

export function PageBackButton({ to, label = 'Back' }: PageBackButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) navigate(to);
    else navigate(-1);
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleClick} className="gap-1">
      <ChevronLeft className="h-4 w-4" />
      {label}
    </Button>
  );
}
