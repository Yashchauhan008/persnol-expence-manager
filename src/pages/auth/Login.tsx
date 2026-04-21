import { useCallback, useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Building2, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { env } from '@/config/env';

const GSI_SCRIPT = 'https://accounts.google.com/gsi/client';

function loadGsiScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.google?.accounts?.id) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GSI_SCRIPT}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Google Sign-In')));
      return;
    }
    const script = document.createElement('script');
    script.src = GSI_SCRIPT;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Sign-In'));
    document.head.appendChild(script);
  });
}

export default function Login() {
  const { signInWithGoogleIdToken, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const buttonHostRef = useRef<HTMLDivElement>(null);
  const [gsiReady, setGsiReady] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleCredential = useCallback(
    async (credential: string) => {
      setBusy(true);
      try {
        await signInWithGoogleIdToken(credential);
        navigate('/', { replace: true });
      } catch (err) {
        const message = axios.isAxiosError(err)
          ? String(err.response?.data?.error?.message ?? err.message)
          : 'Sign-in failed';
        toast.error(message);
      } finally {
        setBusy(false);
      }
    },
    [navigate, signInWithGoogleIdToken]
  );

  useEffect(() => {
    if (!env.GOOGLE_CLIENT_ID) {
      toast.error('Google Sign-In is not configured (VITE_GOOGLE_CLIENT_ID)');
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        await loadGsiScript();
        if (cancelled || !buttonHostRef.current) return;

        window.google!.accounts.id.initialize({
          client_id: env.GOOGLE_CLIENT_ID,
          callback: (res) => {
            if (res.credential) void handleCredential(res.credential);
          },
        });

        window.google!.accounts.id.renderButton(buttonHostRef.current, {
          theme: 'outline',
          size: 'large',
          width: 320,
          text: 'continue_with',
          locale: 'en',
        });

        setGsiReady(true);
      } catch {
        toast.error('Could not load Google Sign-In');
      }
    })();

    return () => {
      cancelled = true;
      window.google?.accounts.id.cancel();
    };
  }, [handleCredential]);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-100 dark:bg-zinc-950 lg:flex-row">
      <div className="relative flex flex-col justify-between bg-gradient-to-br from-zinc-950 via-zinc-900 to-indigo-950 px-8 py-10 text-white lg:w-[46%] lg:min-h-screen lg:px-12 lg:py-14">
        <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2240%22%20height=%2240%22%20viewBox=%220%200%2040%2040%22%3E%3Cg%20fill=%22none%22%20fill-opacity=%220.06%22%3E%3Cpath%20d=%22M0%2040h40V0H0z%22%20fill=%22%23fff%22/%3E%3C/g%3E%3C/svg%3E')] opacity-90" />
        <div className="pointer-events-none absolute -right-24 top-1/4 h-72 w-72 rounded-full bg-indigo-500/25 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 shadow-lg shadow-black/20 ring-1 ring-white/20 backdrop-blur-md transition-transform duration-200 hover:scale-[1.02]">
              <Building2 className="h-6 w-6 text-indigo-200" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-200/95">
                ExpenseManager
              </p>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Personal finance</h1>
            </div>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-zinc-300">
            Secure Google sign-in. Your income, expenses, and loans stay in this workspace only.
          </p>
          <ul className="space-y-3 text-sm text-zinc-300">
            <li className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal-400" />
              <span>Google-verified identity — this app does not store passwords.</span>
            </li>
            <li className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal-400" />
              <span>Fast, focused UI for daily tracking and month-end clarity.</span>
            </li>
          </ul>
        </div>
        <p className="relative z-10 text-xs text-zinc-500">
          © {new Date().getFullYear()} ExpenseManager · Authorized access only
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:py-16">
        <div className="w-full max-w-md rounded-2xl border border-zinc-200/80 bg-white/90 p-8 shadow-[0_24px_64px_-24px_rgba(15,23,42,0.18)] backdrop-blur-md transition-shadow duration-200 hover:shadow-[0_28px_72px_-24px_rgba(99,102,241,0.12)] dark:border-zinc-700/80 dark:bg-zinc-900/85 dark:shadow-[0_24px_64px_-24px_rgba(0,0,0,0.55)]">
          <div className="mb-8 space-y-2 text-center lg:text-left">
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Welcome back</h2>
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Sign in with Google to continue. This is the only sign-in method for this app.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div
              ref={buttonHostRef}
              className="min-h-[44px] flex items-center justify-center [&>div]:w-full"
            />
            {!gsiReady && !busy && (
              <p className="text-xs text-slate-500 dark:text-zinc-400">Loading Google Sign-In…</p>
            )}
            {busy && <p className="text-xs text-slate-500 dark:text-zinc-400">Completing sign-in…</p>}
          </div>

          <p className="mt-8 text-center text-[11px] leading-relaxed text-zinc-400 dark:text-zinc-500">
            By continuing, you agree that your name and email from Google may be stored to provide
            access to this application.
          </p>
        </div>
      </div>
    </div>
  );
}
