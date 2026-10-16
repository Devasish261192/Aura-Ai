import React, { useState, useRef } from 'react';
import {
  Upload,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Calendar,
  Briefcase,
  Sparkles,
  ShieldCheck,
  Plus,
  Trash2,
  X
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { API_BASE } from '../../config';

interface TimelineExtractorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const TimelineExtractorModal: React.FC<TimelineExtractorModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { fetchArtifacts } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [extractedData, setExtractedData] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setErrorMsg(null);
    setLoadingStep(`Extracting text and chronological timeline from ${file.name}...`);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_BASE}/api/resume/parse-cv`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to parse resume');
      }

      const result = await res.json();
      setExtractedData(result.extracted_data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error parsing resume');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleExtractStoredCV = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setLoadingStep('Extracting career timeline & gap phases from stored CV...');

    try {
      const res = await fetch(`${API_BASE}/api/resume/parse-stored-cv`, {
        method: 'POST'
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to parse stored resume');
      }

      const result = await res.json();
      setExtractedData(result.extracted_data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error parsing stored resume');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleUpdateRole = (index: number, field: string, value: any) => {
    if (!extractedData) return;
    const updated = { ...extractedData };
    const history = [...(updated.work_history || [])];
    history[index] = { ...history[index], [field]: value };
    updated.work_history = history;
    setExtractedData(updated);
  };

  const handleDeleteRole = (index: number) => {
    if (!extractedData) return;
    const updated = { ...extractedData };
    const history = [...(updated.work_history || [])];
    history.splice(index, 1);
    updated.work_history = history;
    setExtractedData(updated);
  };

  const handleAddRole = () => {
    if (!extractedData) return;
    const updated = { ...extractedData };
    const history = [
      {
        company: 'New Organization',
        role: 'Job Title',
        period: '2025 - Present',
        location: 'Remote',
        is_gap_phase: false,
        summary: 'Brief overview of responsibilities.',
        responsibilities: ['Core achievement or responsibility']
      },
      ...(updated.work_history || [])
    ];
    updated.work_history = history;
    setExtractedData(updated);
  };

  const handleConfirmAndSave = async () => {
    if (!extractedData) return;
    setIsSaving(true);
    setErrorMsg(null);

    try {
      const payload = {
        candidate: extractedData.candidate,
        work_history: extractedData.work_history,
        education: extractedData.education,
        skills: extractedData.skills
      };

      const res = await fetch(`${API_BASE}/api/resume/confirm-timeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to save confirmed timeline');
      }

      setSaveSuccess(true);
      await fetchArtifacts();

      if (onSuccess) onSuccess();

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error saving timeline');
    } finally {
      setIsSaving(false);
    }
  };

  const workHistory = extractedData?.work_history || [];
  const candidate = extractedData?.candidate;
  const gapAnalysis = extractedData?.gap_phase_analysis;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-950/80">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Career Timeline & Gap Phase Extractor
                </h3>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30 font-mono">
                  ATS Verified
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Upload your CV to automatically extract chronological roles, dates, and dedicated gap-phase projects.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/80 text-red-300 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Upload and Extract Bar */}
          {!extractedData && !isLoading && (
            <div className="p-8 border-2 border-dashed border-gray-800 rounded-2xl bg-gray-950/50 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Upload className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Upload Your Existing CV / Resume</h4>
                <p className="text-xs text-gray-400 mt-1 max-w-md">
                  Supports PDF, DOCX, or TXT. Our AI parses your career chronology and checks for employment gaps.
                </p>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-2 transition-all shadow-md shadow-blue-950"
                >
                  <Upload className="w-4 h-4" />
                  <span>Choose Resume File</span>
                </button>

                <button
                  onClick={handleExtractStoredCV}
                  className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold flex items-center space-x-2 transition-all border border-gray-700"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>1-Click Auto-Extract Stored CV</span>
                </button>
              </div>
            </div>
          )}

          {/* Loading Animation */}
          {isLoading && (
            <div className="p-12 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              <p className="text-sm font-semibold text-white">{loadingStep}</p>
              <p className="text-xs text-gray-400">Parsing reverse-chronological work history and verifying gap dates...</p>
            </div>
          )}

          {/* Result Capture Confirmation View */}
          {extractedData && (
            <div className="space-y-6">
              {/* Gap Phase Strategic Analysis Card */}
              {gapAnalysis && (
                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-amber-400 font-semibold text-xs">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Gap Phase Strategic Coverage ({gapAnalysis.gap_period || 'May 2025 - Present'})</span>
                    </div>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 font-mono">
                      Gap Resolved
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {gapAnalysis.strategic_recommendation ||
                      'Framed as Self-Employed / Independent Technical Lead & Systems Builder. Dedicated projects: Algorithmic Trading Bot, Aura AI, Sovereign Ledger.'}
                  </p>
                </div>
              )}

              {/* Candidate Info Overview */}
              {candidate && (
                <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{candidate.name || 'Aura Candidate'}</h4>
                    <p className="text-xs text-blue-400 font-medium">{candidate.headline}</p>
                    <div className="flex items-center space-x-3 text-[11px] text-gray-400 mt-1 font-mono">
                      <span>{candidate.email}</span>
                      <span>•</span>
                      <span>{candidate.phone}</span>
                      <span>•</span>
                      <span>{candidate.location}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setExtractedData(null)}
                    className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700"
                  >
                    Re-upload / Change
                  </button>
                </div>
              )}

              {/* Roles & Phases Confirmation List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Briefcase className="w-4 h-4 text-blue-400" />
                    <h4 className="text-xs font-semibold text-gray-200 uppercase tracking-wider">
                      Chronological Roles & Phases ({workHistory.length})
                    </h4>
                  </div>
                  <button
                    onClick={handleAddRole}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Position</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {workHistory.map((wh: any, idx: number) => {
                    const isGap = Boolean(wh.is_gap_phase);
                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border transition-all space-y-3 ${
                          isGap
                            ? 'bg-amber-950/15 border-amber-500/40 shadow-sm shadow-amber-950/50'
                            : 'bg-gray-950 border-gray-800'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] text-gray-400 font-mono">Job Title / Role</label>
                              <input
                                type="text"
                                value={wh.role || ''}
                                onChange={(e) => handleUpdateRole(idx, 'role', e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2.5 py-1 text-xs text-white font-semibold focus:outline-none focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-gray-400 font-mono">Organization / Company</label>
                              <input
                                type="text"
                                value={wh.company || ''}
                                onChange={(e) => handleUpdateRole(idx, 'company', e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2.5 py-1 text-xs text-blue-400 font-medium focus:outline-none focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-gray-400 font-mono">Date Range / Period</label>
                              <input
                                type="text"
                                value={wh.period || ''}
                                onChange={(e) => handleUpdateRole(idx, 'period', e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2.5 py-1 text-xs text-gray-300 font-mono focus:outline-none focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-gray-400 font-mono">Location</label>
                              <input
                                type="text"
                                value={wh.location || ''}
                                onChange={(e) => handleUpdateRole(idx, 'location', e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2.5 py-1 text-xs text-gray-300 focus:outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>

                          <div className="flex flex-col items-end space-y-2">
                            <label className="flex items-center space-x-1.5 cursor-pointer text-[10px] text-gray-400">
                              <input
                                type="checkbox"
                                checked={isGap}
                                onChange={(e) => handleUpdateRole(idx, 'is_gap_phase', e.target.checked)}
                                className="rounded border-gray-700 text-amber-500 focus:ring-0 cursor-pointer"
                              />
                              <span className={isGap ? 'text-amber-300 font-semibold' : ''}>Gap Phase</span>
                            </label>

                            <button
                              onClick={() => handleDeleteRole(idx)}
                              className="text-gray-500 hover:text-red-400 p-1 rounded hover:bg-gray-800 transition-colors"
                              title="Delete position"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Summary & Responsibilities */}
                        <div>
                          <label className="text-[10px] text-gray-400 font-mono">Phase Summary & Scope</label>
                          <textarea
                            rows={2}
                            value={wh.summary || ''}
                            onChange={(e) => handleUpdateRole(idx, 'summary', e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs text-gray-300 leading-relaxed focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        {wh.responsibilities && wh.responsibilities.length > 0 && (
                          <div>
                            <label className="text-[10px] text-gray-400 font-mono">
                              Key Responsibilities ({wh.responsibilities.length})
                            </label>
                            <div className="space-y-1.5 mt-1">
                              {wh.responsibilities.map((r: string, rIdx: number) => (
                                <div key={rIdx} className="flex items-center space-x-2">
                                  <input
                                    type="text"
                                    value={r}
                                    onChange={(e) => {
                                      const nextResp = [...wh.responsibilities];
                                      nextResp[rIdx] = e.target.value;
                                      handleUpdateRole(idx, 'responsibilities', nextResp);
                                    }}
                                    className="flex-1 bg-gray-900 border border-gray-700 rounded px-2 py-0.5 text-xs text-gray-300 focus:outline-none focus:border-blue-500"
                                  />
                                  <button
                                    onClick={() => {
                                      const nextResp = [...wh.responsibilities];
                                      nextResp.splice(rIdx, 1);
                                      handleUpdateRole(idx, 'responsibilities', nextResp);
                                    }}
                                    className="text-gray-500 hover:text-red-400"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-800 bg-gray-950 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>

          {extractedData && (
            <button
              onClick={handleConfirmAndSave}
              disabled={isSaving || saveSuccess}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shadow-md ${
                saveSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-950'
              } disabled:opacity-50`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving to Canonical Vault & Recompiling Resumes...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Timeline Confirmed & Saved!</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Save Timeline to Profile Vault</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
