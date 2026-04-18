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
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-100">
      {/* Brand panel — enterprise / ERP style */}
      <div className="relative flex flex-col justify-between bg-linear-to-br from-slate-900 via-slate-800 to-indigo-950 text-white px-8 py-10 lg:w-[46%] lg:min-h-screen lg:px-12 lg:py-14">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2240%22%20height=%2240%22%20viewBox=%220%200%2040%2040%22%3E%3Cg%20fill=%22none%22%20fill-opacity=%220.06%22%3E%3Cpath%20d=%22M0%2040h40V0H0z%22%20fill=%22%23fff%22/%3E%3C/g%3E%3C/svg%3E')] opacity-90 pointer-events-none" />
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/20 backdrop-blur">
              <Building2 className="h-6 w-6 text-indigo-200" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200/90">
                ProERP Suite
              </p>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Expense Manager</h1>
            </div>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-slate-300">
            Secure workspace sign-in. Your income, expenses, and loans are visible only to your
            organization account.
          </p>
          <ul className="space-y-3 text-sm text-slate-300">
            <li className="flex items-start gap-2">
              <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" />
              <span>Google-verified identity; no passwords stored in this app.</span>
            </li>
            <li className="flex items-start gap-2">
              <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" />
              <span>Role-ready layout aligned with enterprise ERP portals.</span>
            </li>
          </ul>
        </div>
        <p className="relative z-10 text-xs text-slate-500">
          © {new Date().getFullYear()} Expense Manager · Authorized access only
        </p>
      </div>

      {/* Sign-in panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:py-16">
        <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-200/50">
          <div className="mb-8 space-y-2 text-center lg:text-left">
            <h2 className="text-xl font-semibold text-slate-900">Welcome</h2>
            <p className="text-sm text-slate-600">
              Sign in with your Google account to open the application. No other sign-in method is
              available.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div
              ref={buttonHostRef}
              className="min-h-[44px] flex items-center justify-center [&>div]:w-full"
            />
            {!gsiReady && !busy && (
              <p className="text-xs text-slate-500">Loading Google Sign-In…</p>
            )}
            {busy && <p className="text-xs text-slate-500">Completing sign-in…</p>}
          </div>

          <p className="mt-8 text-center text-[11px] leading-relaxed text-slate-400">
            By continuing, you agree that your name and email from Google may be stored to provide
            access to this application.
          </p>
        </div>
      </div>
    </div>
  );
}
