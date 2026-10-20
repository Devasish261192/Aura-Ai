import React, { useState } from 'react';
import {
  Gamepad2,
  Calendar,
  CheckCircle2,
  Circle,
  Target,
  ArrowRight
} from 'lucide-react';
import { useAppStore, type AppModule } from '../../store/useAppStore';

const SPRINT_PHASES = [
  {
    phase: 1,
    title: 'Phase 1: Build Your Work Profile',
    days: 'Days 1 - 7',
    status: 'Completed',
    desc: 'Add your past jobs, daily tools, and 3 best work stories with Aura.',
    deliverables: ['Work history saved', 'Key skills added', 'Work stories written']
  },
  {
    phase: 2,
    title: 'Phase 2: Create Ready Resumes',
    days: 'Days 8 - 14',
    status: 'Active',
    desc: 'Pick your target job titles and generate clean Word and PDF resumes.',
    deliverables: ['Customized resume', 'Matched skills', 'Clean 1-page format']
  },
  {
    phase: 3,
    title: 'Phase 3: Search Jobs & Apply',
    days: 'Days 15 - 21',
    status: 'Upcoming',
    desc: 'Search fresh job openings across India and review company locations on Google Maps.',
    deliverables: ['Pan-India job search', 'Company location reviews', 'Direct applications']
  },
  {
    phase: 4,
    title: 'Phase 4: Interview Practice & Offer',
    days: 'Days 22 - 30',
    status: 'Upcoming',
    desc: 'Practice speaking your 4-part introduction and answering common interview questions.',
    deliverables: ['Confident intro pitch', 'Clear speaking pace', 'Interview ready']
  }
];

interface DailyTask {
  id: number;
  label: string;
  category: string;
  targetModule?: AppModule;
  done: boolean;
}

export const LevelUpTrackerView: React.FC = () => {
  const { setActiveModule } = useAppStore();
  const [activeViewMode, setActiveViewMode] = useState<'split' | 'routine' | 'roadmap'>('split');
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([
    {
      id: 1,
      label: 'Save 1 work story or accomplishment with Aura',
      category: 'Profile',
      targetModule: 'traits',
      done: true
    },
    {
      id: 2,
      label: 'Practice your 4-step job introduction',
      category: 'Practice',
      targetModule: 'trainer',
      done: false
    },
    {
      id: 3,
      label: 'Download your latest Word or PDF resume',
      category: 'Resume',
      targetModule: 'cvforge',
      done: false
    },
    {
      id: 4,
      label: 'Review 5 new jobs in Find Jobs',
      category: 'Jobs',
      targetModule: 'jobs',
      done: false
    }
  ]);

  const toggleTask = (id: number) => {
    setDailyTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const completedCount = dailyTasks.filter((t) => t.done).length;
  const progressPct = Math.round((completedCount / dailyTasks.length) * 100);

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-800 overflow-y-auto p-4 sm:p-6 space-y-5">
      {/* Sleek Top Banner: Progress + Streak + View Filter */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-6xl mx-auto w-full">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              My 30-Day Job Search Goals
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-xl">
            Daily checklist and step-by-step milestones to help you land your next job.
          </p>
        </div>

        {/* Progress & View Toggles */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveViewMode('split')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeViewMode === 'split' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Side by Side
            </button>
            <button
              onClick={() => setActiveViewMode('routine')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeViewMode === 'routine' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daily Checklist
            </button>
            <button
              onClick={() => setActiveViewMode('roadmap')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeViewMode === 'roadmap' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              30-Day Plan
            </button>
          </div>

          <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
            <div className="text-right">
              <span className="text-[10px] text-slate-500 font-medium block">Today's Progress</span>
              <span className="text-sm font-bold text-emerald-700">
                {completedCount}/{dailyTasks.length} Done
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 border-2 border-emerald-300 flex items-center justify-center font-bold text-xs text-emerald-700">
              {progressPct}%
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Stage */}
      <div
        className={`max-w-6xl mx-auto w-full grid gap-5 items-start ${
          activeViewMode === 'split' ? 'grid-cols-1 xl:grid-cols-12' : 'grid-cols-1'
        }`}
      >
        {/* Left Column: Today's Routine Checklist */}
        {(activeViewMode === 'split' || activeViewMode === 'routine') && (
          <div
            className={`p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 ${
              activeViewMode === 'split' ? 'xl:col-span-6' : 'w-full'
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Today's Tasks</h3>
              </div>
              <span className="text-[11px] text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200 font-medium">
                Phase 2
              </span>
            </div>

            <div className="space-y-2.5">
              {dailyTasks.map((t) => (
                <div
                  key={t.id}
                  className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                    t.done
                      ? 'bg-emerald-50/60 border-emerald-200 text-slate-700'
                      : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <button
                    onClick={() => toggleTask(t.id)}
                    className="flex items-start gap-3 flex-1 text-left cursor-pointer"
                  >
                    {t.done ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-0.5">
                      <span className={`text-xs block leading-relaxed ${t.done ? 'line-through text-slate-500' : 'text-slate-800 font-medium'}`}>
                        {t.label}
                      </span>
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-block font-medium">
                        {t.category}
                      </span>
                    </div>
                  </button>

                  {t.targetModule && (
                    <button
                      onClick={() => setActiveModule(t.targetModule!)}
                      className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 shrink-0 p-1 hover:bg-slate-100 rounded transition-colors"
                      title="Open page"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Right Column: 4-Phase Sprint Roadmap */}
        {(activeViewMode === 'split' || activeViewMode === 'roadmap') && (
          <div
            className={`p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 ${
              activeViewMode === 'split' ? 'xl:col-span-6' : 'w-full'
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">4-Step Journey</h3>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">30 Days</span>
            </div>

            <div className="space-y-3">
              {SPRINT_PHASES.map((p) => {
                const isActive = p.status === 'Active';
                const isCompleted = p.status === 'Completed';

                return (
                  <div
                    key={p.phase}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-blue-50/40 border-blue-300 shadow-sm'
                        : isCompleted
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{p.title}</span>
                        {isActive && (
                          <span className="text-[9px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.2 rounded border border-blue-200">
                            Current Step
                          </span>
                        )}
                        {isCompleted && (
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.2 rounded border border-emerald-200">
                            ✓ Done
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">{p.days}</span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed mb-2">{p.desc}</p>

                    <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-slate-200">
                      {p.deliverables.map((del, dIdx) => (
                        <span
                          key={dIdx}
                          className="text-[10px] text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 font-medium"
                        >
                          • {del}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
