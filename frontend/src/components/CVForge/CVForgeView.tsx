import React, { useState, useEffect } from 'react';
import {
  Layers,
  Download,
  FileText,
  ExternalLink,
  Bookmark
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { API_BASE } from '../../config';

const TRACK_OPTIONS = [
  {
    id: 'track-1',
    slug: 'forward_deployed_engineer',
    title: 'Forward-Deployed Engineer (FDE) / Solutions Architect',
    score: 96
  },
  {
    id: 'track-2',
    slug: 'application_support_lead',
    title: 'Application Support Lead / Operations Architect',
    score: 94
  },
  {
    id: 'track-3',
    slug: 'lead_data_engineer',
    title: 'Lead Data Engineer / Analytics Architect',
    score: 92
  },
  {
    id: 'track-4',
    slug: 'senior_operational_analyst',
    title: 'Senior Analyst - Application & Operational Analytics',
    score: 88
  }
];

export const CVForgeView: React.FC = () => {
  const { currentUser, artifacts } = useAppStore();
  const currentUserId = (currentUser?.username || 'user1').trim().toLowerCase();
  const dynamicTracks = (artifacts?.traits?.target_profiles || []).map((tp) => ({
    id: tp.id,
    slug: tp.slug || tp.id,
    title: tp.title,
    score: tp.match_score || 90
  }));
  const trackOptions = dynamicTracks.length > 0 ? dynamicTracks : TRACK_OPTIONS;

  const [selectedTrack, setSelectedTrack] = useState(trackOptions[0]);
  const [isDownloading, setIsDownloading] = useState<'pdf' | 'docx' | null>(null);
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    if (dynamicTracks.length > 0) {
      setSelectedTrack(dynamicTracks[0]);
    }
  }, [artifacts?.traits?.target_profiles]);

  const handleDownload = (format: 'pdf' | 'docx') => {
    setIsDownloading(format);
    const url = `${API_BASE}/api/resume/download/${selectedTrack.slug}/${format}?user_id=${encodeURIComponent(currentUserId)}`;
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setIsDownloading(null), 1500);
  };

  const handleTrackChange = (trackSlug: string) => {
    const track = trackOptions.find((t) => t.slug === trackSlug) || trackOptions[0];
    setSelectedTrack(track);
    // Reload iframe to ensure fresh track context
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 text-gray-100 overflow-hidden">
      {/* CV Forge Top Action Bar */}
      <div className="min-h-14 py-2 px-3 sm:px-6 border-b border-gray-800 bg-gray-900/90 flex flex-wrap items-center justify-between gap-2.5 shrink-0 z-10">
        <div className="flex items-center space-x-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-white tracking-tight">CV Forge Studio</h2>
              <span className="text-[10px] bg-amber-400/10 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/20 font-mono">
                ATS Engine
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-gray-400">Precision A4 Sheet Tailoring & Vector Word/PDF Generation</p>
          </div>
        </div>

        {/* Center Track Selector */}
        <div className="flex items-center space-x-2 bg-gray-950 px-2.5 py-1.5 rounded-xl border border-gray-800 shrink max-w-full">
          <Bookmark className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="hidden sm:inline text-xs text-gray-400 font-medium">Track:</span>
          <select
            value={selectedTrack.slug}
            onChange={(e) => handleTrackChange(e.target.value)}
            className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer pr-1 truncate max-w-[180px] sm:max-w-[260px]"
          >
            {trackOptions.map((t) => (
              <option key={t.id} value={t.slug} className="bg-gray-900 text-gray-200">
                {t.title} ({t.score}% Match)
              </option>
            ))}
          </select>
          <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30 shrink-0">
            {selectedTrack.score}%
          </span>
        </div>

        {/* Right Actions: Native PDF, Word DOCX, Open in New Window */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => handleDownload('pdf')}
            disabled={Boolean(isDownloading)}
            className="flex items-center space-x-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-sm shadow-emerald-900 disabled:opacity-50 cursor-pointer"
            title="Download Vector PDF compiled via native Microsoft Word COM"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Word PDF</span>
            <span className="sm:hidden">PDF</span>
          </button>

          <button
            onClick={() => handleDownload('docx')}
            disabled={Boolean(isDownloading)}
            className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium transition-colors border border-gray-700 disabled:opacity-50 cursor-pointer"
            title="Download editable Word Document (.docx)"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="hidden sm:inline">Export Word</span>
            <span className="sm:hidden">DOCX</span>
          </button>

          <a
            href={`${API_BASE}/cv-forge/?user=${encodeURIComponent(currentUserId)}&track=${encodeURIComponent(selectedTrack.slug)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs transition-colors border border-gray-700"
            title="Open Studio in Full Dedicated Tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Embedded Live CV Forge Studio */}
      <div className="flex-1 w-full h-full relative bg-gray-950">
        <iframe
          key={`${iframeKey}-${currentUserId}-${selectedTrack.slug}`}
          src={`${API_BASE}/cv-forge/?user=${encodeURIComponent(currentUserId)}&track=${encodeURIComponent(selectedTrack.slug)}`}
          className="w-full h-full border-none"
          title="CV Forge Studio"
          allow="fullscreen; clipboard-read; clipboard-write"
        />
      </div>
    </div>
  );
};
