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
  Calendar,
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
    <div className="flex flex-col h-full bg-gray-950 border-l border-gray-800 text-gray-100 overflow-hidden">
      {/* Sleek Single-Bar Header: Title + Subtabs + Refresh */}
      <div className="min-h-13 border-b border-gray-800 px-3 sm:px-5 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0 bg-gray-900/80 backdrop-blur-md">
        {/* Left: Vault Brand & Live State */}
        <div className="flex items-center space-x-2.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Database className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-white tracking-wide">
                Career Vault
              </span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.2 rounded-full border border-emerald-500/20 font-mono">
                {stories.length} Stories · {workHistory.length} Roles
              </span>
            </div>
          </div>
        </div>

        {/* Center: Consolidated 4 Main Tabs (Scrollable on small/laptop screens) */}
        <div className="flex items-center bg-gray-950/80 p-1 rounded-xl border border-gray-800/80 space-x-1 overflow-x-auto no-scrollbar max-w-full shrink">
          <button
            onClick={() => {
              setActiveTab('timeline');
              setShowRawJson(false);
            }}
            className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'timeline' && !showRawJson
                ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-900'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Briefcase className="w-3 h-3" />
            <span>Timeline</span>
            <span className="text-[10px] font-mono opacity-80">({workHistory.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('stories');
              setShowRawJson(false);
            }}
            className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'stories' && !showRawJson
                ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-900'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <FileText className="w-3 h-3" />
            <span>Story Vault</span>
            <span className="text-[10px] font-mono opacity-80">({stories.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('traits');
              setShowRawJson(false);
            }}
            className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'traits' && !showRawJson
                ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-900'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Award className="w-3 h-3" />
            <span>Traits</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('skills');
              setShowRawJson(false);
            }}
            className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'skills' && !showRawJson
                ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-900'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Cpu className="w-3 h-3" />
            <span>Skills Matrix</span>
          </button>
        </div>

        {/* Right: Quick Actions & JSON Toggle */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setShowRawJson((prev) => !prev)}
            className={`text-xs px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 font-mono ${
              showRawJson
                ? 'bg-purple-950/60 border-purple-500/40 text-purple-300'
                : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-gray-200'
            }`}
            title="Toggle Raw JSON View"
          >
            <Code2 className="w-3 h-3" />
            <span className="hidden sm:inline">JSON</span>
          </button>

          <button
            onClick={handleRefresh}
            className="text-gray-400 hover:text-white p-1.5 rounded-lg bg-gray-900 border border-gray-800 hover:border-gray-700 transition-colors"
            title="Sync Vault from Server"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Content Viewport */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
        {showRawJson ? (
          <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800 font-mono text-xs overflow-x-auto text-emerald-400">
            <pre>{JSON.stringify(artifacts, null, 2)}</pre>
          </div>
        ) : (
          <>
            {/* TAB 1: TIMELINE & ROLES */}
            {activeTab === 'timeline' && (
              <div className="space-y-5 max-w-5xl mx-auto">
                {/* Unified Executive Identity & Extractor Hero */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-gray-900 via-gray-900/90 to-blue-950/30 border border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                        Executive Identity
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        9+ Years Experience
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-white tracking-tight">
                      {candidate?.name || 'Aura Candidate'}
                    </h2>

                    <p className="text-xs text-blue-300 font-medium">
                      {candidate?.headline || 'Senior Technology & Data Lead | Systems Builder'}
                    </p>

                    {candidate?.experience_summary && (
                      <p className="text-xs text-gray-300 leading-relaxed pt-1 max-w-3xl">
                        {candidate.experience_summary}
                      </p>
                    )}
                  </div>

                  {/* Actions Right */}
                  <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 md:min-w-[190px]">
                    <button
                      onClick={openRoleModal}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-950 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{currentUser?.is_assigned ? 'Calibrate Role' : 'Assign My Role'}</span>
                    </button>

                    <button
                      onClick={() => setIsTimelineModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-300 text-xs font-medium flex items-center justify-center gap-1.5 border border-gray-700 transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5 text-blue-400" />
                      <span>Upload & Extract CV</span>
                    </button>

                    <button
                      onClick={() => setIsTimelineModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-300 text-xs font-medium flex items-center justify-center gap-1.5 border border-gray-700 transition-colors"
                    >
                      <Calendar className="w-3 h-3 text-cyan-400" />
                      <span>Calibrate Timeline</span>
                    </button>
                  </div>
                </div>

                {/* Chronological Work History & Milestones */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                      <span>Chronological Career Milestones ({workHistory.length})</span>
                    </h3>
                    <span className="text-[11px] text-gray-500 font-mono">
                      Anchored to Career Vault
                    </span>
                  </div>

                  {workHistory.length > 0 ? (
                    <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-800">
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
                                  ? 'bg-amber-400 border-amber-300 ring-4 ring-amber-400/20'
                                  : 'bg-blue-500 border-blue-400 ring-4 ring-blue-500/20'
                              }`}
                            ></div>

                            {/* Milestone Card */}
                            <div
                              className={`p-4 rounded-xl border transition-all ${
                                isGap
                                  ? 'bg-gradient-to-r from-amber-950/20 to-gray-900 border-amber-500/40 shadow-sm'
                                  : 'bg-gray-900/90 border-gray-800 hover:border-gray-700'
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="text-sm font-bold text-white">{wh.role}</h4>
                                  {isGap ? (
                                    <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-mono font-medium">
                                      Systems Builder & Quant R&D (Gap Phase)
                                    </span>
                                  ) : (
                                    <span className="text-xs font-semibold text-blue-400">
                                      @ {wh.company}
                                    </span>
                                  )}
                                </div>

                                <span className="text-[11px] font-mono text-gray-400 bg-gray-950 px-2.5 py-0.5 rounded border border-gray-800 self-start sm:self-auto">
                                  {wh.period || 'Recent'}
                                </span>
                              </div>

                              {wh.summary && (
                                <p className="text-xs text-gray-300 leading-relaxed mb-3">
                                  {wh.summary}
                                </p>
                              )}

                              {wh.responsibilities && wh.responsibilities.length > 0 && (
                                <div className="space-y-1.5 pt-1 border-t border-gray-800/60">
                                  <span className="text-[11px] font-semibold text-gray-400 block">
                                    Core Engineering Scope:
                                  </span>
                                  <ul className="space-y-1 text-xs text-gray-300 pl-4 list-disc marker:text-blue-500">
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
                    <div className="p-8 rounded-2xl bg-gray-900/40 border border-dashed border-gray-800 text-center space-y-2">
                      <Briefcase className="w-8 h-8 text-gray-600 mx-auto" />
                      <p className="text-xs font-medium text-gray-400">No organizations recorded yet</p>
                      <button
                        onClick={() => setIsTimelineModalOpen(true)}
                        className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 mt-2"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload CV to Populate Timeline</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: STORY VAULT (INTERACTIVE ACCORDION & FILTER) */}
            {activeTab === 'stories' && (
              <div className="space-y-4 max-w-5xl mx-auto">
                {/* Story Controls Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-gray-900 border border-gray-800">
                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    <Filter className="w-3.5 h-3.5 text-gray-500 shrink-0 ml-1" />
                    {[
                      { id: 'all', label: `All (${stories.length})` },
                      { id: 'incident', label: 'Triage & Outages' },
                      { id: 'architecture', label: 'SQL & Database' },
                      { id: 'automation', label: 'Automation & SLAs' },
                      { id: 'ai', label: 'Quant & Agentic AI' }
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setStoryFilter(f.id as any)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 ${
                          storyFilter === f.id
                            ? 'bg-blue-600 text-white font-semibold'
                            : 'bg-gray-950 text-gray-400 hover:text-gray-200 border border-gray-800'
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
                      className="text-[11px] text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-800"
                    >
                      Expand All
                    </button>
                    <span className="text-gray-700">|</span>
                    <button
                      onClick={() => toggleAllStories(false)}
                      className="text-[11px] text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-800"
                    >
                      Collapse All
                    </button>
                  </div>
                </div>

                {/* Filtered Stories List */}
                <div className="space-y-3">
                  {filteredStories.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-gray-900/40 border border-dashed border-gray-800 text-center space-y-2">
                      <FileText className="w-8 h-8 text-gray-600 mx-auto" />
                      <p className="text-xs text-gray-400">No stories match this filter</p>
                    </div>
                  ) : (
                    filteredStories.map((s: any) => {
                      const isExpanded = Boolean(expandedStoryIds[s.id]);
                      const isRelevantToActiveTrack =
                        activeProfileTab &&
                        s.applicable_profiles &&
                        s.applicable_profiles.includes(activeProfileTab);

                      return (
                        <div
                          key={s.id}
                          className={`rounded-xl border transition-all ${
                            isRelevantToActiveTrack
                              ? 'bg-gray-900 border-blue-500/40 shadow-sm'
                              : 'bg-gray-900/80 border-gray-800 hover:border-gray-700'
                          }`}
                        >
                          {/* Story Accordion Header */}
                          <div
                            onClick={() => toggleStoryExpand(s.id)}
                            className="p-3.5 flex items-start justify-between gap-3 cursor-pointer select-none"
                          >
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
                                  {s.id.toUpperCase()}
                                </span>
                                <h4 className="text-sm font-bold text-white leading-snug">{s.title}</h4>
                                {isRelevantToActiveTrack && (
                                  <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded font-mono">
                                    Track Match
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400">
                                {s.company} · {s.role} ({s.period || 'Recent'})
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 pt-0.5">
                              {/* Quick Metrics preview */}
                              {s.metrics && s.metrics.length > 0 && (
                                <span className="hidden sm:inline-block text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                  {s.metrics[0]}
                                </span>
                              )}
                              <div className="w-6 h-6 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400">
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </div>
                            </div>
                          </div>

                          {/* Expanded Full STARR Content */}
                          {isExpanded && (
                            <div className="px-3.5 pb-4 space-y-3 border-t border-gray-800/80 pt-3">
                              {/* 4 STARR Matrix Points */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                <div className="p-2.5 rounded-lg bg-gray-950/60 border border-gray-800/80 space-y-1">
                                  <strong className="text-amber-400 font-semibold block">1. Situation:</strong>
                                  <span className="text-gray-300 leading-relaxed">{s.situation}</span>
                                </div>

                                <div className="p-2.5 rounded-lg bg-gray-950/60 border border-gray-800/80 space-y-1">
                                  <strong className="text-sky-400 font-semibold block">2. Plan / Goal:</strong>
                                  <span className="text-gray-300 leading-relaxed">{s.task}</span>
                                </div>

                                <div className="p-2.5 rounded-lg bg-gray-950/60 border border-gray-800/80 space-y-1">
                                  <strong className="text-emerald-400 font-semibold block">3. Execution:</strong>
                                  <span className="text-gray-300 leading-relaxed">{s.action}</span>
                                </div>

                                <div className="p-2.5 rounded-lg bg-gray-950/60 border border-gray-800/80 space-y-1">
                                  <strong className="text-purple-400 font-semibold block">4. Result & Metrics:</strong>
                                  <span className="text-gray-300 leading-relaxed">{s.result}</span>
                                </div>
                              </div>

                              {/* Point 5: Learnings & Preventative Governance */}
                              {s.learnings && s.learnings.length > 0 && (
                                <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-600/30 space-y-1">
                                  <div className="flex items-center gap-1.5 text-amber-300 font-semibold text-xs">
                                    <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                    <span>5. Retrospective Learnings & Preventative Safeguards:</span>
                                  </div>
                                  <ul className="space-y-0.5 pl-4 list-disc marker:text-amber-400 text-xs text-gray-300">
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
                                      className="text-[11px] bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-md flex items-center gap-1 font-mono"
                                    >
                                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {m}
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
              <div className="space-y-5 max-w-5xl mx-auto">
                {!traits?.career_archetype && (!traits?.target_profiles || traits.target_profiles.length === 0) ? (
                  <div className="p-8 sm:p-12 rounded-2xl bg-gray-900/60 border border-gray-800 text-center space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mx-auto">
                      <Award className="w-6 h-6" />
                    </div>
                    <div className="space-y-1.5 max-w-md mx-auto">
                      <h3 className="text-base font-bold text-white">Traits Awaiting Calibration</h3>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        Upload your CV in the chat or from the Timeline tab. Aura will automatically synthesize your calibrated Career Archetype, Target Role match scores, and Evaluated Competencies.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsTimelineModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer shadow-lg shadow-blue-900/20"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload CV / Timeline</span>
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Archetype banner */}
                    {traits?.career_archetype && (
                      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/50 via-gray-900 to-indigo-950/40 border border-blue-800/40 flex items-center justify-between">
                        <div>
                          <span className="text-[11px] uppercase tracking-wider text-blue-400 font-semibold block mb-0.5">
                            Calibrated Career Archetype
                          </span>
                          <h3 className="text-base font-bold text-white">{traits.career_archetype}</h3>
                          <p className="text-xs text-gray-400 mt-1">
                            High-assurance enterprise reliability paired with autonomous engineering capability.
                          </p>
                        </div>
                        <button
                          onClick={() => setActiveModule('cvforge')}
                          className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                          <span>Tailor in CV Forge</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {/* Target Role Match Cards Grid */}
                    {traits?.target_profiles && traits.target_profiles.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Qualified Role Pathways & Match Scores
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {traits.target_profiles.map((tp) => (
                            <div
                              key={tp.id}
                              className="p-4 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all space-y-2.5"
                            >
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-bold text-white">{tp.title}</h4>
                                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                  {tp.match_score}% Match
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 leading-relaxed">{tp.core_pitch}</p>
                              <div className="pt-2 border-t border-gray-800 flex items-center justify-between text-[11px]">
                                <span className="text-gray-500 font-mono">Track: {tp.id}</span>
                                <button
                                  onClick={() => setActiveModule('cvforge')}
                                  className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
                                >
                                  <span>Inspect in CV Forge</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Core Competencies & Evaluated Traits */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Competencies */}
                      {traits?.core_competencies && traits.core_competencies.length > 0 && (
                        <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 space-y-3">
                          <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                            Core Competencies
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {traits.core_competencies.map((cc, i) => (
                              <span
                                key={i}
                                className="text-xs bg-gray-950 border border-gray-800 text-gray-200 px-2.5 py-1 rounded-lg"
                              >
                                {cc}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Personality Traits */}
                      {traits?.personality_traits && traits.personality_traits.length > 0 && (
                        <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 space-y-3">
                          <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                            Evaluated Traits & Mindset
                          </h4>
                          <div className="space-y-1.5 text-xs text-gray-300">
                            {traits.personality_traits.map((pt, i) => (
                              <div key={i} className="p-2 rounded-lg bg-gray-950/60 border border-gray-800/80">
                                {pt}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* TAB 4: SKILLS MATRIX */}
            {activeTab === 'skills' && (
              <div className="space-y-4 max-w-5xl mx-auto">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Verified Competency Matrix
                  </h3>
                  <span className="text-[11px] text-gray-500 font-mono">
                    Extracted from STARR Milestones
                  </span>
                </div>

                {Object.keys(skillsMatrix).length === 0 || Object.values(skillsMatrix).every((arr: any) => arr.length === 0) ? (
                  <div className="p-8 rounded-2xl bg-gray-900/40 border border-dashed border-gray-800 text-center space-y-2">
                    <Cpu className="w-8 h-8 text-gray-600 mx-auto" />
                    <p className="text-xs text-gray-400">Skills Matrix will populate as stories are saved.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(skillsMatrix).map(([catKey, skills]: [string, any]) => (
                      <div key={catKey} className="p-4 rounded-xl bg-gray-900 border border-gray-800 space-y-2.5">
                        <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider border-b border-gray-800 pb-1.5">
                          {catKey.replace(/_/g, ' ')}
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {skills.map((sk: any, idx: number) => (
                            <span
                              key={idx}
                              className="text-xs bg-gray-950 border border-gray-800 text-gray-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5"
                            >
                              <span>{sk.name}</span>
                              <span className="text-[10px] text-gray-500 font-mono">({sk.level})</span>
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
