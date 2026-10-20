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
  const { messages, isStreaming, sendMessage, clearChat, addMessage, fetchArtifacts, currentUser } = useAppStore();
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

      const res = await fetch(`${API_BASE}/api/resume/parse-cv?auto_save=true`, {
        method: 'POST',
        headers: {
          'X-User-Id': currentUser?.username || 'user1'
        },
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

      reply += `\n*Your Canonical Vault (Timeline, Traits, and Career Tree) has been synchronized with this unbroken timeline.*`;

      addMessage({
        id: `ai_${Date.now()}`,
        role: 'model',
        content: reply,
        createdAt: new Date().toISOString()
      });

      await fetchArtifacts();
      await useAppStore.getState().fetchTesters();
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

  // Module contextual label & friendly action pills
  const getContextMeta = () => {
    switch (activeModule) {
      case 'cvforge':
        return {
          label: 'Resume Builder · Live Advice',
          icon: Layers,
          color: 'text-indigo-600',
          pills: [
            { label: 'Polish Summary', prompt: 'Please review and polish my resume summary to make it simple, clear, and professional.', immediate: true },
            { label: 'Highlight Skills', prompt: 'In my resume, please highlight my top daily tools and strongest practical skills.', immediate: true },
            { label: 'Check ATS Match', prompt: 'Check my resume to make sure employers and recruiters can read it easily.', immediate: true },
            { label: 'Upload CV', prompt: 'I want to upload my CV to fill in my work timeline automatically.', action: 'fix_timeline' },
            { label: 'Add Achievement', prompt: 'In my resume, please add this new achievement to my experience: ', immediate: false },
            { label: 'Refresh Resume', prompt: 'Please update my resume with my latest saved profile details.', immediate: true }
          ]
        };
      case 'trainer':
        return {
          label: 'Interview Practice · Questions',
          icon: GraduationCap,
          color: 'text-violet-600',
          pills: [
            { label: 'Common Questions', prompt: 'Ask me 3 common interview questions for my job role, one by one.', immediate: true },
            { label: 'Tell Me About Yourself', prompt: 'How should I introduce myself when the interviewer says: Tell me about yourself?', immediate: true },
            { label: 'Tough Questions', prompt: 'What are tricky questions interviewers ask, and how can I answer them calmly?', immediate: true },
            { label: 'Upload CV', prompt: 'I want to upload my CV to update my timeline.', action: 'fix_timeline' },
            { label: 'Salary Discussion', prompt: 'How should I answer when an interviewer asks: What is your salary expectation?', immediate: true },
            { label: 'Explain Work Gap', prompt: 'How should I politely explain a break or gap between jobs?', immediate: true }
          ]
        };
      case 'interview':
        return {
          label: 'Pitch Studio · Self Introduction',
          icon: Code2,
          color: 'text-purple-600',
          pills: [
            { label: 'Check My Pitch', prompt: 'Can you critique how I introduce myself and suggest 2 simple ways to make it sound better?', immediate: true },
            { label: 'Mock Interviewer', prompt: 'Please act as a kind hiring manager and ask me one friendly question.', immediate: true },
            { label: 'Explain Career Shift', prompt: 'How do I explain moving from my past job to my next target role in simple words?', immediate: true },
            { label: 'Upload CV', prompt: 'I want to upload my CV.', action: 'fix_timeline' },
            { label: 'Speaking Tips', prompt: 'Give me 3 quick tips to sound confident and relaxed during an interview.', immediate: true },
            { label: 'Script for My Win', prompt: 'Write me a 30-second script about my proudest work achievement that I can read out loud.', immediate: true }
          ]
        };
      case 'tracker':
        return {
          label: 'My Goals · Daily Checklist',
          icon: Gamepad2,
          color: 'text-amber-600',
          pills: [
            { label: "Today's Checklist", prompt: 'What are 3 simple actions I should take today to move my job search forward?', immediate: true },
            { label: 'Application Pace', prompt: 'How many jobs should I apply to each week to get good interview calls?', immediate: true },
            { label: 'Daily Review', prompt: 'Help me review the progress I made today.', immediate: true },
            { label: 'Upload CV', prompt: 'I want to upload my CV.', action: 'fix_timeline' },
            { label: 'Follow Up Tips', prompt: 'What is a polite message to send a recruiter after applying for a job?', immediate: true },
            { label: 'Next Best Step', prompt: 'What is the single best thing I should do next right now?', immediate: true }
          ]
        };
      case 'jobs':
        return {
          label: 'Find Jobs · Match & Apply',
          icon: Briefcase,
          color: 'text-sky-600',
          pills: [
            { label: 'Search All India', prompt: 'Search top open jobs across India that match my skills and background.', immediate: true },
            { label: 'Search in My City', prompt: 'Find open jobs matching my role in my city: ', immediate: false },
            { label: 'Tailor to a Job', prompt: 'Here is a job description. Please tailor my resume for it: ', immediate: false },
            { label: 'Upload CV', prompt: 'I want to upload my CV.', action: 'fix_timeline' },
            { label: 'Company Location', prompt: 'How can I check the company office location on Google Maps?', immediate: true },
            { label: 'Referral Message', prompt: 'Write me a short, friendly message to ask an employee for a job referral.', immediate: true }
          ]
        };
      case 'traits':
      default:
        return {
          label: 'My Profile · Guided Coach',
          icon: Compass,
          color: 'text-emerald-600',
          pills: [
            { label: 'What is Saved?', prompt: 'What jobs, skills, and work stories do you have saved about me so far?', immediate: true },
            { label: 'Upload CV', prompt: 'I want to upload my CV to fill in my jobs automatically.', action: 'fix_timeline' },
            { label: 'Add a Work Story', prompt: 'I want to share a work win or story: ', immediate: false },
            { label: 'Add Daily Tools', prompt: 'I want to add the tools and software apps I use every day: ', immediate: false },
            { label: 'My Best Careers', prompt: 'What job roles and career paths fit my background best?', immediate: true },
            { label: 'Explain Work Break', prompt: 'How can we explain a break or gap in my career in a positive way?', immediate: true }
          ]
        };
    }
  };

  const meta = getContextMeta();
  const ContextIcon = meta.icon;

  return (
    <div className="flex flex-col h-full bg-white text-slate-800 selection:bg-blue-100 selection:text-blue-900">
      {/* Top Header Bar */}
      <div className="h-13 border-b border-slate-200 px-4 flex items-center justify-between shrink-0 bg-slate-50/90">
        {/* Agent Profile & Live Indicator */}
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-xs text-white">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5 leading-none">
              <span className="font-bold text-xs text-slate-900 tracking-tight">Aura Career Coach</span>
              <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Ready
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-500 font-medium">
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
                ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
            }`}
            title="Copy full conversation"
          >
            {isAllCopied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Toggle Width */}
          {onToggleWidth && (
            <button
              onClick={onToggleWidth}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
              title={isHalfWidth ? 'Standard Width' : '50/50 Split View'}
            >
              <Columns className={`w-3.5 h-3.5 ${isHalfWidth ? 'text-blue-600' : ''}`} />
            </button>
          )}

          {/* Clear Chat */}
          <button
            onClick={clearChat}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-200 rounded-lg transition-colors"
            title="Reset Chat"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Collapse Sidebar Button */}
          {onCollapse && (
            <button
              onClick={onCollapse}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
              title="Close Chat"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Context Action Pills Grid: 3 on top, 3 below */}
      <div className="px-3 py-2 bg-slate-50/60 border-b border-slate-200 shrink-0">
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
                    ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100 font-semibold'
                    : 'bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200 hover:border-slate-300'
                }`}
              >
                {isTimeline ? (
                  <Calendar className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                ) : (
                  <Sparkles className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                )}
                <span className="truncate">{pill.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages Scroll Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-slate-50/30">
        {messages.map((msg) => (
          <MessageItem key={msg.id} message={msg} />
        ))}
        {isStreaming && (
          <div className="flex items-center space-x-2 text-xs text-blue-600 p-2 font-medium animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Aura is typing your answer...</span>
          </div>
        )}
        {isUploadingResume && (
          <div className="flex items-center space-x-2 text-xs text-amber-700 p-2 font-medium animate-pulse bg-amber-50 border border-amber-200 rounded-xl">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Reading your CV and saving your work history...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 border-t border-slate-200 bg-white shrink-0">
        <div className="flex items-end space-x-2 bg-slate-50 border border-slate-300 focus-within:border-blue-500 focus-within:bg-white rounded-2xl p-2 transition-all shadow-xs">
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
            title="Upload CV / Resume to fill in your work history automatically"
            className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-slate-200 transition-all shrink-0 cursor-pointer"
          >
            {isUploadingResume ? (
              <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
          </button>

          {/* Text Input Area */}
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message to Aura (or share your job, skills, or questions)..."
            rows={2}
            className="flex-1 bg-transparent border-0 text-xs text-slate-900 placeholder-slate-400 focus:ring-0 focus:outline-none resize-none px-2 py-1 max-h-28 leading-relaxed font-sans"
          />

          {/* AI Polish Button */}
          {inputText.trim().length > 0 && (
            <button
              type="button"
              onClick={handlePolish}
              disabled={isPolishing}
              title="Clean up grammar and spelling using AI"
              className="px-2 py-1.5 rounded-xl text-[11px] font-semibold flex items-center gap-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-all shrink-0 cursor-pointer shadow-xs"
            >
              {isPolishing ? (
                <Loader2 className="w-3 h-3 animate-spin text-purple-600" />
              ) : (
                <Sparkles className="w-3 h-3 text-purple-600" />
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
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
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
        <div className="flex items-center justify-between text-[10px] text-slate-500 px-2 mt-1.5">
          <span className="flex items-center gap-1">
            <Keyboard className="w-3 h-3 text-slate-400" /> Press <strong className="text-slate-600">Enter</strong> to send
          </span>
          <span>Shift+Enter for a new line</span>
        </div>
      </div>
    </div>
  );
};
