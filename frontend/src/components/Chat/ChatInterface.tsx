import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Loader2,
  Sparkles,
  Keyboard,
  Bot,
  ChevronLeft,
  Columns,
  Trash2,
  Code2,
  GraduationCap,
  Briefcase,
  Layers,
  Gamepad2,
  Compass,
  Copy,
  Check,
  Upload,
  Calendar
} from 'lucide-react';
import { useAppStore, type AppModule } from '../../store/useAppStore';
import { API_BASE } from '../../config';
import { MessageItem } from './MessageItem';

interface ChatInterfaceProps {
  onCollapse?: () => void;
  onToggleWidth?: () => void;
  isHalfWidth?: boolean;
  activeModule?: AppModule;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  onCollapse,
  onToggleWidth,
  isHalfWidth = false,
  activeModule = 'traits'
}) => {
  const { messages, isStreaming, sendMessage, clearChat, addMessage, fetchArtifacts } = useAppStore();
  const [inputText, setInputText] = useState('');
  const [isPolishing, setIsPolishing] = useState(false);
  const [isAllCopied, setIsAllCopied] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const resumeFileInputRef = useRef<HTMLInputElement>(null);

  // Copy entire conversation transcript (both prompts & responses)
  const handleCopyFullChat = async () => {
    if (!messages || messages.length === 0) return;
    const transcript = messages
      .map((m) => {
        const sender = m.role === 'user' ? 'You' : 'Aura Counselor';
        return `[${sender}]:\n${m.content}\n`;
      })
      .join('\n---\n\n');

    try {
      await navigator.clipboard.writeText(transcript);
      setIsAllCopied(true);
      setTimeout(() => setIsAllCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy chat transcript:', err);
    }
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Polish text via AI
  const handlePolish = async () => {
    if (!inputText.trim() || isPolishing) return;
    try {
      setIsPolishing(true);
      const res = await fetch(`${API_BASE}/api/chat/polish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText.trim() })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.text) {
          setInputText(data.text);
        }
      }
    } catch (e) {
      console.warn('AI Polish request error:', e);
    } finally {
      setIsPolishing(false);
    }
  };

  const handleSend = () => {
    const textToSend = inputText.trim();
    if (!textToSend || isStreaming || isPolishing) return;
    sendMessage(textToSend, false);
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickPrompt = (prompt: string, shouldSendImmediately = true) => {
    if (shouldSendImmediately) {
      sendMessage(prompt, false);
    } else {
      setInputText(prompt);
    }
  };

  const handlePillClick = (pill: { label: string; prompt: string; immediate?: boolean; action?: string }) => {
    if (pill.action === 'fix_timeline') {
      addMessage({
        id: `ai_${Date.now()}`,
        role: 'model',
        content: "🎯 **Aura is ready to fix and verify your career timeline.**\n\nPlease select your CV file (PDF, Word, or TXT) to upload. I will extract your complete chronological roles, isolate any employment gaps, and align your independent engineering projects.",
        createdAt: new Date().toISOString()
      });
      resumeFileInputRef.current?.click();
      return;
    }
    handleQuickPrompt(pill.prompt, pill.immediate);
  };

  const handleResumeFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingResume(true);
    addMessage({
      id: `usr_${Date.now()}`,
      role: 'user',
      content: `📄 Uploaded Resume: **${file.name}**\nPlease extract my chronological career timeline, isolate any employment gaps, and align my independent projects.`,
      createdAt: new Date().toISOString()
    });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_BASE}/api/resume/parse-cv`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        throw new Error('Failed to parse uploaded resume');
      }

      const data = await res.json();
      const extracted = data.extracted_data;
      const phases = extracted?.timeline_phases || extracted?.work_history || [];
      const gapInfo = extracted?.gap_phase_analysis;

      let reply = `✅ **Career Timeline Extracted from ${file.name}**\n\n`;
      reply += `I have parsed your career timeline and verified **${phases.length} chronological phases**:\n\n`;
      phases.forEach((p: any) => {
        const isGap = p.is_gap_phase ? ' *(Gap Phase / Systems Builder)*' : '';
        reply += `• **${p.period}**: ${p.role} at **${p.company}**${isGap}\n`;
      });

      if (gapInfo && gapInfo.has_gap) {
        reply += `\n### 🛡️ Gap Phase Strategy (${gapInfo.gap_period || 'May 2025 – Present'}):\n`;
        reply += `${gapInfo.strategic_recommendation || 'Framed as Self-Employed / Independent Technical Systems Builder. Dedicated projects: Algorithmic Trading Bot, Aura AI, Sovereign Ledger.'}\n\n`;
      }

      reply += `\n*Your Canonical Vault and CV Forge resumes have been synchronized with this unbroken timeline.*`;

      addMessage({
        id: `ai_${Date.now()}`,
        role: 'model',
        content: reply,
        createdAt: new Date().toISOString()
      });

      await fetchArtifacts();
    } catch (err: any) {
      addMessage({
        id: `ai_err_${Date.now()}`,
        role: 'model',
        content: `⚠️ Failed to extract timeline from file: ${err.message}. Please try again or paste your dates.`,
        createdAt: new Date().toISOString()
      });
    } finally {
      setIsUploadingResume(false);
      if (resumeFileInputRef.current) resumeFileInputRef.current.value = '';
    }
  };

  // Module contextual label & pills (Structured in 3 top, 3 bottom)
  const getContextMeta = () => {
    switch (activeModule) {
      case 'cvforge':
        return {
          label: 'CV Forge · Resume Tailoring',
          icon: Layers,
          color: 'text-amber-400',
          pills: [
            { label: 'Polish Summary', prompt: 'Please review and polish my resume summary in CV Forge to make it punchy, technical, and ATS-optimized.', immediate: true },
            { label: 'Highlight Skills', prompt: 'In CV Forge, highlight my key strengths in advanced SQL optimization, Python data pipelines, and MLOps.', immediate: true },
            { label: 'ATS Match Scan', prompt: 'Audit my resume bullets for ATS compliance and quantifiable achievements.', immediate: true },
            { label: 'Fix Timeline (CV)', prompt: 'I want to fix my career timeline from my resume.', action: 'fix_timeline' },
            { label: 'Add Achievement', prompt: 'In CV Forge, please add this new achievement to my experience: ', immediate: false },
            { label: 'Recompile PDF', prompt: 'Recompile my resume PDF with the latest canonical vault updates.', immediate: true }
          ]
        };
      case 'trainer':
        return {
          label: 'Interview Trainer · Prep Drill',
          icon: GraduationCap,
          color: 'text-cyan-400',
          pills: [
            { label: 'Concise PREP', prompt: 'Help me formulate a crisp, impactful PREP framework outline for my introduction.', immediate: true },
            { label: 'Trap & Gotcha', prompt: 'What are common traps and gotchas interviewers probe for in senior technical roles?', immediate: true },
            { label: 'Optimize SQL Drill', prompt: 'Give me a challenging technical drill question on SQL query optimization and indexing.', immediate: true },
            { label: 'Fix Timeline (CV)', prompt: 'I want to fix my career timeline from my resume.', action: 'fix_timeline' },
            { label: 'Incident Triage', prompt: 'Drill me on high-pressure L2/L3 production incident triage and root cause analysis.', immediate: true },
            { label: 'Explain Gap Phase', prompt: 'Coach me on answering the recruiter question: What have you been doing since May 2025?', immediate: true }
          ]
        };
      case 'interview':
        return {
          label: 'AI Interview Studio · Analysis',
          icon: Code2,
          color: 'text-purple-400',
          pills: [
            { label: 'Evaluate Video Take', prompt: 'Critique my delivery tone, technical depth, and pacing from my recent answer.', immediate: true },
            { label: 'Roleplay Interviewer', prompt: 'Act as an engineering hiring manager and ask me a follow-up probe on high-stakes incident triage.', immediate: true },
            { label: 'Explain Gap Phase', prompt: 'How should I present my self-employed quant systems building during a live video interview?', immediate: true },
            { label: 'Fix Timeline (CV)', prompt: 'I want to fix my career timeline from my resume.', action: 'fix_timeline' },
            { label: 'RCA Architecture Drill', prompt: 'Give me an architectural RCA challenge for a high-throughput streaming failure.', immediate: true },
            { label: 'Story Teleprompter', prompt: 'Draft a crisp teleprompter script for my top Evolent Health SLA story.', immediate: true }
          ]
        };
      case 'tracker':
        return {
          label: '30-Day OS · Day 1 Sprint',
          icon: Gamepad2,
          color: 'text-amber-400',
          pills: [
            { label: "Today's Plan", prompt: 'Review my priority sprint tasks for today in the 30-Day Level-Up OS.', immediate: true },
            { label: 'Funnel Pace', prompt: 'Evaluate my application funnel pace, response conversion, and daily outreach targets.', immediate: true },
            { label: 'Daily Scorecard', prompt: 'Let us review my daily accountability scorecard and complete Day 1 verification.', immediate: true },
            { label: 'Fix Timeline (CV)', prompt: 'I want to fix my career timeline from my resume.', action: 'fix_timeline' },
            { label: 'Sprint Milestones', prompt: 'What are the core technical milestones for Week 1?', immediate: true },
            { label: 'Next High Impact', prompt: 'What is the single highest-impact action I should take right now?', immediate: true }
          ]
        };
      case 'jobs':
        return {
          label: 'Job Radar · Market & TG',
          icon: Briefcase,
          color: 'text-sky-400',
          pills: [
            { label: 'Match My CV', prompt: 'Analyze which open market jobs in Pune best align with my technical stories and SQL/Python depth.', immediate: true },
            { label: 'Draft Referral DM', prompt: 'Draft a customized 1-click referral DM outreach pitch for the Aptiv opening.', immediate: true },
            { label: 'Fix Timeline (CV)', prompt: 'I want to fix my career timeline from my resume.', action: 'fix_timeline' },
            { label: 'Salary Radar', prompt: 'What is the benchmark compensation for senior technology leads and data engineers in Pune?', immediate: true },
            { label: 'Telegram Roles', prompt: 'Filter Telegram supergroup referral opportunities matching senior application and data roles.', immediate: true },
            { label: 'ATS Keyword Audit', prompt: 'Audit my resume against top market job descriptions for keywords.', immediate: true }
          ]
        };
      case 'traits':
      default:
        return {
          label: 'Canonical Vault · Story Mining',
          icon: Compass,
          color: 'text-emerald-400',
          pills: [
            { label: 'Audit Vault & Gaps', prompt: 'Please audit all stories in my vault: check if any stories are missing, if all 5 STARR points are complete, and what we need clarified or discussed.', immediate: true },
            { label: 'Fix Timeline (CV)', prompt: 'I want to fix my career timeline from my resume.', action: 'fix_timeline' },
            { label: 'Add Story Incident', prompt: 'I remembered a new incident for my story: ', immediate: false },
            { label: 'Update Metrics', prompt: 'Please update the metrics on my project: ', immediate: false },
            { label: 'Discovered Tracks', prompt: 'Review my discovered career tracks and target profiles based on all stories.', immediate: true },
            { label: 'Verify Gap Phase', prompt: 'Explain how my independent systems projects cover the gap phase from May 2025 to Present.', immediate: true }
          ]
        };
    }
  };

  const meta = getContextMeta();
  const ContextIcon = meta.icon;

  return (
    <div className="flex flex-col h-full bg-gray-950 text-gray-100 selection:bg-blue-500/30 selection:text-white">
      {/* Top Header Bar (Matching Version 0 Layout) */}
      <div className="h-13 border-b border-gray-800/90 px-4 flex items-center justify-between shrink-0 bg-gray-900/70 backdrop-blur-md">
        {/* Agent Profile & Live Indicator */}
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 ring-1 ring-blue-400/40">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5 leading-none">
              <span className="font-bold text-xs text-white tracking-tight">Aura Counselor</span>
              <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Live
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400 font-medium">
              <ContextIcon className={`w-3 h-3 ${meta.color}`} />
              <span className="truncate max-w-[170px]">{meta.label}</span>
            </div>
          </div>
        </div>

        {/* Header Action Controls */}
        <div className="flex items-center space-x-1">
          {/* Copy Full Chat Transcript */}
          <button
            onClick={handleCopyFullChat}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
              isAllCopied
                ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
            }`}
            title="Copy entire chat conversation (prompts & responses)"
          >
            {isAllCopied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Toggle Width (Half vs Standard) */}
          {onToggleWidth && (
            <button
              onClick={onToggleWidth}
              className="p-1.5 text-gray-400 hover:text-gray-100 hover:bg-gray-800 rounded-lg transition-colors"
              title={isHalfWidth ? 'Switch to Standard Width (35%)' : 'Switch to 50/50 Split View'}
            >
              <Columns className={`w-3.5 h-3.5 ${isHalfWidth ? 'text-blue-400' : ''}`} />
            </button>
          )}

          {/* Clear Chat */}
          <button
            onClick={clearChat}
            className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-gray-800 rounded-lg transition-colors"
            title="Reset Chat Session"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Collapse Sidebar Button */}
          {onCollapse && (
            <button
              onClick={onCollapse}
              className="p-1.5 text-gray-400 hover:text-gray-100 hover:bg-gray-800 rounded-lg transition-colors"
              title="Collapse Aura Counselor (Full Screen for Active Tool)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Context Action Pills Grid: 3 on top, 3 below */}
      <div className="px-3 py-2 bg-gray-900/60 border-b border-gray-800/80 shrink-0">
        <div className="grid grid-cols-3 gap-1.5">
          {meta.pills.map((pill, idx) => {
            const isTimeline = pill.action === 'fix_timeline';
            return (
              <button
                key={idx}
                onClick={() => handlePillClick(pill)}
                title={pill.prompt}
                className={`px-2 py-1.5 text-[10px] font-medium rounded-lg border transition-all flex items-center justify-center gap-1 text-center cursor-pointer active:scale-95 shadow-2xs ${
                  isTimeline
                    ? 'bg-amber-950/40 border-amber-500/40 text-amber-200 hover:bg-amber-900/60 hover:text-white font-semibold'
                    : 'bg-gray-950/80 hover:bg-gray-800 text-gray-300 hover:text-white border-gray-800/90 hover:border-gray-700'
                }`}
              >
                {isTimeline ? (
                  <Calendar className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                ) : (
                  <Sparkles className="w-2.5 h-2.5 text-amber-400/80 shrink-0" />
                )}
                <span className="truncate">{pill.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages Scroll Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar">
        {messages.map((msg) => (
          <MessageItem key={msg.id} message={msg} />
        ))}
        {isStreaming && (
          <div className="flex items-center space-x-2 text-xs text-blue-400 p-2 font-mono animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Aura Agent is reasoning and compiling vault tools...</span>
          </div>
        )}
        {isUploadingResume && (
          <div className="flex items-center space-x-2 text-xs text-amber-400 p-2 font-mono animate-pulse bg-amber-950/20 border border-amber-500/30 rounded-xl">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Extracting career timeline & verifying gap phase from resume...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 border-t border-gray-800 bg-gray-900/60 shrink-0">
        <div className="flex items-end space-x-2 bg-gray-900 border border-gray-800 focus-within:border-blue-500 rounded-2xl p-2 transition-all shadow-lg">
          {/* Hidden File Input for Resume Upload */}
          <input
            type="file"
            ref={resumeFileInputRef}
            onChange={handleResumeFileSelected}
            accept=".pdf,.docx,.txt"
            className="hidden"
          />

          {/* Upload Resume Attachment Button */}
          <button
            type="button"
            onClick={() => resumeFileInputRef.current?.click()}
            disabled={isUploadingResume || isStreaming}
            title="Upload CV / Resume to extract timeline and gap phase"
            className="p-2 rounded-xl text-gray-400 hover:text-amber-300 hover:bg-gray-800 transition-all shrink-0 cursor-pointer"
          >
            {isUploadingResume ? (
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
          </button>

          {/* Text Input Area */}
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Aura anything (CV edits, story updates, code hints, strategy)..."
            rows={2}
            className="flex-1 bg-transparent border-0 text-xs text-gray-100 placeholder-gray-500 focus:ring-0 focus:outline-none resize-none px-2 py-1 max-h-28 leading-relaxed font-sans"
          />

          {/* AI Polish Button */}
          {inputText.trim().length > 0 && (
            <button
              type="button"
              onClick={handlePolish}
              disabled={isPolishing}
              title="Fix misheard voice words & technical terms using AI"
              className="px-2 py-1.5 rounded-xl text-[11px] font-semibold flex items-center gap-1 bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 border border-purple-500/30 transition-all shrink-0 cursor-pointer shadow-sm"
            >
              {isPolishing ? (
                <Loader2 className="w-3 h-3 animate-spin text-purple-300" />
              ) : (
                <Sparkles className="w-3 h-3 text-purple-400" />
              )}
              <span className="hidden sm:inline">Polish</span>
            </button>
          )}

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!inputText.trim() || isStreaming || isPolishing || isUploadingResume}
            className={`p-2 rounded-xl transition-all flex items-center justify-center shrink-0 ${
              inputText.trim() && !isStreaming && !isPolishing && !isUploadingResume
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 cursor-pointer'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
            title="Send Message (Enter)"
          >
            {isStreaming ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Keyboard shortcut hint */}
        <div className="flex items-center justify-between text-[10px] text-gray-500 px-2 mt-1.5">
          <span className="flex items-center gap-1">
            <Keyboard className="w-3 h-3 text-gray-400" /> <strong className="text-gray-400">Win + H</strong> for voice dictation
          </span>
          <span>Enter to send · Shift+Enter for newline</span>
        </div>
      </div>
    </div>
  );
};
