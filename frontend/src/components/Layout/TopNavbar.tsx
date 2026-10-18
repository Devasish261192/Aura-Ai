import React, { useState } from 'react';
import {
  Sparkles,
  Gamepad2,
  GraduationCap,
  Video,
  Layers,
  Dna,
  User,
  Briefcase,
  LogOut,
  GitFork,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { useAppStore, type AppModule } from '../../store/useAppStore';
import { useCurrency } from '../../utils/currency';

export const TopNavbar: React.FC = () => {
  const {
    activeModule,
    setActiveModule,
    artifacts,
    isChatCollapsed,
    toggleChatCollapse,
    setChatCollapsed,
    currentUser,
    logout
  } = useAppStore();
  const [currency, setCurrency] = useCurrency();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const candidateName =
    artifacts?.profile_master?.candidate?.name ||
    currentUser?.name ||
    currentUser?.username ||
    'Aura Candidate';

  const navItems: Array<{
    id: AppModule;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    desc?: string;
  }> = [
    {
      id: 'landing',
      label: 'Career Tree',
      icon: GitFork,
      color: 'text-cyan-400',
      desc: 'Predictive 4-tier trajectory & forks'
    },
    {
      id: 'tracker',
      label: 'Level-Up',
      icon: Gamepad2,
      color: 'text-amber-400',
      desc: '30-Day sprint accountability'
    },
    {
      id: 'trainer',
      label: 'Trainer',
      icon: GraduationCap,
      color: 'text-cyan-400',
      desc: 'Behavioral & technical mock prep'
    },
    {
      id: 'interview',
      label: 'AI Studio',
      icon: Video,
      color: 'text-purple-400',
      desc: 'Executive video pitch & speech telemetry'
    },
    {
      id: 'cvforge',
      label: 'CV Forge',
      icon: Layers,
      color: 'text-amber-300',
      desc: 'Multi-track ATS resume compiler'
    },
    {
      id: 'traits',
      label: 'Vault',
      icon: Dna,
      color: 'text-emerald-400',
      desc: 'Permanent story & competency vault'
    },
    {
      id: 'jobs',
      label: 'Job Radar',
      icon: Briefcase,
      color: 'text-sky-400',
      desc: 'Dynamic job matcher & referrals'
    }
  ];

  const handleMobileNavClick = (id: AppModule) => {
    setActiveModule(id);
    setIsMobileMenuOpen(false);
    // On mobile, keep chat closed when switching tool to give full viewport
    setChatCollapsed(true);
  };

  return (
    <>
      <header className="h-14 border-b border-gray-800 bg-gray-950 px-3 sm:px-4 flex items-center justify-between z-20 shrink-0 w-full overflow-hidden">
        {/* Left: Brand */}
        <div className="flex items-center space-x-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-center space-x-1.5 leading-none">
            <span className="font-bold text-sm text-white tracking-tight">Aura AI</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 font-mono font-medium border border-blue-500/20">
              v1.0
            </span>
          </div>
        </div>

        {/* Center: Module Navigation Tabs - Part of the top ribbon (no floating box!) */}
        <nav className="hidden md:flex items-center space-x-1 overflow-x-auto no-scrollbar flex-1 min-w-0 mx-2 lg:mx-4 h-full">
          {navItems.map((item) => {
            const isActive = activeModule === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                className={`h-9 px-2.5 lg:px-3 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-600/30'
                    : 'text-gray-400 hover:text-gray-100 hover:bg-gray-900/80'
                }`}
                title={item.desc}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : item.color}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Action Cluster: ALWAYS Pinned & Visible with Prominent Sign Out */}
        <div className="flex items-center space-x-2 shrink-0 z-30">
          {/* Currency Quick Toggle */}
          <button
            onClick={() => setCurrency(currency === 'INR' ? 'USD' : 'INR')}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold bg-gray-900 hover:bg-gray-800 border border-gray-800 transition-colors cursor-pointer shrink-0"
            title={`Active currency: ${currency}. Click to switch between INR (₹) and USD ($).`}
          >
            <span className={currency === 'INR' ? 'text-amber-400 font-bold' : 'text-gray-500'}>
              ₹
            </span>
            <span className="text-gray-600 font-mono">/</span>
            <span className={currency === 'USD' ? 'text-cyan-400 font-bold' : 'text-gray-500'}>
              $
            </span>
          </button>

          {/* Toggle Counselor Chat (Desktop / Laptop View) */}
          <button
            onClick={toggleChatCollapse}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer shrink-0 ${
              !isChatCollapsed
                ? 'bg-blue-600/20 text-blue-300 border-blue-500/40 shadow-sm'
                : 'bg-gray-900 text-gray-400 hover:text-white border-gray-800'
            }`}
            title={isChatCollapsed ? 'Open Aura Counselor AI' : 'Collapse Chat to Fullscreen Tool'}
          >
            <Sparkles className={`w-3.5 h-3.5 ${!isChatCollapsed ? 'text-amber-300 animate-pulse' : 'text-gray-400'}`} />
            <span className="hidden lg:inline">Counselor</span>
            <span className={`w-1.5 h-1.5 rounded-full ${!isChatCollapsed ? 'bg-emerald-400' : 'bg-gray-600'}`}></span>
          </button>

          {/* User Account Tag (Compact so it never eats screen width) */}
          {currentUser && (
            <div className="flex items-center space-x-1.5 text-xs bg-gray-900 px-2 sm:px-2.5 py-1.5 rounded-lg border border-gray-800 text-gray-200 shrink-0">
              <User className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="text-xs font-mono font-bold text-blue-400">
                {currentUser.username}
              </span>
            </div>
          )}

          {/* Prominent Red Sign Out Button: ALWAYS VISIBLE AND UNCLIPPED */}
          {currentUser && (
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-sm shadow-rose-950 transition-all cursor-pointer shrink-0"
              title="Sign Out / Switch Beta Tester Account"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span>Sign Out</span>
            </button>
          )}

          {/* Mobile Hamburger Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 hover:text-white transition-colors cursor-pointer shrink-0"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4 text-rose-400" /> : <Menu className="w-4 h-4 text-gray-300" />}
          </button>
        </div>
      </header>

      {/* ----------------- MOBILE SLIDE-OVER NAVIGATION DRAWER ----------------- */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-14 z-50 bg-gray-950/98 backdrop-blur-2xl p-4 flex flex-col justify-between overflow-y-auto animate-in fade-in duration-150">
          <div className="space-y-4">
            {/* User Details Header Card */}
            <div className="p-3.5 rounded-2xl bg-[#111726] border border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
                  {currentUser?.username?.slice(0, 2).toUpperCase() || 'AU'}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-white">{candidateName}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
                      {currentUser?.username}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 block mt-0.5">
                    {currentUser?.role_track || 'Beta Tester Workspace'}
                  </span>
                </div>
              </div>

              {/* Currency Button */}
              <button
                onClick={() => setCurrency(currency === 'INR' ? 'USD' : 'INR')}
                className="px-2.5 py-1.5 rounded-xl bg-gray-900 border border-gray-700 text-xs font-semibold text-amber-300"
              >
                {currency === 'INR' ? '₹ INR' : '$ USD'}
              </button>
            </div>

            {/* Quick Counselor Chat Toggle for Mobile */}
            <button
              onClick={() => {
                setChatCollapsed(false);
                setIsMobileMenuOpen(false);
              }}
              className="w-full p-3 rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-blue-900/40 border border-blue-500/40 text-blue-200 text-xs font-semibold flex items-center justify-between shadow-lg shadow-blue-950"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-600/30 flex items-center justify-center text-amber-300">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <div className="text-left">
                  <span className="block text-white font-bold text-xs">Open Aura Counselor AI</span>
                  <span className="block text-[11px] text-gray-400">Interactive voice & chat guidance</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-blue-400" />
            </button>

            {/* Modules List */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-gray-500 px-1 font-semibold">
                Workspace Modules
              </span>
              <div className="space-y-1">
                {navItems.map((item) => {
                  const isActive = activeModule === item.id;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleMobileNavClick(item.id)}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isActive
                          ? 'bg-blue-600/20 border-blue-500/50 text-white shadow-md'
                          : 'bg-gray-900/60 border-gray-800/80 text-gray-300 hover:bg-gray-900 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isActive ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.color}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-white">{item.label}</span>
                          </div>
                          <span className="text-[11px] text-gray-400 block mt-0.5">{item.desc}</span>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-gray-600'}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Actions: Big Red Sign Out */}
          <div className="pt-4 border-t border-gray-800 space-y-2 mt-4">
            <button
              onClick={() => {
                logout();
                setIsMobileMenuOpen(false);
              }}
              className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-white" />
              <span>Sign Out ({currentUser?.username})</span>
            </button>

            <div className="text-center">
              <span className="text-[10px] text-gray-500 font-mono">
                Aura AI Career OS · Multi-Tenant Isolated Session
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TopNavbar;
