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
  const { fetchArtifacts, currentUser } = useAppStore();
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
    setLoadingStep(`Reading job details from ${file.name}...`);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_BASE}/api/resume/parse-cv`, {
        method: 'POST',
        headers: {
          'X-User-Id': currentUser?.username || 'user1'
        },
        body: formData
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Could not read resume');
      }

      const result = await res.json();
      setExtractedData(result.extracted_data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error reading resume');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleExtractStoredCV = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setLoadingStep('Reading your saved CV...');

    try {
      const res = await fetch(`${API_BASE}/api/resume/parse-stored-cv`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser?.username || 'user1'
        }
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Could not parse stored CV');
      }

      const result = await res.json();
      setExtractedData(result.extracted_data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error parsing CV');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleUpdateRole = (index: number, field: string, value: any) => {
    if (!extractedData) return;
    const updatedHistory = [...extractedData.work_history];
    updatedHistory[index] = {
      ...updatedHistory[index],
      [field]: value
    };
    setExtractedData({
      ...extractedData,
      work_history: updatedHistory
    });
  };

  const handleDeleteRole = (index: number) => {
    if (!extractedData) return;
    const updatedHistory = extractedData.work_history.filter((_: any, idx: number) => idx !== index);
    setExtractedData({
      ...extractedData,
      work_history: updatedHistory
    });
  };

  const handleAddRole = () => {
    if (!extractedData) return;
    const newRole = {
      role: 'Job Title',
      company: 'Company Name',
      period: '2022 - Present',
      location: 'City, Country',
      summary: 'Main tasks and accomplishments in this job.',
      responsibilities: ['Primary daily responsibility'],
      is_gap_phase: false
    };
    setExtractedData({
      ...extractedData,
      work_history: [newRole, ...extractedData.work_history]
    });
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
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser?.username || 'user1'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to save confirmed jobs');
      }

      setSaveSuccess(true);
      await fetchArtifacts();

      if (onSuccess) onSuccess();

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error saving jobs');
    } finally {
      setIsSaving(false);
    }
  };

  const workHistory = extractedData?.work_history || [];
  const candidate = extractedData?.candidate;
  const gapAnalysis = extractedData?.gap_phase_analysis;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Add Your Work History
                </h3>
                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200 font-medium">
                  Auto-Reads CV
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Upload your CV to auto-fill your jobs, dates, and duties in simple order.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Upload and Extract Bar */}
          {!extractedData && !isLoading && (
            <div className="p-8 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600">
                <Upload className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Upload Your Resume File</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md">
                  Works with PDF, Word (DOCX), or TXT files. We will read your past jobs automatically.
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
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center space-x-2 transition-all shadow-sm"
                >
                  <Upload className="w-4 h-4" />
                  <span>Choose Resume File</span>
                </button>

                <button
                  onClick={handleExtractStoredCV}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center space-x-2 transition-all border border-slate-300 shadow-sm"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Read Previously Saved CV</span>
                </button>
              </div>
            </div>
          )}

          {/* Loading Animation */}
          {isLoading && (
            <div className="p-12 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-sm font-semibold text-slate-900">{loadingStep}</p>
              <p className="text-xs text-slate-500">Reading job titles, companies, dates, and work duties...</p>
            </div>
          )}

          {/* Result Capture Confirmation View */}
          {extractedData && (
            <div className="space-y-6">
              {/* Gap Phase Strategic Analysis Card */}
              {gapAnalysis && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-amber-800 font-semibold text-xs">
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      <span>Career Gap Notice ({gapAnalysis.gap_period || 'Recent Period'})</span>
                    </div>
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-200 font-medium">
                      Explained Positively
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {gapAnalysis.strategic_recommendation ||
                      'Highlighted independent projects, freelance consulting, or continuous professional learning.'}
                  </p>
                </div>
              )}

              {/* Candidate Info Overview */}
              {candidate && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{candidate.name || 'Candidate'}</h4>
                    <p className="text-xs text-blue-600 font-medium">{candidate.headline}</p>
                    <div className="flex items-center space-x-3 text-[11px] text-slate-500 mt-1">
                      <span>{candidate.email}</span>
                      <span>•</span>
                      <span>{candidate.phone}</span>
                      <span>•</span>
                      <span>{candidate.location}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setExtractedData(null)}
                    className="text-xs text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg bg-white border border-slate-300 shadow-sm"
                  >
                    Upload Another
                  </button>
                </div>
              )}

              {/* Roles & Phases Confirmation List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                      Work Experience ({workHistory.length})
                    </h4>
                  </div>
                  <button
                    onClick={handleAddRole}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Job</span>
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
                            ? 'bg-amber-50/60 border-amber-300'
                            : 'bg-white border-slate-200 shadow-sm'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] text-slate-500 font-medium">Job Title</label>
                              <input
                                type="text"
                                value={wh.role || ''}
                                onChange={(e) => handleUpdateRole(idx, 'role', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500 focus:bg-white"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-500 font-medium">Company Name</label>
                              <input
                                type="text"
                                value={wh.company || ''}
                                onChange={(e) => handleUpdateRole(idx, 'company', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-blue-600 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-500 font-medium">Dates Worked</label>
                              <input
                                type="text"
                                value={wh.period || ''}
                                onChange={(e) => handleUpdateRole(idx, 'period', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-500 font-medium">City / Country</label>
                              <input
                                type="text"
                                value={wh.location || ''}
                                onChange={(e) => handleUpdateRole(idx, 'location', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white"
                              />
                            </div>
                          </div>

                          <div className="flex flex-col items-end space-y-2">
                            <label className="flex items-center space-x-1.5 cursor-pointer text-[10px] text-slate-500">
                              <input
                                type="checkbox"
                                checked={isGap}
                                onChange={(e) => handleUpdateRole(idx, 'is_gap_phase', e.target.checked)}
                                className="rounded border-slate-300 text-amber-600 focus:ring-0 cursor-pointer"
                              />
                              <span className={isGap ? 'text-amber-800 font-semibold' : ''}>Career Gap</span>
                            </label>

                            <button
                              onClick={() => handleDeleteRole(idx)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-slate-100 transition-colors"
                              title="Delete position"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Summary & Responsibilities */}
                        <div>
                          <label className="text-[10px] text-slate-500 font-medium">Role Summary</label>
                          <textarea
                            rows={2}
                            value={wh.summary || ''}
                            onChange={(e) => handleUpdateRole(idx, 'summary', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-700 leading-relaxed focus:outline-none focus:border-blue-500 focus:bg-white"
                          />
                        </div>

                        {wh.responsibilities && wh.responsibilities.length > 0 && (
                          <div>
                            <label className="text-[10px] text-slate-500 font-medium">
                              Main Responsibilities ({wh.responsibilities.length})
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
                                    className="flex-1 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white"
                                  />
                                  <button
                                    onClick={() => {
                                      const nextResp = [...wh.responsibilities];
                                      nextResp.splice(rIdx, 1);
                                      handleUpdateRole(idx, 'responsibilities', nextResp);
                                    }}
                                    className="text-slate-400 hover:text-rose-600"
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
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>

          {extractedData && (
            <button
              onClick={handleConfirmAndSave}
              disabled={isSaving || saveSuccess}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shadow-sm ${
                saveSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              } disabled:opacity-50`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving to your profile...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Jobs to Profile</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
