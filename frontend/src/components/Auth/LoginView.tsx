import React, { useState, useEffect } from 'react';
import { Sparkles, Shield, User, Key, ArrowRight, AlertCircle } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import type { AuthUser } from '../../types';

interface LoginViewProps {
  onSuccess?: () => void;
}

const DEFAULT_TESTERS: AuthUser[] = [
  { username: 'user1', name: 'Tester 1', role_track: 'Workforce Management & Operations', status: 'ASSIGNED', badge: 'Operations', color: 'border-blue-200 bg-blue-50 text-blue-800' },
  { username: 'user2', name: 'Tester 2', role_track: 'Human Resources & Talent Management', status: 'ASSIGNED', badge: 'HR & Talent', color: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
  { username: 'user3', name: 'Tester 3', role_track: 'Business Consulting & Strategy', status: 'ASSIGNED', badge: 'Consulting', color: 'border-purple-200 bg-purple-50 text-purple-800' },
  { username: 'user4', name: 'Tester 4', role_track: 'Customer Operations & Systems', status: 'ASSIGNED', badge: 'Operations', color: 'border-blue-200 bg-blue-50 text-blue-800' },
  { username: 'user5', name: 'Tester 5', role_track: 'Business Analytics & Reports', status: 'ASSIGNED', badge: 'Analytics', color: 'border-amber-200 bg-amber-50 text-amber-800' },
  ...Array.from({ length: 15 }, (_, i) => {
    const num = i + 6;
    return {
      username: `user${num}`,
      name: `Tester ${num}`,
      role_track: 'Open Profile - Available Slot',
      status: 'OPEN' as const,
      badge: 'OPEN',
      color: 'border-emerald-200 bg-emerald-50 text-emerald-700'
    };
  })
];

export const LoginView: React.FC<LoginViewProps> = ({ onSuccess }) => {
  const { login, testers, fetchTesters } = useAppStore();
  const [testerFilter, setTesterFilter] = useState<'all' | 'open' | 'assigned'>('all');
  const [username, setUsername] = useState('user1');
  const [password, setPassword] = useState('password1234');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTesters();
  }, [fetchTesters]);

  const rawTesters = testers && testers.length > 0 ? testers : DEFAULT_TESTERS;
  const openCount = rawTesters.filter((t) => t.status === 'OPEN').length;
  const assignedCount = rawTesters.filter((t) => t.status === 'ASSIGNED').length;

  const filteredTesters = rawTesters.filter((t) => {
    if (testerFilter === 'open') return t.status === 'OPEN';
    if (testerFilter === 'assigned') return t.status === 'ASSIGNED';
    return true;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const ok = await login(username.trim().toLowerCase(), password.trim());
      if (ok) {
        if (onSuccess) onSuccess();
      } else {
        setError('Invalid login. Please choose a tester profile (user1 to user20) with password1234.');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPreset = async (presetUser: string) => {
    setUsername(presetUser);
    setPassword('password1234');
    setIsLoading(true);
    setError(null);
    try {
      const ok = await login(presetUser, 'password1234');
      if (ok && onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 my-auto text-slate-800">
        {/* Brand Header */}
        <div className="flex items-center space-x-3 border-b border-slate-200 pb-5">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Aura Career Coach</h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                Tester Profiles
              </span>
            </div>
            <p className="text-xs text-slate-500">Pick a tester profile to start</p>
          </div>
        </div>

        {/* Quick Tester Selector */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="font-semibold">Quick 1-Click Profile Selection:</span>
            <span className="text-[11px] font-mono text-blue-600">Password: password1234</span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setTesterFilter('all')}
              className={`flex-1 py-1 px-2 rounded-lg font-semibold transition-all cursor-pointer ${
                testerFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All (20)
            </button>
            <button
              type="button"
              onClick={() => setTesterFilter('open')}
              className={`flex-1 py-1 px-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                testerFilter === 'open' ? 'bg-emerald-600 text-white shadow-sm' : 'text-emerald-700 hover:text-emerald-800'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Available ({openCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setTesterFilter('assigned')}
              className={`flex-1 py-1 px-2 rounded-lg font-semibold transition-all cursor-pointer ${
                testerFilter === 'assigned' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Assigned ({assignedCount})
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1.5 border border-slate-200 rounded-2xl bg-slate-50">
            {filteredTesters.map((t) => {
              const isOpen = t.status === 'OPEN';
              return (
                <button
                  key={t.username}
                  type="button"
                  onClick={() => handleSelectPreset(t.username)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all hover:scale-[1.01] cursor-pointer shadow-sm ${
                    isOpen
                      ? 'border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/60 text-emerald-900'
                      : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="truncate pr-2">
                    <span className="text-xs font-bold block truncate text-slate-900">{t.name}</span>
                    <span className="text-[11px] text-slate-500 block truncate font-medium">
                      {t.role_track}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-semibold px-2 py-0.5 rounded-full shrink-0 border ${
                      isOpen
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}
                  >
                    {isOpen ? 'OPEN' : (t.badge || 'ASSIGNED')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Manual Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Username</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. user1"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Password</label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password1234"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span>Signing In...</span>
            ) : (
              <>
                <span>Sign In as {username || 'Tester'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Isolation Note */}
        <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            Each tester has separate, private profile data
          </span>
          <span className="text-slate-400">Aura Beta</span>
        </div>
      </div>
    </div>
  );
};
