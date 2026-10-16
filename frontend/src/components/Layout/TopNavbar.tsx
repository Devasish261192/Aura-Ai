import React from 'react';
import {
  Sparkles,
  Gamepad2,
  GraduationCap,
  Video,
  Layers,
  Dna,
  Activity,
  User,
  Briefcase,
  LogOut,
  GitFork
} from 'lucide-react';
import { useAppStore, type AppModule } from '../../store/useAppStore';

export const TopNavbar: React.FC = () => {
  const { activeModule, setActiveModule, artifacts, isChatCollapsed, toggleChatCollapse, currentUser, logout } = useAppStore();

  const candidateName = artifacts?.profile_master?.candidate?.name || currentUser?.name || currentUser?.username || 'Aura Candidate';
  const targetProfiles = artifacts?.traits?.target_profiles || [];
  const topTrack = targetProfiles[0];

  const navItems: Array<{ id: AppModule; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string; color: string }> = [
    {
      id: 'landing',
      label: 'Career Trajectory Tree',
      icon: GitFork,
      badge: 'Interactive',
      color: 'text-cyan-400'
    },
    {
      id: 'tracker',
      label: '30-Day Level-Up OS & Tracker',
      icon: Gamepad2,
      color: 'text-amber-400'
    },
    {
      id: 'trainer',
      label: 'Interview Trainer',
      icon: GraduationCap,
      color: 'text-cyan-400'
    },
    {
      id: 'interview',
      label: 'AI Interview Studio',
      icon: Video,
      color: 'text-purple-400'
    },
    {
      id: 'cvforge',
      label: 'CV Forge',
      icon: Layers,
      badge: 'Interactive',
      color: 'text-amber-300'
    },
    {
      id: 'traits',
      label: 'Traits & Vault',
      icon: Dna,
      color: 'text-emerald-400'
    },
    {
      id: 'jobs',
      label: 'Job Radar & Telegram',
      icon: Briefcase,
      badge: 'Market + 5 TG',
      color: 'text-sky-400'
    }
  ];

  return (
    <header className="h-14 border-b border-gray-800 bg-gray-950/95 px-5 flex items-center justify-between z-20 shrink-0">
      {/* Brand */}
      <div className="flex items-center space-x-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/20">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-1.5">
            <span className="font-bold text-sm text-white tracking-tight">Aura AI</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 font-medium border border-blue-500/20">
              v1.0
            </span>
          </div>
          <p className="text-[10px] text-gray-400 leading-none">Job Counselor & Trait Compiler</p>
        </div>
      </div>

      {/* Center Module Navigation Tabs (Version 0 Architecture) */}
      <nav className="flex items-center space-x-1 bg-gray-900/90 p-1 rounded-xl border border-gray-800">
        {navItems.map((item) => {
          const isActive = activeModule === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold ring-1 ring-blue-400/40'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800/60'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : item.color}`} />
              <span>{item.label}</span>
              {item.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                    isActive ? 'bg-amber-400 text-gray-950 font-bold' : 'bg-amber-400/10 text-amber-300 border border-amber-400/20'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Right User & Live Status Bar */}
      <div className="flex items-center space-x-3 shrink-0">
        {topTrack && (
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-900 border border-gray-800 text-[11px] text-gray-300">
            <span className="text-gray-500 font-mono">Track 1:</span>
            <span className="font-semibold text-blue-300 truncate max-w-[150px]">{topTrack.title.split('/')[0]}</span>
            <span className="text-emerald-400 font-mono font-bold text-[10px] bg-emerald-500/10 px-1 rounded">
              {topTrack.match_score}%
            </span>
          </div>
        )}

        {/* Toggle Counselor Chat */}
        <button
          onClick={toggleChatCollapse}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
            !isChatCollapsed
              ? 'bg-blue-600/20 text-blue-300 border-blue-500/40 shadow-sm'
              : 'bg-gray-900 text-gray-400 hover:text-white border-gray-800'
          }`}
          title={isChatCollapsed ? 'Open Aura Counselor' : 'Collapse Chat to Fullscreen'}
        >
          <Sparkles className={`w-3.5 h-3.5 ${!isChatCollapsed ? 'text-amber-300 animate-pulse' : 'text-gray-400'}`} />
          <span className="hidden sm:inline">Counselor</span>
          <span className={`w-1.5 h-1.5 rounded-full ${!isChatCollapsed ? 'bg-emerald-400' : 'bg-gray-600'}`}></span>
        </button>

        <div className="flex items-center space-x-2 text-xs bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-800 text-gray-200">
          <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
            <User className="w-3 h-3" />
          </div>
          <span className="font-medium text-xs text-gray-200 truncate max-w-[120px]">{candidateName}</span>
          {currentUser && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {currentUser.username}
            </span>
          )}
        </div>

        {currentUser && (
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-rose-400 hover:bg-rose-950/30 border border-transparent hover:border-rose-900/40 transition-colors cursor-pointer"
            title="Sign Out / Switch Tester"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        )}

        <div className="flex items-center space-x-1.5 text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 font-mono">
          <Activity className="w-3 h-3 animate-pulse" />
          <span>Live</span>
        </div>
      </div>
    </header>
  );
};
