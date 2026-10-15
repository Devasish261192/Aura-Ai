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
    title: 'Phase 1: Foundation & Vault Calibration',
    days: 'Days 1 - 7',
    status: 'Completed',
    desc: 'Extract deep STARR stories, calibrate core technical competencies, and audit historical enterprise projects.',
    deliverables: ['10 Canonical STARR Stories', 'Calibrated Career Archetypes', 'Chronological Timeline Verified']
  },
  {
    phase: 2,
    title: 'Phase 2: Resume Tailoring & Multi-Track Assets',
    days: 'Days 8 - 14',
    status: 'Active',
    desc: 'Configure 4 distinct role resumes in CV Forge, generate ATS-tested Word & Vector PDF assets.',
    deliverables: ['4 Tailored Role CVs', 'ATS Keyword Synchronization', 'Gap Phase Proof-of-Work Framed']
  },
  {
    phase: 3,
    title: 'Phase 3: Targeted Outreach & Direct Referrals',
    days: 'Days 15 - 21',
    status: 'Upcoming',
    desc: 'Engage hiring managers on LinkedIn, activate alumni referrals, and track application milestones.',
    deliverables: ['15 Direct Outreach Messages', 'Active Telegram Channel Job Radar', 'Referral Pipeline Tracking']
  },
  {
    phase: 4,
    title: 'Phase 4: Video Interview Simulations & Closing',
    days: 'Days 22 - 30',
    status: 'Upcoming',
    desc: 'Complete 90-second video introductions, practice high-stress incident deep-dives, and negotiate offers.',
    deliverables: ['90s CEO Video Pitch Mastered', 'Audio & Speech Cadence Telemetry (135 WPM)', 'Offer Negotiation Prepared']
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
      label: 'Capture & verify 1 high-impact STARR incident story in Career Vault',
      category: 'Vault',
      targetModule: 'traits',
      done: true
    },
    {
      id: 2,
      label: 'Record & review 1 phase of the 90-second Introduction Video Trainer',
      category: 'Trainer',
      targetModule: 'trainer',
      done: true
    },
    {
      id: 3,
      label: 'Run 1 Technical Architecture Drill (SQL lock resolution or Kafka streaming)',
      category: 'Studio',
      targetModule: 'interview',
      done: false
    },
    {
      id: 4,
      label: 'Export & inspect tailored CV Forge resume for target Tech BA track',
      category: 'CV Forge',
      targetModule: 'cvforge',
      done: true
    },
    {
      id: 5,
      label: 'Submit 3 customized enterprise applications under active referral pipeline',
      category: 'Outreach',
      targetModule: 'jobs',
      done: false
    }
  ]);

  const toggleTask = (id: number) => {
    setDailyTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const completedCount = dailyTasks.filter((t) => t.done).length;
  const progressPct = Math.round((completedCount / dailyTasks.length) * 100);

  return (
    <div className="flex flex-col h-full bg-gray-950 text-gray-100 overflow-y-auto p-5 sm:p-6 space-y-5">
      {/* Sleek Top Banner: Progress + Streak + View Filter */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-gray-900 via-gray-900/90 to-amber-950/20 border border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-6xl mx-auto w-full">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Gamepad2 className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">
              30-Day Level-Up OS & Career Acceleration Engine
            </h2>
          </div>
          <p className="text-xs text-gray-400 max-w-xl">
            Disciplined daily execution framework driving vault expansion, interview readiness, and placement.
          </p>
        </div>

        {/* Progress & View Toggles */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-2 bg-gray-950/80 p-1 rounded-xl border border-gray-800">
            <button
              onClick={() => setActiveViewMode('split')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                activeViewMode === 'split' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-gray-400 hover:text-white'
              }`}
            >
              Split View
            </button>
            <button
              onClick={() => setActiveViewMode('routine')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                activeViewMode === 'routine' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-gray-400 hover:text-white'
              }`}
            >
              Daily Routine
            </button>
            <button
              onClick={() => setActiveViewMode('roadmap')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                activeViewMode === 'roadmap' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-gray-400 hover:text-white'
              }`}
            >
              30-Day Roadmap
            </button>
          </div>

          <div className="flex items-center gap-3 pl-2 border-l border-gray-800">
            <div className="text-right">
              <span className="text-[10px] text-gray-400 font-mono block">Daily Score</span>
              <span className="text-sm font-bold font-mono text-emerald-400">
                {completedCount}/{dailyTasks.length} Done
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center font-bold text-xs text-emerald-400 font-mono">
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
            className={`p-5 rounded-2xl bg-gray-900 border border-gray-800 space-y-4 ${
              activeViewMode === 'split' ? 'xl:col-span-6' : 'w-full'
            }`}
          >
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Today's Operating Routine (Day 11 of 30)</h3>
              </div>
              <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                Phase 2 Active
              </span>
            </div>

            <div className="space-y-2.5">
              {dailyTasks.map((t) => (
                <div
                  key={t.id}
                  className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                    t.done
                      ? 'bg-emerald-950/15 border-emerald-500/30 text-gray-200'
                      : 'bg-gray-950/70 border-gray-800 text-gray-300 hover:border-gray-700'
                  }`}
                >
                  <button
                    onClick={() => toggleTask(t.id)}
                    className="flex items-start gap-3 flex-1 text-left cursor-pointer"
                  >
                    {t.done ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-600 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-0.5">
                      <span className={`text-xs block leading-relaxed ${t.done ? 'line-through text-gray-400' : 'text-gray-200 font-medium'}`}>
                        {t.label}
                      </span>
                      <span className="text-[10px] font-mono text-gray-500 bg-gray-900 px-1.5 py-0.2 rounded border border-gray-800 inline-block">
                        {t.category}
                      </span>
                    </div>
                  </button>

                  {t.targetModule && (
                    <button
                      onClick={() => setActiveModule(t.targetModule!)}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 shrink-0 p-1 hover:bg-gray-800 rounded transition-colors"
                      title="Launch related tool"
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
            className={`p-5 rounded-2xl bg-gray-900 border border-gray-800 space-y-4 ${
              activeViewMode === 'split' ? 'xl:col-span-6' : 'w-full'
            }`}
          >
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">30-Day Sprint Roadmap & Milestones</h3>
              </div>
              <span className="text-[11px] font-mono text-gray-400">4 Phases (30 Days)</span>
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
                        ? 'bg-amber-950/20 border-amber-500/40 shadow-sm shadow-amber-950/40'
                        : isCompleted
                        ? 'bg-emerald-950/10 border-emerald-500/20 opacity-80'
                        : 'bg-gray-950/60 border-gray-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{p.title}</span>
                        {isActive && (
                          <span className="text-[9px] bg-amber-400/20 text-amber-300 font-mono px-1.5 py-0.2 rounded border border-amber-400/30">
                            Current Sprint
                          </span>
                        )}
                        {isCompleted && (
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-mono px-1.5 py-0.2 rounded border border-emerald-500/30">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-gray-400">{p.days}</span>
                    </div>

                    <p className="text-xs text-gray-400 leading-relaxed mb-2">{p.desc}</p>

                    <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-gray-800/60">
                      {p.deliverables.map((del, dIdx) => (
                        <span
                          key={dIdx}
                          className="text-[10px] font-mono text-gray-300 bg-gray-900 px-2 py-0.5 rounded border border-gray-800"
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
