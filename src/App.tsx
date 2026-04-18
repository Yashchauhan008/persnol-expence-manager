import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AppLayout } from '@/components/layouts/app.layout';
import Dashboard from '@/pages/Dashboard';
import ListIncomes from '@/pages/income/ListIncomes';
import IncomeForm from '@/pages/income/IncomeForm';
import ListExpenses from '@/pages/expense/ListExpenses';
import ExpenseForm from '@/pages/expense/ExpenseForm';
import ListLoans from '@/pages/loan/ListLoans';
import LoanForm from '@/pages/loan/LoanForm';
import LoanDetail from '@/pages/loan/LoanDetail';
import ManageTags from '@/pages/tag/ManageTags';
import Summary from '@/pages/summary/Summary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />

            <Route path="/income" element={<ListIncomes />} />
            <Route path="/income/new" element={<IncomeForm />} />
            <Route path="/income/:id/edit" element={<IncomeForm />} />

            <Route path="/expenses" element={<ListExpenses />} />
            <Route path="/expenses/new" element={<ExpenseForm />} />
            <Route path="/expenses/:id/edit" element={<ExpenseForm />} />

            <Route path="/loans" element={<Navigate to="/loans/given" replace />} />
            <Route path="/loans/new" element={<LoanForm />} />
            <Route path="/loans/given" element={<ListLoans />} />
            <Route path="/loans/taken" element={<ListLoans />} />
            <Route path="/loans/:id/edit" element={<LoanForm />} />
            <Route path="/loans/:id" element={<LoanDetail />} />

            <Route path="/tags" element={<ManageTags />} />
            <Route path="/summary" element={<Summary />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}
