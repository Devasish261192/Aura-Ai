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
    { id: 'landing', label: 'Tree', icon: GitFork },
    { id: 'traits', label: 'Vault', icon: Dna },
    { id: 'cvforge', label: 'CV Forge', icon: Layers },
    { id: 'jobs', label: 'Jobs', icon: Briefcase }
  ];

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-950 text-gray-100">
      {/* Top Application Navbar with Responsive Navigation & Pinned Sign Out */}
      <TopNavbar />

      {/* Main Unified Workspace Layout: Persistent Side Counselor + Right Tool Viewport */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Aura Counselor AI Chat: Overlay on mobile (<md), Side-by-Side on desktop/laptop (>=md) */}
        {!isChatCollapsed && (
          <aside
            style={{ width: isMobile ? '100%' : chatWidth }}
            className={`${
              isMobile
                ? 'fixed inset-0 top-14 pb-14 z-40 w-full h-[calc(100dvh-3.5rem)] bg-gray-950/98 backdrop-blur-xl flex flex-col'
                : 'h-full flex flex-col border-r border-gray-800 bg-gray-950 shrink-0 transition-all duration-200 z-10'
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
            className="absolute top-3 left-3 z-30 px-3 py-1.5 rounded-xl bg-blue-600/90 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 border border-blue-400/40 flex items-center gap-2 backdrop-blur-md transition-all group cursor-pointer"
            title="Expand Aura Counselor Chat"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>Aura Counselor</span>
            <ChevronRight className="w-3.5 h-3.5 text-blue-200 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}

        {/* Right Main Tool Viewport (with pb-14 on mobile to prevent bottom nav overlap) */}
        <section className="flex-1 h-full overflow-hidden flex flex-col pb-14 md:pb-0">
          {activeModule === 'landing' && <CareerTreeView />}
          {activeModule === 'traits' && <ArtifactsViewer />}
          {activeModule === 'cvforge' && <CVForgeView />}
          {activeModule === 'trainer' && <InterviewTrainerView />}
          {activeModule === 'interview' && <InterviewStudioView />}
          {activeModule === 'tracker' && <LevelUpTrackerView />}
          {activeModule === 'jobs' && (
            <div className="w-full h-full p-2 sm:p-4 overflow-hidden bg-gray-950 flex flex-col items-center justify-center">
              <div className="w-full max-w-4xl h-full flex flex-col">
                <JobSearchWidget className="h-full border border-gray-800" />
              </div>
            </div>
          )}
        </section>

        {/* Mobile Bottom Navigation Bar (md:hidden) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-gray-950/95 backdrop-blur-2xl border-t border-gray-800 flex items-center justify-around px-2 z-40">
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
                  isActive ? 'text-blue-400 font-bold' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-gray-400'}`} />
                <span className="text-[10px] mt-0.5">{item.label}</span>
              </button>
            );
          })}

          {/* Counselor Chat Toggle Button on Mobile Bottom Bar */}
          <button
            onClick={toggleChatCollapse}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-all cursor-pointer ${
              !isChatCollapsed ? 'text-amber-300 font-bold' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <div className="relative">
              <Sparkles
                className={`w-4 h-4 ${!isChatCollapsed ? 'text-amber-300 animate-pulse' : 'text-gray-400'}`}
              />
              <span
                className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
                  !isChatCollapsed ? 'bg-amber-400' : 'bg-emerald-500'
                }`}
              ></span>
            </div>
            <span className="text-[10px] mt-0.5">Counselor</span>
          </button>
        </nav>
      </main>
    </div>
  );
};

export default App;

