import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ChevronRight,
  GitFork,
  Dna,
  Layers,
  Briefcase
} from 'lucide-react';
import { TopNavbar } from './components/Layout/TopNavbar';
import { ChatInterface } from './components/Chat/ChatInterface';
import { ArtifactsViewer } from './components/Artifacts/ArtifactsViewer';
import { CVForgeView } from './components/CVForge/CVForgeView';
import { InterviewTrainerView } from './components/Trainer/InterviewTrainerView';
import { InterviewStudioView } from './components/Studio/InterviewStudioView';
import { LevelUpTrackerView } from './components/Tracker/LevelUpTrackerView';
import { JobSearchWidget } from './components/Jobs/JobSearchWidget';
import { LandingPage } from './components/Landing/LandingPage';
import { CareerTreeView } from './components/CareerTree/CareerTreeView';
import { useAppStore, type AppModule } from './store/useAppStore';

export const App: React.FC = () => {
  const {
    currentUser,
    activeModule,
    setActiveModule,
    fetchArtifacts,
    fetchChatHistory,
    isChatCollapsed,
    setChatCollapsed,
    toggleChatCollapse
  } = useAppStore();
  const [chatWidth, setChatWidth] = useState<'380px' | '50%'>('380px');
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchArtifacts();
      fetchChatHistory();
    }
  }, [currentUser, fetchArtifacts, fetchChatHistory]);

  if (!currentUser) {
    return <LandingPage />;
  }

  const mobileNavItems: Array<{
    id: AppModule;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: 'landing', label: 'Career Path', icon: GitFork },
    { id: 'traits', label: 'My Profile', icon: Dna },
    { id: 'cvforge', label: 'Resume', icon: Layers },
    { id: 'jobs', label: 'Find Jobs', icon: Briefcase }
  ];

  const guidedSteps = [
    { num: 1, title: 'Your Job & Background', targetModule: 'traits' as AppModule },
    { num: 2, title: 'Skills & Tools', targetModule: 'traits' as AppModule },
    { num: 3, title: 'Best Work Stories', targetModule: 'traits' as AppModule },
    { num: 4, title: 'Career Path', targetModule: 'landing' as AppModule },
    { num: 5, title: 'Ready Resume', targetModule: 'cvforge' as AppModule },
    { num: 6, title: 'Find Jobs & Maps', targetModule: 'jobs' as AppModule },
  ];

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* Top Application Navbar with Responsive Navigation & Pinned Sign Out */}
      <TopNavbar />

      {/* Clean Step-by-Step Guided Action Journey (Fixed Series of Actions) */}
      <div className="hidden lg:flex items-center justify-between px-4 py-1.5 bg-white border-b border-slate-200 text-xs shrink-0 shadow-2xs">
        <div className="flex items-center gap-1.5 font-medium text-slate-600">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span className="font-semibold text-slate-800">Your Guided Steps:</span>
        </div>
        <div className="flex items-center gap-1.5">
          {guidedSteps.map((s, idx) => (
            <React.Fragment key={s.num}>
              <button
                onClick={() => setActiveModule(s.targetModule)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                  activeModule === s.targetModule
                    ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                }`}
                title={`Go to Step ${s.num}: ${s.title}`}
              >
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">
                  {s.num}
                </span>
                <span className="text-[11px]">{s.title}</span>
              </button>
              {idx < guidedSteps.length - 1 && <span className="text-slate-300 font-bold">›</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main Unified Workspace Layout: Persistent Side Counselor + Right Tool Viewport */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Aura Counselor AI Chat: Overlay on mobile (<md), Side-by-Side on desktop/laptop (>=md) */}
        {!isChatCollapsed && (
          <aside
            style={{ width: isMobile ? '100%' : chatWidth }}
            className={`${
              isMobile
                ? 'fixed inset-0 top-14 pb-14 z-40 w-full h-[calc(100dvh-3.5rem)] bg-white/98 backdrop-blur-xl flex flex-col'
                : 'h-full flex flex-col border-r border-slate-200 bg-white shrink-0 transition-all duration-200 z-10 shadow-sm'
            }`}
          >
            <ChatInterface
              onCollapse={() => setChatCollapsed(true)}
              onToggleWidth={() => setChatWidth((prev) => (prev === '380px' ? '50%' : '380px'))}
              isHalfWidth={chatWidth === '50%'}
              activeModule={activeModule}
            />
          </aside>
        )}

        {/* Floating Expand Pill (Desktop/Laptop only, when Counselor sidebar is collapsed) */}
        {isChatCollapsed && !isMobile && (
          <button
            onClick={() => setChatCollapsed(false)}
            className="absolute top-3 left-3 z-30 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 border border-blue-500 flex items-center gap-2 transition-all group cursor-pointer"
            title="Open Career Coach Chat"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>Career Coach</span>
            <ChevronRight className="w-3.5 h-3.5 text-blue-200 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}

        {/* Right Main Tool Viewport (with pb-14 on mobile to prevent bottom nav overlap) */}
        <section className="flex-1 h-full overflow-hidden flex flex-col pb-14 md:pb-0 bg-slate-50">
          {activeModule === 'landing' && <CareerTreeView />}
          {activeModule === 'traits' && <ArtifactsViewer />}
          {activeModule === 'cvforge' && <CVForgeView />}
          {activeModule === 'trainer' && <InterviewTrainerView />}
          {activeModule === 'interview' && <InterviewStudioView />}
          {activeModule === 'tracker' && <LevelUpTrackerView />}
          {activeModule === 'jobs' && (
            <div className="w-full h-full p-2 sm:p-4 overflow-hidden bg-slate-50 flex flex-col items-center justify-center">
              <div className="w-full max-w-4xl h-full flex flex-col">
                <JobSearchWidget className="h-full border border-slate-200 bg-white" />
              </div>
            </div>
          )}
        </section>

        {/* Mobile Bottom Navigation Bar (md:hidden) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-center justify-around px-2 z-40 shadow-xs">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id && isChatCollapsed;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveModule(item.id);
                  setChatCollapsed(true);
                }}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-all cursor-pointer ${
                  isActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className="text-[10px] mt-0.5">{item.label}</span>
              </button>
            );
          })}

          {/* Counselor Chat Toggle Button on Mobile Bottom Bar */}
          <button
            onClick={toggleChatCollapse}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-all cursor-pointer ${
              !isChatCollapsed ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="relative">
              <Sparkles
                className={`w-4 h-4 ${!isChatCollapsed ? 'text-blue-600 animate-pulse' : 'text-slate-400'}`}
              />
              <span
                className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
                  !isChatCollapsed ? 'bg-blue-600' : 'bg-emerald-500'
                }`}
              ></span>
            </div>
            <span className="text-[10px] mt-0.5">Coach Chat</span>
          </button>
        </nav>
      </main>
    </div>
  );
};

export default App;

