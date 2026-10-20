import React, { useState, useEffect } from 'react';
import {
  Database,
  FileText,
  CheckCircle2,
  RefreshCw,
  Cpu,
  Award,
  Code2,
  Briefcase,
  Lightbulb,
  Upload,
  ChevronDown,
  ChevronUp,
  Filter,
  ArrowRight,
  Edit3,
  UserCheck,
  X,
  Loader2
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { TimelineExtractorModal } from './TimelineExtractorModal';

export const ArtifactsViewer: React.FC = () => {
  const { artifacts, fetchArtifacts, activeProfileTab, setActiveModule, currentUser, updateTesterRole } = useAppStore();
  const [activeTab, setActiveTab] = useState<'timeline' | 'stories' | 'traits' | 'skills'>('timeline');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);

  // Quick Role Calibration Modal state
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [roleInput, setRoleInput] = useState('');
  const [companyInput, setCompanyInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [isSavingRole, setIsSavingRole] = useState(false);
  const [roleSaveSuccess, setRoleSaveSuccess] = useState(false);

  // Story accordion states
  const [expandedStoryIds, setExpandedStoryIds] = useState<Record<string, boolean>>({
    'story-01': true // default open first story
  });
  const [storyFilter, setStoryFilter] = useState<'all' | 'incident' | 'automation' | 'architecture' | 'ai'>('all');

  useEffect(() => {
    if (activeProfileTab && ['timeline', 'stories', 'traits', 'skills'].includes(activeProfileTab)) {
      setActiveTab(activeProfileTab as any);
      setShowRawJson(false);
    }
  }, [activeProfileTab]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchArtifacts();
    setTimeout(() => setIsRefreshing(false), 400);
  };

  const toggleStoryExpand = (id: string) => {
    setExpandedStoryIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAllStories = (expand: boolean) => {
    const newState: Record<string, boolean> = {};
    (artifacts?.career_story?.stories || []).forEach((s: any) => {
      newState[s.id] = expand;
    });
    setExpandedStoryIds(newState);
  };

  const stories = artifacts?.career_story?.stories || [];
  const traits = artifacts?.traits;
  const skillsMatrix = artifacts?.skills_matrix?.categories || {};
  const workHistory = artifacts?.profile_master?.work_history || [];
  const candidate = artifacts?.profile_master?.candidate;

  const openRoleModal = () => {
    setRoleInput(candidate?.headline || currentUser?.latest_role || '');
    setCompanyInput(workHistory?.[0]?.company || currentUser?.company || '');
    setNameInput(candidate?.name || currentUser?.name || '');
    setRoleSaveSuccess(false);
    setIsRoleModalOpen(true);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleInput.trim()) return;
    setIsSavingRole(true);
    const ok = await updateTesterRole(roleInput.trim(), companyInput.trim(), nameInput.trim());
    setIsSavingRole(false);
    if (ok) {
      setRoleSaveSuccess(true);
      setTimeout(() => {
        setIsRoleModalOpen(false);
        setRoleSaveSuccess(false);
      }, 1000);
    }
  };

  // Filtered stories
  const filteredStories = stories.filter((s: any) => {
    if (storyFilter === 'all') return true;
    const text = (s.title + ' ' + s.situation + ' ' + s.action).toLowerCase();
    if (storyFilter === 'incident') return text.includes('incident') || text.includes('outage') || text.includes('triage') || text.includes('rca');
    if (storyFilter === 'automation') return text.includes('routing') || text.includes('automated') || text.includes('report') || text.includes('workflow');
    if (storyFilter === 'architecture') return text.includes('sql') || text.includes('stored procedure') || text.includes('database') || text.includes('lock');
    if (storyFilter === 'ai') return text.includes('trading') || text.includes('agentic') || text.includes('counsellor') || text.includes('bot') || text.includes('stream');
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-slate-50 border-l border-slate-200 text-slate-800 overflow-hidden">
      {/* Sleek Single-Bar Header: Title + Subtabs + Refresh */}
      <div className="min-h-13 border-b border-slate-200 px-3 sm:px-5 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0 bg-white shadow-2xs">
        {/* Left: Profile Brand & Live State */}
        <div className="flex items-center space-x-2.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <Database className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-900 tracking-wide">
                My Profile
              </span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 font-medium">
                {stories.length} Stories · {workHistory.length} Jobs
              </span>
            </div>
          </div>
        </div>

        {/* Center: Consolidated 4 Main Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 space-x-1 overflow-x-auto no-scrollbar max-w-full shrink">
          <button
            onClick={() => {
              setActiveTab('timeline');
              setShowRawJson(false);
            }}
            className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'timeline' && !showRawJson
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-3 h-3" />
            <span>Work History</span>
            <span className="text-[10px] font-medium opacity-80">({workHistory.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('stories');
              setShowRawJson(false);
            }}
            className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'stories' && !showRawJson
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3 h-3" />
            <span>Work Stories</span>
            <span className="text-[10px] font-medium opacity-80">({stories.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('traits');
              setShowRawJson(false);
            }}
            className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'traits' && !showRawJson
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-3 h-3" />
            <span>Strengths</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('skills');
              setShowRawJson(false);
            }}
            className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'skills' && !showRawJson
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cpu className="w-3 h-3" />
            <span>Skills</span>
          </button>
        </div>

        {/* Right: Quick Actions & Refresh */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setShowRawJson((prev) => !prev)}
            className={`text-xs px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 ${
              showRawJson
                ? 'bg-purple-50 border-purple-300 text-purple-700'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
            title="Toggle Raw Details"
          >
            <Code2 className="w-3 h-3" />
            <span className="hidden sm:inline">Details</span>
          </button>

          <button
            onClick={handleRefresh}
            className="text-slate-600 hover:text-slate-900 p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Refresh Profile"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Content Viewport */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/60">
        {showRawJson ? (
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 font-mono text-xs overflow-x-auto text-emerald-400">
            <pre>{JSON.stringify(artifacts, null, 2)}</pre>
          </div>
        ) : (
          <>
            {/* TAB 1: TIMELINE & ROLES */}
            {activeTab === 'timeline' && (
              <div className="space-y-4 max-w-5xl mx-auto">
                {/* Profile Identity Card */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        Profile Overview
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {(candidate as any)?.experience_years ? `${(candidate as any).experience_years} Experience` : 'Experienced Professional'}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                      {candidate?.name || currentUser?.name || 'Your Profile'}
                    </h2>

                    <p className="text-xs text-blue-700 font-semibold">
                      {candidate?.headline || currentUser?.latest_role || 'Professional'}
                    </p>

                    {candidate?.experience_summary && (
                      <p className="text-xs text-slate-600 leading-relaxed pt-1 max-w-3xl">
                        {candidate.experience_summary}
                      </p>
                    )}
                  </div>

                  {/* Actions Right */}
                  <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 md:min-w-[180px]">
                    <button
                      onClick={openRoleModal}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit My Role & Info</span>
                    </button>

                    <button
                      onClick={() => setIsTimelineModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium flex items-center justify-center gap-1.5 border border-slate-300 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Upload className="w-3.5 h-3.5 text-blue-600" />
                      <span>Upload CV File</span>
                    </button>
                  </div>
                </div>

                {/* Chronological Work History & Milestones */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                      <span>My Work Experience ({workHistory.length})</span>
                    </h3>
                    <span className="text-[11px] text-slate-500">
                      Saved in your profile
                    </span>
                  </div>

                  {workHistory.length > 0 ? (
                    <div className="relative pl-6 space-y-3.5 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                      {workHistory.map((wh, idx) => {
                        const isGap = Boolean(
                          wh.is_gap_phase ||
                          (wh.company && wh.company.toLowerCase().includes('self-employed')) ||
                          (wh.role && wh.role.toLowerCase().includes('self-employed'))
                        );

                        return (
                          <div key={idx} className="relative group">
                            {/* Milestone Dot on vertical line */}
                            <div
                              className={`absolute -left-6 top-4 w-3 h-3 rounded-full border-2 ${
                                isGap
                                  ? 'bg-amber-400 border-amber-300 ring-4 ring-amber-100'
                                  : 'bg-blue-600 border-blue-400 ring-4 ring-blue-100'
                              }`}
                            ></div>

                            {/* Milestone Card */}
                            <div
                              className={`p-4 rounded-xl border transition-all ${
                                isGap
                                  ? 'bg-amber-50/50 border-amber-300 shadow-2xs'
                                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="text-sm font-bold text-slate-900">{wh.role}</h4>
                                  {isGap ? (
                                    <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-medium">
                                      Independent Work / Career Transition
                                    </span>
                                  ) : (
                                    <span className="text-xs font-semibold text-blue-700">
                                      at {wh.company}
                                    </span>
                                  )}
                                </div>

                                <span className="text-[11px] text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200 self-start sm:self-auto font-medium">
                                  {wh.period || 'Recent'}
                                </span>
                              </div>

                              {wh.summary && (
                                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                                  {wh.summary}
                                </p>
                              )}

                              {wh.responsibilities && wh.responsibilities.length > 0 && (
                                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                                  <span className="text-[11px] font-semibold text-slate-500 block">
                                    Main Responsibilities:
                                  </span>
                                  <ul className="space-y-1 text-xs text-slate-600 pl-4 list-disc marker:text-blue-600">
                                    {wh.responsibilities.map((r, rIdx) => (
                                      <li key={rIdx}>{r}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 rounded-2xl bg-white border border-dashed border-slate-300 text-center space-y-2 shadow-xs">
                      <Briefcase className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-xs font-medium text-slate-600">No jobs recorded yet</p>
                      <button
                        onClick={() => setIsTimelineModalOpen(true)}
                        className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 mt-2 cursor-pointer shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload CV File</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: STORY VAULT */}
            {activeTab === 'stories' && (
              <div className="space-y-4 max-w-5xl mx-auto">
                {/* Story Controls Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                    {[
                      { id: 'all', label: `All Stories (${stories.length})` },
                      { id: 'incident', label: 'Problem Solving' },
                      { id: 'architecture', label: 'Tools & Systems' },
                      { id: 'automation', label: 'Process & Efficiency' },
                      { id: 'ai', label: 'Projects & Innovation' }
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setStoryFilter(f.id as any)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                          storyFilter === f.id
                            ? 'bg-blue-600 text-white font-semibold shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {/* Expand / Collapse All */}
                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <button
                      onClick={() => toggleAllStories(true)}
                      className="text-[11px] text-slate-600 hover:text-slate-900 px-2 py-1 rounded hover:bg-slate-100 cursor-pointer"
                    >
                      Expand All
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      onClick={() => toggleAllStories(false)}
                      className="text-[11px] text-slate-600 hover:text-slate-900 px-2 py-1 rounded hover:bg-slate-100 cursor-pointer"
                    >
                      Collapse All
                    </button>
                  </div>
                </div>

                {/* Filtered Stories List */}
                <div className="space-y-3">
                  {filteredStories.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-white border border-dashed border-slate-300 text-center space-y-2 shadow-xs">
                      <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-xs text-slate-600 font-medium">No work stories in this filter yet</p>
                      <p className="text-[11px] text-slate-500">Tell Aura in the chat: "I want to share a work win" to add one!</p>
                    </div>
                  ) : (
                    filteredStories.map((s: any) => {
                      const isExpanded = Boolean(expandedStoryIds[s.id]);

                      return (
                        <div
                          key={s.id}
                          className="rounded-xl border border-slate-200 bg-white hover:border-slate-300 shadow-xs transition-all"
                        >
                          {/* Story Accordion Header */}
                          <div
                            onClick={() => toggleStoryExpand(s.id)}
                            className="p-3.5 flex items-start justify-between gap-3 cursor-pointer select-none"
                          >
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                                  {s.id.toUpperCase()}
                                </span>
                                <h4 className="text-sm font-bold text-slate-900 leading-snug">{s.title}</h4>
                              </div>
                              <p className="text-xs text-slate-500">
                                {s.company} · {s.role} ({s.period || 'Recent'})
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 pt-0.5">
                              {/* Quick Metrics preview */}
                              {s.metrics && s.metrics.length > 0 && (
                                <span className="hidden sm:inline-block text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                                  {s.metrics[0]}
                                </span>
                              )}
                              <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </div>
                            </div>
                          </div>

                          {/* Expanded Story Content */}
                          {isExpanded && (
                            <div className="px-3.5 pb-4 space-y-3 border-t border-slate-100 pt-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                                  <strong className="text-amber-800 font-semibold block">1. The Problem / Situation:</strong>
                                  <span className="text-slate-700 leading-relaxed">{s.situation}</span>
                                </div>

                                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                                  <strong className="text-blue-800 font-semibold block">2. Plan & Goal:</strong>
                                  <span className="text-slate-700 leading-relaxed">{s.task}</span>
                                </div>

                                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                                  <strong className="text-emerald-800 font-semibold block">3. What You Did:</strong>
                                  <span className="text-slate-700 leading-relaxed">{s.action}</span>
                                </div>

                                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                                  <strong className="text-purple-800 font-semibold block">4. The Good Result:</strong>
                                  <span className="text-slate-700 leading-relaxed">{s.result}</span>
                                </div>
                              </div>

                              {/* Point 5: Learnings */}
                              {s.learnings && s.learnings.length > 0 && (
                                <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 space-y-1">
                                  <div className="flex items-center gap-1.5 text-amber-900 font-semibold text-xs">
                                    <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                    <span>5. Key Learnings & Takeaways:</span>
                                  </div>
                                  <ul className="space-y-0.5 pl-4 list-disc marker:text-amber-600 text-xs text-slate-700">
                                    {s.learnings.map((lrn: string, lIdx: number) => (
                                      <li key={lIdx}>{lrn}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* All Metrics Badges */}
                              {s.metrics && s.metrics.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  {s.metrics.map((m: string, idx: number) => (
                                    <span
                                      key={idx}
                                      className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1 font-medium"
                                    >
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {m}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: ARCHETYPES & TRAITS */}
            {activeTab === 'traits' && (
              <div className="space-y-4 max-w-5xl mx-auto">
                {/* Target Role Match Cards Grid */}
                {traits?.target_profiles && traits.target_profiles.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Recommended Career Directions & Match Scores
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {traits.target_profiles.map((tp) => (
                        <div
                          key={tp.id}
                          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-300 transition-all space-y-2.5 shadow-xs"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-slate-900">{tp.title}</h4>
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {tp.match_score}% Match
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">{tp.core_pitch}</p>
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                            <span className="text-slate-400">Track: {tp.id}</span>
                            <button
                              onClick={() => setActiveModule('cvforge')}
                              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <span>Open in Resume Builder</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl bg-white border border-dashed border-slate-300 text-center space-y-2 shadow-xs">
                    <Award className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs font-semibold text-slate-700">Career directions will appear as you chat with Aura</p>
                    <p className="text-[11px] text-slate-500">Share your jobs and skills to see matching career paths!</p>
                  </div>
                )}

                {/* Core Competencies & Evaluated Traits */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Competencies */}
                  {traits?.core_competencies && traits.core_competencies.length > 0 && (
                    <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 shadow-xs">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Core Competencies & Strengths
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {traits.core_competencies.map((cc, i) => (
                          <span
                            key={i}
                            className="text-xs bg-slate-50 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg font-medium"
                          >
                            {cc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Personality Traits */}
                  {traits?.personality_traits && traits.personality_traits.length > 0 && (
                    <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 shadow-xs">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Workplace Style & Mindset
                      </h4>
                      <div className="space-y-1.5 text-xs text-slate-700">
                        {traits.personality_traits.map((pt, i) => (
                          <div key={i} className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                            {pt}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: SKILLS MATRIX */}
            {activeTab === 'skills' && (
              <div className="space-y-4 max-w-5xl mx-auto">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    My Registered Skills
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Saved in your profile
                  </span>
                </div>

                {Object.keys(skillsMatrix).length === 0 || Object.values(skillsMatrix).every((arr: any) => arr.length === 0) ? (
                  <div className="p-8 rounded-2xl bg-white border border-dashed border-slate-300 text-center space-y-2 shadow-xs">
                    <Cpu className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs text-slate-600 font-medium">No skills added yet</p>
                    <p className="text-[11px] text-slate-500">Tell Aura in the chat what tools and apps you use daily!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(skillsMatrix).map(([catKey, skills]: [string, any]) => (
                      <div key={catKey} className="p-4 rounded-xl bg-white border border-slate-200 space-y-2.5 shadow-xs">
                        <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider border-b border-slate-100 pb-1.5">
                          {catKey.replace(/_/g, ' ')}
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {skills.map((sk: any, idx: number) => (
                            <span
                              key={idx}
                              className="text-xs bg-slate-50 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg flex items-center gap-1.5"
                            >
                              <span className="font-medium">{sk.name}</span>
                              <span className="text-[10px] text-slate-400">({sk.level})</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Career Timeline & Gap Phase Extraction Modal */}
      <TimelineExtractorModal
        isOpen={isTimelineModalOpen}
        onClose={() => setIsTimelineModalOpen(false)}
      />

      {/* Role Calibration & Assignment Modal */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsRoleModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Calibrate Role & Assignment</h3>
                <p className="text-[11px] text-gray-400">
                  Account: <span className="font-mono text-indigo-400 font-bold">{currentUser?.username}</span>
                </p>
              </div>
            </div>

            {roleSaveSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-center space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                <p className="text-xs font-bold">Role Updated Successfully!</p>
                <p className="text-[11px] text-emerald-400/80">Account is now ASSIGNED and synchronized across the platform.</p>
              </div>
            ) : (
              <form onSubmit={handleSaveRole} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Job Title / Professional Role <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Workforce Management Lead, HR Specialist, Cloud Architect"
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Organization / Company
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Concentrix, TCS, Deloitte, Freelance"
                    value={companyInput}
                    onChange={(e) => setCompanyInput(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Candidate Full Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-gray-600"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsRoleModalOpen(false)}
                    className="px-3.5 py-1.5 rounded-xl bg-gray-800 text-gray-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingRole || !roleInput.trim()}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-indigo-950 flex items-center gap-1.5 cursor-pointer"
                  >
                    {isSavingRole ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Save & Assign Account</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
