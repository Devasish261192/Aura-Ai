import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Send,
  Search,
  RefreshCw,
  ExternalLink,
  FileText,
  FileDown,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Building2,
  MapPin,
  Clock,
  Sparkles,
  X,
  UserCheck
} from 'lucide-react';
import type { MarketJob, TelegramReferral } from '../../types';
import { API_BASE } from '../../config';
import { useAppStore } from '../../store/useAppStore';

interface JobSearchWidgetProps {
  className?: string;
  isCompact?: boolean;
}

export const JobSearchWidget: React.FC<JobSearchWidgetProps> = ({ className = '', isCompact = false }) => {
  const { currentUser } = useAppStore();
  const currentUserId = currentUser?.username || 'user1';

  // Use isCompact if passed to adapt padding
  const paddingClass = isCompact ? 'p-2 space-y-2' : 'p-4 space-y-3.5';
  const [activeSubTab, setActiveSubTab] = useState<'market' | 'telegram'>('market');
  const [locationInput, setLocationInput] = useState('Pune, India');
  
  // Market Jobs State
  const [marketJobs, setMarketJobs] = useState<MarketJob[]>([]);
  const [marketPage, setMarketPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [hasMoreJobs, setHasMoreJobs] = useState(false);
  const [isLoadingMarket, setIsLoadingMarket] = useState(false);
  const [appliedUrls, setAppliedUrls] = useState<Set<string>>(new Set());

  // Telegram Group State (blank by default for privacy & configurable by user)
  const [telegramGroup, setTelegramGroup] = useState<string>(() => {
    return localStorage.getItem('aura_telegram_group') || '';
  });
  const [telegramInput, setTelegramInput] = useState<string>(telegramGroup);
  const [telegramReferrals, setTelegramReferrals] = useState<TelegramReferral[]>([]);
  const [isLoadingTelegram, setIsLoadingTelegram] = useState(false);
  const [copiedPitchId, setCopiedPitchId] = useState<number | null>(null);

  // Cover Letter Modal State
  const [coverLetterModal, setCoverLetterModal] = useState<{ company: string; content: string } | null>(null);
  const [isLoadingLetter, setIsLoadingLetter] = useState(false);
  const [copiedLetter, setCopiedLetter] = useState(false);

  // Resume Download State
  const [downloadingResume, setDownloadingResume] = useState(false);

  // 1. Fetch Market Jobs
  const fetchMarketJobs = async (page: number = 1, loc: string = locationInput) => {
    setIsLoadingMarket(true);
    try {
      const res = await fetch(`${API_BASE}/api/jobs/matched?page=${page}&location=${encodeURIComponent(loc)}`, {
        headers: { 'X-User-Id': currentUserId }
      });
      if (res.ok) {
        const json = await res.json();
        const data = json.data || {};
        setMarketJobs(data.jobs || []);
        setTotalJobs(data.total_jobs || 0);
        setHasMoreJobs(Boolean(data.has_more));
        setMarketPage(page);
      }
    } catch (e) {
      console.error('Failed to load market jobs:', e);
    } finally {
      setIsLoadingMarket(false);
    }
  };

  // 2. Fetch Applied Jobs
  const fetchAppliedJobs = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/jobs/applied`, {
        headers: { 'X-User-Id': currentUserId }
      });
      if (res.ok) {
        const json = await res.json();
        const urls = new Set<string>((json.applied_jobs || []).map((j: any) => j.job_url));
        setAppliedUrls(urls);
      }
    } catch (e) {
      console.error('Failed to load applied jobs:', e);
    }
  };

  // 3. Discover / Re-fetch Fresh Market Jobs (Adaptable to logged-in user domain)
  const handleDiscoverLiveRoles = async () => {
    setIsLoadingMarket(true);
    try {
      const res = await fetch(`${API_BASE}/api/jobs/fetch-next-batch`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Id': currentUserId
        },
        body: JSON.stringify({ location: locationInput, query: '' })
      });
      if (res.ok) {
        await fetchMarketJobs(1, locationInput);
      }
    } catch (e) {
      console.error('Error discovering live roles:', e);
    } finally {
      setIsLoadingMarket(false);
    }
  };

  // 4. Fetch Telegram Referrals
  const fetchTelegramReferrals = async (forceRefresh: boolean = false) => {
    if (!telegramGroup) {
      setTelegramReferrals([]);
      return;
    }
    setIsLoadingTelegram(true);
    try {
      const url = forceRefresh ? `${API_BASE}/api/telegram/check-referrals` : `${API_BASE}/api/telegram/referrals`;
      const res = forceRefresh
        ? await fetch(url, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'X-User-Id': currentUserId
            },
            body: JSON.stringify({ refresh: true })
          })
        : await fetch(url, {
            headers: { 'X-User-Id': currentUserId }
          });

      if (res.ok) {
        const json = await res.json();
        setTelegramReferrals(json.referrals || []);
      }
    } catch (e) {
      console.error('Failed to load telegram referrals:', e);
    } finally {
      setIsLoadingTelegram(false);
    }
  };

  const handleSaveTelegramGroup = () => {
    const trimmed = telegramInput.trim();
    localStorage.setItem('aura_telegram_group', trimmed);
    setTelegramGroup(trimmed);
    if (trimmed) {
      fetchTelegramReferrals(true);
    } else {
      setTelegramReferrals([]);
    }
  };

  const handleClearTelegramGroup = () => {
    localStorage.removeItem('aura_telegram_group');
    setTelegramGroup('');
    setTelegramInput('');
    setTelegramReferrals([]);
  };

  // 5. Initial Load
  useEffect(() => {
    fetchMarketJobs(1);
    fetchAppliedJobs();
    if (telegramGroup) {
      fetchTelegramReferrals(false);
    } else {
      setTelegramReferrals([]);
    }
  }, [currentUserId]);

  // 6. Actions
  const handleApplyNow = async (job: MarketJob) => {
    // Open external application url
    if (job.job_url) {
      window.open(job.job_url, '_blank', 'noopener,noreferrer');
    }

    // Mark applied on backend
    try {
      await fetch(`${API_BASE}/api/jobs/mark-applied`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Id': currentUserId
        },
        body: JSON.stringify({
          job_url: job.job_url,
          job_title: job.title,
          company: job.company
        })
      });
      setAppliedUrls((prev) => new Set([...prev, job.job_url]));
    } catch (e) {
      console.error('Failed to mark job as applied:', e);
    }
  };

  const handleOpenCoverLetter = async (company: string) => {
    setIsLoadingLetter(true);
    setCopiedLetter(false);
    try {
      const res = await fetch(`${API_BASE}/api/jobs/cover-letter/${encodeURIComponent(company)}`, {
        headers: { 'X-User-Id': currentUserId }
      });
      if (res.ok) {
        const json = await res.json();
        setCoverLetterModal({ company, content: json.content || '' });
      } else {
        // Fallback default message
        setCoverLetterModal({
          company,
          content: `# Cover Letter - ${company}\n\nTailored cover letter is being compiled for ${company} based on your Master Profile and verified skills.`
        });
      }
    } catch (e) {
      console.error('Error fetching cover letter:', e);
    } finally {
      setIsLoadingLetter(false);
    }
  };

  const handleCopyPitch = (msgId: number, pitch: string) => {
    navigator.clipboard.writeText(pitch);
    setCopiedPitchId(msgId);
    setTimeout(() => setCopiedPitchId(null), 2200);
  };

  const handleDownloadPdfResume = () => {
    setDownloadingResume(true);
    try {
      const url = `${API_BASE}/api/resume/download/technical_business_analyst/pdf`;
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', '');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Failed to download PDF resume:', e);
    } finally {
      setTimeout(() => setDownloadingResume(false), 1200);
    }
  };

  return (
    <div className={`flex flex-col bg-[#0b101b] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden ${className}`}>
      {/* Top Header & Dual Subtabs */}
      <div className="px-4 py-3 border-b border-gray-800/80 bg-gray-900/60 flex items-center justify-between gap-3 shrink-0">
        {/* Subtabs Switcher */}
        <div className="flex items-center gap-1.5 bg-gray-950/80 p-1 rounded-xl border border-gray-800/90">
          <button
            onClick={() => setActiveSubTab('market')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'market'
                ? 'bg-blue-600/90 text-white shadow-sm shadow-blue-500/20'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-white" />
            <span>Market</span>
          </button>

          <button
            onClick={() => setActiveSubTab('telegram')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'telegram'
                ? 'bg-sky-600/90 text-white shadow-sm shadow-sky-500/20'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Send className="w-3.5 h-3.5 text-sky-400" />
            <span>Telegram</span>
            <span className="text-[10px] bg-sky-500/20 text-sky-300 font-mono px-1.5 py-0.2 rounded-full border border-sky-500/30">
              {telegramReferrals.length}
            </span>
          </button>
        </div>

        {/* Location & Search Controls */}
        <div className="flex items-center gap-1.5">
          {activeSubTab === 'market' ? (
            <>
              <div className="relative">
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchMarketJobs(1, locationInput)}
                  placeholder="Location"
                  className="w-32 sm:w-36 px-2.5 py-1 text-xs bg-gray-950/90 border border-gray-700/80 text-gray-100 rounded-lg focus:outline-none focus:border-blue-500 placeholder-gray-500"
                />
              </div>
              <button
                onClick={() => fetchMarketJobs(1, locationInput)}
                title="Search Location"
                className="p-1.5 text-gray-300 hover:text-white bg-gray-800/80 hover:bg-gray-700 rounded-lg border border-gray-700/80 transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleDiscoverLiveRoles}
                title="Discover Fresh Roles"
                disabled={isLoadingMarket}
                className="p-1.5 text-gray-300 hover:text-white bg-gray-800/80 hover:bg-gray-700 rounded-lg border border-gray-700/80 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingMarket ? 'animate-spin text-blue-400' : ''}`} />
              </button>
            </>
          ) : (
            <button
              onClick={() => fetchTelegramReferrals(true)}
              disabled={isLoadingTelegram}
              title="Re-check Telegram Group"
              className="px-2.5 py-1 text-xs font-medium text-sky-300 hover:text-white bg-sky-950/40 hover:bg-sky-900/60 rounded-lg border border-sky-800/60 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTelegram ? 'animate-spin text-sky-400' : ''}`} />
              <span className="hidden sm:inline">Re-check Group</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 overflow-y-auto ${paddingClass} custom-scrollbar`}>
        {/* ----------------- MARKET JOBS TAB ----------------- */}
        {activeSubTab === 'market' && (
          <>
            {isLoadingMarket && marketJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-400 mb-2" />
                <p className="text-xs">Searching verified market roles in {locationInput}...</p>
              </div>
            ) : marketJobs.length === 0 ? (
              <div className="text-center py-12 px-4 bg-gray-900/40 rounded-xl border border-gray-800/80">
                <Briefcase className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-xs text-gray-300 font-medium">No open positions found in this page.</p>
                <p className="text-[11px] text-gray-500 mt-1 mb-3">Try searching a different location or discover fresh listings.</p>
                <button
                  onClick={handleDiscoverLiveRoles}
                  className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Discover Live Open Roles</span>
                </button>
              </div>
            ) : (
              marketJobs.map((job, idx) => {
                const isApplied = appliedUrls.has(job.job_url);

                return (
                  <div
                    key={`${job.company}-${job.title}-${idx}`}
                    className={`p-4 rounded-xl border transition-all ${
                      isApplied
                        ? 'bg-gray-900/90 border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                        : 'bg-[#111726]/90 border-gray-800/90 hover:border-gray-700/90 shadow-md'
                    }`}
                  >
                    {/* Header: Title, Company, Location & Score */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-gray-100 tracking-tight leading-snug">
                          {job.title}
                        </h4>
                        <div className="flex items-center flex-wrap gap-1.5 text-xs text-gray-400 mt-0.5">
                          <span className="text-gray-300 font-medium">{job.company}</span>
                          <span>•</span>
                          <span>{job.location}</span>
                          {job.date_posted && (
                            <>
                              <span>•</span>
                              <span className="text-amber-400/90 flex items-center gap-1 text-[11px]">
                                <Clock className="w-3 h-3" />
                                {job.date_posted}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Match Badge */}
                      <span
                        className={`text-xs px-2.5 py-1 rounded-lg font-semibold shrink-0 text-center leading-none ${
                          isApplied
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 flex items-center gap-1'
                            : 'bg-amber-950/70 text-amber-300 border border-amber-600/40'
                        }`}
                      >
                        {isApplied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Applied</span>
                          </>
                        ) : (
                          `${job.match_score || 90}% Match`
                        )}
                      </span>
                    </div>

                    {/* Fit Rationale */}
                    <p className="text-xs text-gray-300/90 mt-2.5 leading-relaxed line-clamp-3">
                      {job.why_fit}
                    </p>

                    {/* Action Buttons (Exact Match to Screenshot) */}
                    <div className="flex items-center flex-wrap gap-2 mt-3.5 pt-3 border-t border-gray-800/60">
                      {/* Apply Now Button */}
                      <button
                        onClick={() => handleApplyNow(job)}
                        className="px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-500 hover:bg-sky-400 active:bg-sky-600 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-sky-500/20"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>{isApplied ? 'Review Post' : 'Apply Now'}</span>
                      </button>

                      {/* Cover Letter Button */}
                      <button
                        onClick={() => handleOpenCoverLetter(job.company)}
                        disabled={isLoadingLetter}
                        className="px-3 py-1.5 text-xs font-medium text-gray-200 bg-gray-800/90 hover:bg-gray-700/90 border border-gray-700/80 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-60"
                      >
                        {isLoadingLetter ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                        ) : (
                          <FileText className="w-3.5 h-3.5 text-amber-400" />
                        )}
                        <span>Cover Letter</span>
                      </button>

                      {/* Preview & PDF Resume Button */}
                      <button
                        onClick={handleDownloadPdfResume}
                        disabled={downloadingResume}
                        className="px-3 py-1.5 text-xs font-medium text-gray-200 bg-gray-800/90 hover:bg-gray-700/90 border border-gray-700/80 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <FileDown className="w-3.5 h-3.5 text-sky-400" />
                        <span>Preview & PDF Resume</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}

            {/* Pagination Controls */}
            {marketJobs.length > 0 && (
              <div className="flex items-center justify-between pt-2 px-1 text-xs text-gray-400">
                <button
                  disabled={marketPage <= 1}
                  onClick={() => fetchMarketJobs(marketPage - 1, locationInput)}
                  className="px-2.5 py-1 bg-gray-900 border border-gray-800 hover:bg-gray-800 rounded-lg disabled:opacity-40 transition-colors flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <span className="text-[11px] text-gray-400">
                  Page {marketPage} (Total: {totalJobs})
                </span>

                <button
                  onClick={() => (hasMoreJobs ? fetchMarketJobs(marketPage + 1, locationInput) : handleDiscoverLiveRoles())}
                  className="px-2.5 py-1 bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-200 rounded-lg transition-colors flex items-center gap-1"
                >
                  <span>{hasMoreJobs ? 'Next 5 Jobs' : 'Discover More'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </>
        )}

        {/* ----------------- TELEGRAM REFERRALS TAB ----------------- */}
        {activeSubTab === 'telegram' && (
          <>
            {/* Telegram Channel / Group Connection Box */}
            <div className="p-3 bg-gray-900/80 border border-gray-800 rounded-xl space-y-2.5 text-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-sky-400 shrink-0" />
                  <div>
                    <span className="font-semibold text-gray-200">Telegram Channel & Group Connector</span>
                    <p className="text-[10px] text-gray-400">Connect any public channel username or group link to scan live referral posts</p>
                  </div>
                </div>
                {telegramGroup ? (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Connected
                  </span>
                ) : (
                  <span className="text-[10px] bg-gray-800 text-gray-400 font-medium px-2 py-0.5 rounded-full border border-gray-700 shrink-0">
                    Not Configured
                  </span>
                )}
              </div>

              {/* Group ID / Link Input */}
              <div className="flex items-center gap-2 pt-1 border-t border-gray-800/60">
                <input
                  type="text"
                  value={telegramInput}
                  onChange={(e) => setTelegramInput(e.target.value)}
                  placeholder="Enter Telegram Group ID or link (e.g. @tech_jobs or https://t.me/...)"
                  className="flex-1 px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-sky-500 font-mono transition-colors"
                />
                <button
                  type="button"
                  onClick={handleSaveTelegramGroup}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-sky-600/20 transition-all cursor-pointer shrink-0"
                >
                  Save Group
                </button>
                {telegramGroup && (
                  <button
                    type="button"
                    onClick={handleClearTelegramGroup}
                    className="px-2 py-1.5 bg-gray-800 hover:bg-rose-950/40 hover:text-rose-300 text-gray-400 rounded-lg text-xs transition-colors cursor-pointer shrink-0"
                    title="Disconnect Group"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {isLoadingTelegram ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <RefreshCw className="w-6 h-6 animate-spin text-sky-400 mb-2" />
                <p className="text-xs">Analyzing Telegram group posts & drafting referral pitches...</p>
              </div>
            ) : !telegramGroup ? (
              <div className="text-center py-12 px-4 bg-gray-900/40 rounded-xl border border-gray-800/80 space-y-2">
                <Send className="w-8 h-8 text-sky-500/30 mx-auto" />
                <p className="text-xs text-gray-200 font-semibold">No Telegram Group Connected</p>
                <p className="text-[11px] text-gray-400 max-w-sm mx-auto">
                  To scan real-time tech referral posts, enter your Telegram community or channel ID in the field above and click <strong>Save Group</strong>.
                </p>
              </div>
            ) : telegramReferrals.length === 0 ? (
              <div className="text-center py-12 px-4 bg-gray-900/40 rounded-xl border border-gray-800/80">
                <Send className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-xs text-gray-300 font-medium">No verified referrals cached for this group.</p>
                <p className="text-[11px] text-gray-500 mt-1 mb-3">Re-scan Telegram group messages to identify real hiring posts.</p>
                <button
                  onClick={() => fetchTelegramReferrals(true)}
                  className="px-3 py-1.5 text-xs bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Scan Group Referrals</span>
                </button>
              </div>
            ) : (
              telegramReferrals.map((ref) => {
                const isCopied = copiedPitchId === ref.message_id;

                return (
                  <div
                    key={ref.message_id}
                    className="p-4 rounded-xl bg-[#111726]/90 border border-gray-800/90 hover:border-sky-800/60 shadow-md transition-all space-y-3"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-gray-100 tracking-tight leading-snug">
                          {ref.job_title}
                        </h4>
                        <div className="flex items-center flex-wrap gap-1.5 text-xs text-gray-400 mt-0.5">
                          <span className="text-gray-200 font-medium flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-sky-400" />
                            {ref.company}
                          </span>
                          {ref.requisition_code && (
                            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded border border-indigo-500/30 font-mono">
                              Req: {ref.requisition_code}
                            </span>
                          )}
                        </div>
                      </div>

                      <span className="text-xs px-2.5 py-1 rounded-lg font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 shrink-0">
                        {ref.match_score}% Match
                      </span>
                    </div>

                    {/* Metadata tags */}
                    <div className="flex items-center flex-wrap gap-2 text-[11px] text-gray-400">
                      <span className="flex items-center gap-1 bg-gray-900/80 px-2 py-0.5 rounded border border-gray-800">
                        <MapPin className="w-3 h-3 text-rose-400" />
                        {ref.location}
                      </span>
                      <span className="flex items-center gap-1 bg-gray-900/80 px-2 py-0.5 rounded border border-gray-800">
                        <UserCheck className="w-3 h-3 text-sky-400" />
                        Referrer: <strong className="text-sky-300 font-medium">{ref.contact_person}</strong>
                      </span>
                      {ref.date_posted && (
                        <span className="flex items-center gap-1 bg-gray-900/80 px-2 py-0.5 rounded border border-gray-800 text-gray-500">
                          <Clock className="w-3 h-3" />
                          {ref.date_posted}
                        </span>
                      )}
                    </div>

                    {/* Matched Skills Pills */}
                    {ref.key_skills_matched && ref.key_skills_matched.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {ref.key_skills_matched.map((sk) => (
                          <span
                            key={sk}
                            className="text-[10px] bg-gray-800 text-gray-300 px-2 py-0.5 rounded font-mono border border-gray-700/60"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Why fit note */}
                    <p className="text-xs text-gray-300/90 leading-relaxed">
                      {ref.why_fit}
                    </p>

                    {/* Pre-Drafted 1-Click Referral Pitch Box */}
                    <div className="p-2.5 rounded-lg bg-sky-950/30 border border-sky-800/40 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Pre-Drafted 1-Click Referral Pitch
                        </span>
                        <span className="text-[10px] text-gray-500">Ready to DM</span>
                      </div>
                      <p className="text-[11px] text-gray-200 italic leading-relaxed">
                        "{ref.referral_pitch}"
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center flex-wrap gap-2 pt-2 border-t border-gray-800/60">
                      {/* Copy Pitch Button */}
                      <button
                        onClick={() => handleCopyPitch(ref.message_id, ref.referral_pitch)}
                        className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                          isCopied
                            ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                            : 'bg-sky-500 hover:bg-sky-400 text-white shadow-sm shadow-sky-500/20'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>✓ Copied Pitch!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Referral Pitch</span>
                          </>
                        )}
                      </button>

                      {/* View Telegram Post */}
                      {ref.telegram_link && (
                        <a
                          href={ref.telegram_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 text-xs font-medium text-sky-300 bg-sky-950/50 hover:bg-sky-900/60 border border-sky-800/60 rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>View Post</span>
                        </a>
                      )}

                      {/* PDF Resume */}
                      <button
                        onClick={handleDownloadPdfResume}
                        className="px-3 py-1.5 text-xs font-medium text-gray-200 bg-gray-800/90 hover:bg-gray-700/90 border border-gray-700/80 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <FileDown className="w-3.5 h-3.5 text-sky-400" />
                        <span>PDF Resume</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}
      </div>

      {/* ----------------- COVER LETTER MODAL ----------------- */}
      {coverLetterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-gray-800 bg-gray-950 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-gray-100">
                  Cover Letter • {coverLetterModal.company}
                </h3>
              </div>
              <button
                onClick={() => setCoverLetterModal(null)}
                className="p-1 text-gray-400 hover:text-gray-100 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 p-6 overflow-y-auto text-xs text-gray-200 leading-relaxed space-y-3 font-sans whitespace-pre-wrap selection:bg-amber-500/30">
              {coverLetterModal.content}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-gray-800 bg-gray-950/80 flex items-center justify-between">
              <span className="text-[11px] text-gray-500">
                Tailored for {coverLetterModal.company} using canonical master resume.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(coverLetterModal.content);
                    setCopiedLetter(true);
                    setTimeout(() => setCopiedLetter(false), 2000);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-blue-500/20"
                >
                  {copiedLetter ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLetter ? 'Copied!' : 'Copy Letter'}</span>
                </button>
                <button
                  onClick={() => setCoverLetterModal(null)}
                  className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
