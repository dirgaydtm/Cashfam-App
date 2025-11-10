import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { THEMES } from '@/constants/themes';
import { TrendingDown, TrendingUp } from 'lucide-react';

const THEME_KEY = 'app-theme';

export default function Theme() {
  const prefersDark = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }, []);

  const [theme, setTheme] = useState<string>(() => {
    if (typeof window === 'undefined') return 'light';
    return localStorage.getItem(THEME_KEY) || (prefersDark ? 'dark' : 'light');
  });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_KEY, theme);
    }
  }, [theme]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => {
      const saved = localStorage.getItem(THEME_KEY);
      if (!saved) setTheme(e.matches ? 'dark' : 'light');
    };
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);


  return (
    <AuthenticatedLayout>
      <Head title="Theme" />
      <div className="px-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-base-content">Theme Settings</h3>
            <p className="text-sm text-base-content/60">Pick a theme to preview and apply instantly.</p>
          </div>
          <div className="badge badge-outline p-4 hidden md:flex">Current:
            <p className='font-semibold'>{theme}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 lg:gap-6">
          {THEMES.map((t) => {
            const active = t === theme;
            return (
              <button
                key={t}
                type="button"
                aria-label={`Activate theme ${t}`}
                aria-pressed={active}
                onClick={() => setTheme(t)}
                className={`group relative rounded-lg border text-left p-2 flex flex-col gap-2 focus:outline-none focus:ring-2 focus:ring-primary transition ${active ? 'border-primary ring-1 ring-primary' : 'border-base-300 hover:border-base-content/40'
                  }`}
                data-theme={t}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs lg:text-sm font-medium truncate">{t}</span>
                  {active && <span className="badge badge-primary badge-xs">Active</span>}
                </div>
                {/* Palette preview */}
                <div className="grid grid-cols-4 gap-1 lg:gap-2">
                  <div className="h-4 lg:h-7 rounded bg-primary" />
                  <div className="h-4 lg:h-7 rounded bg-secondary" />
                  <div className="h-4 lg:h-7 rounded bg-accent" />
                  <div className="h-4 lg:h-7 rounded bg-neutral" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
