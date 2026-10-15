import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronRight } from 'lucide-react';
import { TopNavbar } from './components/Layout/TopNavbar';
import { ChatInterface } from './components/Chat/ChatInterface';
import { ArtifactsViewer } from './components/Artifacts/ArtifactsViewer';
import { CVForgeView } from './components/CVForge/CVForgeView';
import { InterviewTrainerView } from './components/Trainer/InterviewTrainerView';
import { InterviewStudioView } from './components/Studio/InterviewStudioView';
import { LevelUpTrackerView } from './components/Tracker/LevelUpTrackerView';
import { JobSearchWidget } from './components/Jobs/JobSearchWidget';
import { useAppStore } from './store/useAppStore';

export const App: React.FC = () => {
  const { activeModule, fetchArtifacts, fetchChatHistory, isChatCollapsed, setChatCollapsed } = useAppStore();
  const [chatWidth, setChatWidth] = useState<'380px' | '50%'>('380px');

  useEffect(() => {
    fetchArtifacts();
    fetchChatHistory();
  }, [fetchArtifacts, fetchChatHistory]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-950 text-gray-100">
      {/* Top Application Navbar with Version 0 Modules */}
      <TopNavbar />

      {/* Main Unified Workspace Layout: Persistent Side Counselor + Right Tool Viewport */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Persistent Aura Counselor AI Chat Sidebar (Available across ALL tools) */}
        {!isChatCollapsed && (
          <aside
            style={{ width: chatWidth }}
            className="h-full flex flex-col border-r border-gray-800 bg-gray-950 shrink-0 transition-all duration-200 z-10"
          >
            <ChatInterface
              onCollapse={() => setChatCollapsed(true)}
              onToggleWidth={() => setChatWidth((prev) => (prev === '380px' ? '50%' : '380px'))}
              isHalfWidth={chatWidth === '50%'}
              activeModule={activeModule}
            />
          </aside>
        )}

        {/* Floating Expand Pill (Appears when Counselor sidebar is collapsed) */}
        {isChatCollapsed && (
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

        {/* Right Main Tool Viewport */}
        <section className="flex-1 h-full overflow-hidden flex flex-col">
          {activeModule === 'traits' && <ArtifactsViewer />}
          {activeModule === 'cvforge' && <CVForgeView />}
          {activeModule === 'trainer' && <InterviewTrainerView />}
          {activeModule === 'interview' && <InterviewStudioView />}
          {activeModule === 'tracker' && <LevelUpTrackerView />}
          {activeModule === 'jobs' && (
            <div className="w-full h-full p-4 overflow-hidden bg-gray-950 flex flex-col items-center justify-center">
              <div className="w-full max-w-4xl h-full flex flex-col">
                <JobSearchWidget className="h-full border border-gray-800" />
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default App;
