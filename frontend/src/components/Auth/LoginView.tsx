import React, { useState } from 'react';
import { Sparkles, Shield, User, Key, ArrowRight, AlertCircle } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface LoginViewProps {
  onSuccess?: () => void;
}

const PRESET_TESTERS = [
  { username: 'user1', label: 'Tester 1: Workforce Management (WFM)', badge: 'WFM / RTA', color: 'border-cyan-500/40 bg-cyan-950/30 text-cyan-300' },
  { username: 'user2', label: 'Tester 2: HR Business Partner (HRBP)', badge: 'HR / Talent', color: 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300' },
  { username: 'user3', label: 'Tester 3: Management Consulting', badge: 'Consulting', color: 'border-purple-500/40 bg-purple-950/30 text-purple-300' },
  { username: 'user4', label: 'Tester 4: Application Support Lead', badge: 'App Support', color: 'border-blue-500/40 bg-blue-950/30 text-blue-300' },
  { username: 'user5', label: 'Tester 5: Data & Analytics Lead', badge: 'Data Analytics', color: 'border-amber-500/40 bg-amber-950/30 text-amber-300' },
  { username: 'user6', label: 'Tester 6: Open Track 6', badge: 'Track 6', color: 'border-gray-700 bg-gray-900 text-gray-300' },
  { username: 'user7', label: 'Tester 7: Open Track 7', badge: 'Track 7', color: 'border-gray-700 bg-gray-900 text-gray-300' },
  { username: 'user8', label: 'Tester 8: Open Track 8', badge: 'Track 8', color: 'border-gray-700 bg-gray-900 text-gray-300' },
  { username: 'user9', label: 'Tester 9: Open Track 9', badge: 'Track 9', color: 'border-gray-700 bg-gray-900 text-gray-300' },
  { username: 'user10', label: 'Tester 10: Open Track 10', badge: 'Track 10', color: 'border-gray-700 bg-gray-900 text-gray-300' },
];

export const LoginView: React.FC<LoginViewProps> = ({ onSuccess }) => {
  const { login } = useAppStore();
  const [username, setUsername] = useState('user1');
  const [password, setPassword] = useState('password1234');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
        setError('Invalid credentials. Use user1 to user10 with password1234.');
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
                v1.0 Multi-Tenant
              </span>
            </div>
            <p className="text-xs text-gray-400">Founder & Beta Tester Portal</p>
          </div>
        </div>

        {/* Quick Tester Selector */}
        <div className="space-y-2.5">
          <label className="text-xs font-semibold text-gray-300 flex items-center justify-between">
            <span>Quick 1-Click Tester Selection:</span>
            <span className="text-[11px] font-mono text-gray-500">Shared Password: password1234</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto p-1 border border-gray-800/80 rounded-xl bg-gray-950/60">
            {PRESET_TESTERS.map((t) => (
              <button
                key={t.username}
                type="button"
                onClick={() => handleSelectPreset(t.username)}
                className={`flex items-center justify-between p-2.5 rounded-lg border text-left transition-all hover:scale-[1.01] cursor-pointer ${t.color}`}
              >
                <div className="truncate pr-2">
                  <span className="text-xs font-semibold block truncate">{t.label}</span>
                  <span className="text-[10px] font-mono opacity-80">{t.username}</span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-900/80 border border-white/10 shrink-0">
                  {t.badge}
                </span>
              </button>
            ))}
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
