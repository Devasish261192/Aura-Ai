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

const UNIVERSAL_TRACK_OPTIONS = [
  {
    id: 'track-1',
    slug: 'operations_team_lead',
    title: 'Operations & Team Lead / Manager',
    score: 95
  },
  {
    id: 'track-2',
    slug: 'business_specialist',
    title: 'Business Specialist & Project Coordinator',
    score: 92
  },
  {
    id: 'track-3',
    slug: 'customer_success_lead',
    title: 'Client Relationships & Account Lead',
    score: 90
  },
  {
    id: 'track-4',
    slug: 'functional_analyst',
    title: 'Process & Workflow Specialist',
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
  const trackOptions = dynamicTracks.length > 0 ? dynamicTracks : UNIVERSAL_TRACK_OPTIONS;

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
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-800 overflow-hidden">
      {/* CV Forge Top Action Bar */}
      <div className="min-h-14 py-2 px-3 sm:px-6 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-2.5 shrink-0 z-10 shadow-sm">
        <div className="flex items-center space-x-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">Ready Resume Builder</h2>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 font-medium">
                ATS Friendly
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-slate-500">Clean 1-Page Layout with Downloadable Word & PDF</p>
          </div>
        </div>

        {/* Center Track Selector */}
        <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 shrink max-w-full">
          <Bookmark className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="hidden sm:inline text-xs text-slate-500 font-medium">Target Role:</span>
          <select
            value={selectedTrack.slug}
            onChange={(e) => handleTrackChange(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-900 focus:outline-none cursor-pointer pr-1 truncate max-w-[180px] sm:max-w-[260px]"
          >
            {trackOptions.map((t) => (
              <option key={t.id} value={t.slug} className="bg-white text-slate-800">
                {t.title} ({t.score}% Match)
              </option>
            ))}
          </select>
          <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
            {selectedTrack.score}%
          </span>
        </div>

        {/* Right Actions: Native PDF, Word DOCX, Open in New Window */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => handleDownload('pdf')}
            disabled={Boolean(isDownloading)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            title="Download clean PDF resume"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Download PDF</span>
            <span className="sm:hidden">PDF</span>
          </button>

          <button
            onClick={() => handleDownload('docx')}
            disabled={Boolean(isDownloading)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors border border-slate-300 disabled:opacity-50 cursor-pointer shadow-sm"
            title="Download editable Word Document (.docx)"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="hidden sm:inline">Export Word</span>
            <span className="sm:hidden">DOCX</span>
          </button>

          <a
            href={`${API_BASE}/cv-forge/?user=${encodeURIComponent(currentUserId)}&track=${encodeURIComponent(selectedTrack.slug)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 p-2 rounded-lg bg-white hover:bg-slate-100 text-slate-600 text-xs transition-colors border border-slate-300 shadow-sm"
            title="Open in full screen tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Embedded Live CV Forge Studio */}
      <div className="flex-1 w-full h-full relative bg-slate-100">
        <iframe
          key={`${iframeKey}-${currentUserId}-${selectedTrack.slug}`}
          src={`${API_BASE}/cv-forge/?user=${encodeURIComponent(currentUserId)}&track=${encodeURIComponent(selectedTrack.slug)}`}
          className="w-full h-full border-none"
          title="Resume Builder"
          allow="fullscreen; clipboard-read; clipboard-write"
        />
      </div>
    </div>
  );
};
