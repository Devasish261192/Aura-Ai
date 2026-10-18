import React, { useState, useEffect } from 'react';
import { Sparkles, Shield, User, Key, ArrowRight, AlertCircle } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import type { AuthUser } from '../../types';

interface LoginViewProps {
  onSuccess?: () => void;
}

const DEFAULT_TESTERS: AuthUser[] = [
  { username: 'user1', name: 'Tester 1', role_track: 'Workforce Management (WFM)', status: 'ASSIGNED', badge: 'WFM / RTA', color: 'border-cyan-500/40 bg-cyan-950/30 text-cyan-300' },
  { username: 'user2', name: 'Tester 2', role_track: 'Human Resources & Talent Acquisition', status: 'ASSIGNED', badge: 'HR / Talent', color: 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300' },
  { username: 'user3', name: 'Tester 3', role_track: 'Management & Business Consulting', status: 'ASSIGNED', badge: 'Consulting', color: 'border-purple-500/40 bg-purple-950/30 text-purple-300' },
  { username: 'user4', name: 'Tester 4', role_track: 'Application Support & Operations', status: 'ASSIGNED', badge: 'App Support', color: 'border-blue-500/40 bg-blue-950/30 text-blue-300' },
  { username: 'user5', name: 'Tester 5', role_track: 'Data Engineering & Analytics', status: 'ASSIGNED', badge: 'Data Analytics', color: 'border-amber-500/40 bg-amber-950/30 text-amber-300' },
  ...Array.from({ length: 15 }, (_, i) => {
    const num = i + 6;
    return {
      username: `user${num}`,
      name: `Tester ${num}`,
      role_track: 'Open Career Track · Available Slot',
      status: 'OPEN' as const,
      badge: 'OPEN',
      color: 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400'
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
        setError('Invalid credentials. Use user1 to user20 with password1234.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/90 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 my-auto">
        {/* Brand Header */}
        <div className="flex items-center space-x-3 border-b border-gray-800 pb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-white tracking-tight">Aura AI Beta</h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20">
                v1.0 Multi-Tenant (20 Testers)
              </span>
            </div>
            <p className="text-xs text-gray-400">Founder & Beta Tester Portal</p>
          </div>
        </div>

        {/* Quick Tester Selector */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs text-gray-300">
            <span className="font-semibold">Quick 1-Click Tester Selection:</span>
            <span className="text-[11px] font-mono text-cyan-400">Shared Password: password1234</span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-950 border border-gray-800 text-xs">
            <button
              type="button"
              onClick={() => setTesterFilter('all')}
              className={`flex-1 py-1 px-2 rounded-lg font-medium transition-all cursor-pointer ${
                testerFilter === 'all' ? 'bg-blue-600 text-white font-bold shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              All (20)
            </button>
            <button
              type="button"
              onClick={() => setTesterFilter('open')}
              className={`flex-1 py-1 px-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                testerFilter === 'open' ? 'bg-emerald-600 text-white font-bold shadow-sm' : 'text-emerald-400 hover:text-emerald-300'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Available ({openCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setTesterFilter('assigned')}
              className={`flex-1 py-1 px-2 rounded-lg font-medium transition-all cursor-pointer ${
                testerFilter === 'assigned' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              Assigned ({assignedCount})
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1.5 border border-gray-800/80 rounded-xl bg-gray-950/60">
            {filteredTesters.map((t) => {
              const isOpen = t.status === 'OPEN';
              return (
                <button
                  key={t.username}
                  type="button"
                  onClick={() => handleSelectPreset(t.username)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all hover:scale-[1.01] cursor-pointer ${
                    isOpen
                      ? 'border-emerald-500/40 bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-200'
                      : 'border-blue-500/30 bg-blue-950/30 hover:bg-blue-950/50 text-blue-200'
                  }`}
                >
                  <div className="truncate pr-2">
                    <span className="text-xs font-bold block truncate text-white">{t.name}</span>
                    <span className="text-[11px] text-gray-400 block truncate font-medium">
                      {t.role_track}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0 border ${
                      isOpen
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 animate-pulse'
                        : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
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
            <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Username / Test ID</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. user1"
                  className="w-full pl-9 pr-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Password</label>
              <div className="relative">
                <Key className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password1234"
                  className="w-full pl-9 pr-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors font-mono"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In as {username || 'Tester'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Isolation Note */}
        <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between text-[11px] text-gray-500">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            100% Isolated Session & Artifacts per Tester
          </span>
          <span className="font-mono text-gray-600">OCI Cloud Beta</span>
        </div>
      </div>
    </div>
  );
};
