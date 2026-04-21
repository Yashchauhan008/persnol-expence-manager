import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, TrendingUp, TrendingDown, HandCoins, Tags,
  BarChart3, Menu, X, Wallet, LogOut, Moon, Sun,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/useTheme';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/income', icon: TrendingUp, label: 'Income' },
  { to: '/expenses', icon: TrendingDown, label: 'Expenses' },
  { to: '/loans/given', icon: HandCoins, label: 'Loans Given' },
  { to: '/loans/taken', icon: HandCoins, label: 'Loans Taken' },
  { to: '/tags', icon: Tags, label: 'Tags' },
  { to: '/summary', icon: BarChart3, label: 'Summary' },
];

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="flex h-screen min-h-0">
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-20 bg-zinc-950/35 backdrop-blur-[1px] transition-opacity duration-200 ease-out dark:bg-black/55 lg:hidden"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex w-[17rem] flex-col border-r border-white/40 bg-white/70 shadow-[4px_0_24px_-12px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-transform duration-200 ease-out dark:border-zinc-700/60 dark:bg-zinc-900/85 dark:shadow-[4px_0_24px_-12px_rgba(0,0,0,0.5)] lg:translate-x-0 lg:static lg:z-auto',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-[3.65rem] items-center gap-3 border-b border-zinc-200/60 px-5 dark:border-zinc-700/60">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/35 ring-1 ring-white/25">
            <Wallet className="h-[1.15rem] w-[1.15rem]" />
            <span className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-t from-transparent to-white/15" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="block truncate text-[15px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              ExpenseManager
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-400 dark:text-zinc-500">
              Finance
            </span>
          </div>
          <button
            type="button"
            className="rounded-lg p-1.5 text-zinc-500 transition-colors duration-150 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center gap-3 rounded-lg py-2.5 pl-3 pr-3 text-[13px] font-medium transition-[color,background-color,transform] duration-150 ease-out',
                  isActive &&
                    'bg-indigo-500/[0.09] text-indigo-700 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.12)] before:absolute before:left-0 before:top-1/2 before:h-6 before:w-[3px] before:-translate-y-1/2 before:rounded-full before:bg-gradient-to-b before:from-indigo-500 before:to-violet-500 before:shadow-[0_0_12px_rgba(99,102,241,0.55)] before:content-[""]',
                  !isActive && 'text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800/85 dark:hover:text-zinc-100',
                  isActive && 'dark:bg-indigo-500/25 dark:text-indigo-200 dark:shadow-[inset_0_0_0_1px_rgba(129,140,248,0.3)]'
                )
              }
            >
              <Icon className="relative h-[15px] w-[15px] shrink-0 opacity-70 transition-[opacity,transform] duration-150 ease-out group-hover:scale-[1.03] group-hover:opacity-100 aria-[current=page]:opacity-100" />
              <span className="relative truncate">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="space-y-3 border-t border-zinc-200/60 p-4 dark:border-zinc-700/60">
          <div className="min-w-0 rounded-lg bg-zinc-50/80 px-3 py-2 ring-1 ring-zinc-900/5 dark:bg-zinc-800/60 dark:ring-zinc-100/10">
            <p className="truncate text-xs font-medium text-zinc-800 dark:text-zinc-100" title={user?.email}>
              {user?.display_name || user?.email || 'Signed in'}
            </p>
            {user?.display_name ? (
              <p className="truncate text-[11px] text-zinc-500 dark:text-zinc-400" title={user.email}>
                {user.email}
              </p>
            ) : null}
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={toggleTheme}>
            {isDark ? <Sun className="h-4 w-4 opacity-80" /> : <Moon className="h-4 w-4 opacity-80" />}
            {isDark ? 'Light mode' : 'Dark mode'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 border-zinc-200/90 text-zinc-600 hover:text-zinc-900 dark:border-zinc-700/70 dark:text-zinc-300 dark:hover:text-zinc-100"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 opacity-80" />
            Sign out
          </Button>
          <p className="text-center text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Personal workspace
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[3.65rem] shrink-0 items-center gap-3 border-b border-zinc-200/60 bg-white/55 px-4 backdrop-blur-md dark:border-zinc-700/60 dark:bg-zinc-900/60 lg:hidden">
          <Button variant="ghost" size="icon" className="shrink-0 text-zinc-600 dark:text-zinc-300" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm shadow-indigo-500/30">
              <Wallet className="h-4 w-4" />
            </div>
            <span className="truncate font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">ExpenseManager</span>
          </div>
          <Button variant="ghost" size="icon" className="ml-auto shrink-0 text-zinc-600 dark:text-zinc-300" onClick={toggleTheme}>
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-9">
          <div className="mx-auto max-w-[1400px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
