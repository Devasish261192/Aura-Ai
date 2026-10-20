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
      label: 'Career Path',
      icon: GitFork,
      color: 'text-blue-600',
      desc: 'See your career growth options'
    },
    {
      id: 'traits',
      label: 'My Profile',
      icon: Dna,
      color: 'text-emerald-600',
      desc: 'Your jobs, skills, and work wins'
    },
    {
      id: 'cvforge',
      label: 'Resume Builder',
      icon: Layers,
      color: 'text-indigo-600',
      desc: 'Create clean, ready-to-use resumes'
    },
    {
      id: 'jobs',
      label: 'Find Jobs',
      icon: Briefcase,
      color: 'text-sky-600',
      desc: 'Search jobs and view company locations'
    },
    {
      id: 'trainer',
      label: 'Practice Questions',
      icon: GraduationCap,
      color: 'text-violet-600',
      desc: 'Practice common interview questions'
    },
    {
      id: 'interview',
      label: 'Pitch Studio',
      icon: Video,
      color: 'text-purple-600',
      desc: 'Practice speaking your introduction'
    },
    {
      id: 'tracker',
      label: 'My Goals',
      icon: Gamepad2,
      color: 'text-amber-600',
      desc: 'Daily checklist and next steps'
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
      <header className="h-14 border-b border-slate-200 bg-white px-3 sm:px-4 flex items-center justify-between z-20 shrink-0 w-full overflow-hidden shadow-xs">
        {/* Left: Brand */}
        <div className="flex items-center space-x-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm shadow-blue-500/20 shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-center space-x-1.5 leading-none">
            <span className="font-bold text-sm text-slate-900 tracking-tight">Aura Career</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-medium border border-blue-200">
              Personal Coach
            </span>
          </div>
        </div>

        {/* Center: Module Navigation Tabs */}
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
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title={item.desc}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : item.color}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Action Cluster */}
        <div className="flex items-center space-x-2 shrink-0 z-30">
          {/* Currency Quick Toggle */}
          <button
            onClick={() => setCurrency(currency === 'INR' ? 'USD' : 'INR')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition-colors cursor-pointer shrink-0"
            title={`Active currency: ${currency}. Click to switch between INR (₹) and USD ($).`}
          >
            <span className={currency === 'INR' ? 'text-amber-700 font-bold' : 'text-slate-400'}>
              ₹
            </span>
            <span className="text-slate-400 font-mono">/</span>
            <span className={currency === 'USD' ? 'text-blue-700 font-bold' : 'text-slate-400'}>
              $
            </span>
          </button>

          {/* Toggle Counselor Chat (Desktop / Laptop View) */}
          <button
            onClick={toggleChatCollapse}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer shrink-0 ${
              !isChatCollapsed
                ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border-slate-200'
            }`}
            title={isChatCollapsed ? 'Open Aura Career Coach' : 'Collapse Chat to View Full Page'}
          >
            <Sparkles className={`w-3.5 h-3.5 ${!isChatCollapsed ? 'text-amber-500 animate-pulse' : 'text-slate-500'}`} />
            <span className="hidden lg:inline">Coach Chat</span>
            <span className={`w-1.5 h-1.5 rounded-full ${!isChatCollapsed ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
          </button>

          {/* User Account Tag */}
          {currentUser && (
            <div className="flex items-center space-x-1.5 text-xs bg-slate-100 px-2 sm:px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 shrink-0">
              <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="text-xs font-bold text-slate-800">
                {currentUser.username}
              </span>
            </div>
          )}

          {/* Sign Out Button */}
          {currentUser && (
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-xs transition-all cursor-pointer shrink-0"
              title="Sign Out / Switch Profile"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span>Sign Out</span>
            </button>
          )}

          {/* Mobile Hamburger Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition-colors cursor-pointer shrink-0"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4 text-rose-600" /> : <Menu className="w-4 h-4 text-slate-700" />}
          </button>
        </div>
      </header>

      {/* ----------------- MOBILE SLIDE-OVER NAVIGATION DRAWER ----------------- */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-14 z-50 bg-white p-4 flex flex-col justify-between overflow-y-auto animate-in fade-in duration-150 border-t border-slate-200">
          <div className="space-y-4">
            {/* User Details Header Card */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold">
                  {currentUser?.username?.slice(0, 2).toUpperCase() || 'AU'}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-slate-900">{candidateName}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                      {currentUser?.username}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 block mt-0.5">
                    {currentUser?.role_track || 'Professional Profile'}
                  </span>
                </div>
              </div>

              {/* Currency Button */}
              <button
                onClick={() => setCurrency(currency === 'INR' ? 'USD' : 'INR')}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-800 shadow-xs"
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
              className="w-full p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold flex items-center justify-between shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <div className="text-left">
                  <span className="block text-slate-900 font-bold text-xs">Open Aura Career Coach</span>
                  <span className="block text-[11px] text-slate-500">Friendly chat & voice help</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-blue-600" />
            </button>

            {/* Modules List */}
            <div className="space-y-1.5">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 px-1 font-semibold">
                Main Features
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
                          ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.color}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">{item.label}</span>
                          </div>
                          <span className="text-[11px] text-slate-500 block mt-0.5">{item.desc}</span>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Actions: Sign Out */}
          <div className="pt-4 border-t border-slate-200 space-y-2 mt-4">
            <button
              onClick={() => {
                logout();
                setIsMobileMenuOpen(false);
              }}
              className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-white" />
              <span>Sign Out ({currentUser?.username})</span>
            </button>

            <div className="text-center">
              <span className="text-[10px] text-slate-400">
                Aura Career Coach · Simple, Easy & Safe
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TopNavbar;
