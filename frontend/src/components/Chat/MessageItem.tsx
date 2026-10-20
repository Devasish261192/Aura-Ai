import React, { useMemo, useState } from 'react';
import { User, Sparkles, Mic, CheckCircle2, Copy, Check } from 'lucide-react';
import type { ChatMessage } from '../../types';
import { marked } from 'marked';

interface MessageItemProps {
  message: ChatMessage;
}

const formatToolLabel = (name: string, args: any) => {
  switch (name) {
    case 'save_work_experience_entry':
      return args?.company ? `Saved: ${args?.role || 'Job'} at ${args.company}` : `Saved job to profile`;
    case 'save_career_story_entry':
      return args?.title ? `Saved work win: "${args.title}"` : `Saved work story`;
    case 'edit_career_story':
      return `Updated work story details`;
    case 'add_skills':
      return `Saved skills to profile`;
    case 'update_candidate_traits':
      return `Updated strengths & goals`;
    case 'modify_cv_forge_resume':
      return `Updated resume content`;
    case 'search_live_jobs_serp':
      return `Searched open jobs in ${args?.location || 'India'}`;
    case 'tailor_resume_to_job_description':
      return `Tailored resume for job description`;
    default:
      return `Saved to profile`;
  }
};

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const [isCopied, setIsCopied] = useState(false);

  const htmlContent = useMemo(() => {
    if (!message.content) return '';
    try {
      return marked.parse(message.content, { gfm: true, breaks: true });
    } catch (e) {
      return message.content;
    }
  }, [message.content]);

  const handleCopy = async () => {
    if (!message.content) return;
    try {
      await navigator.clipboard.writeText(message.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  return (
    <div className={`flex gap-3.5 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-4 group`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
      </div>

      {/* Bubble Container */}
      <div className={`max-w-[85%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Meta Bar with Copy Button */}
        <div className={`flex items-center gap-2 text-[11px] text-slate-500 mb-1 px-1 w-full ${isUser ? 'justify-end' : 'justify-between'}`}>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-700">
              {isUser ? 'You' : 'Aura Coach'}
            </span>
            {message.isVoice && (
              <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200 font-medium">
                <Mic className="w-3 h-3" /> Voice Dictated
              </span>
            )}
          </div>

          {/* 1-Click Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md transition-all cursor-pointer ${
              isCopied
                ? 'text-emerald-700 bg-emerald-50 border border-emerald-200 font-medium'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-transparent'
            }`}
            title={isUser ? "Copy your message" : "Copy response"}
          >
            {isCopied ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Friendly Action Confirmation Chips */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="w-full mb-2 space-y-1.5">
            {message.toolCalls.map((tc, idx) => (
              <div
                key={idx}
                className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3 py-1.5 rounded-xl flex items-center space-x-2 shadow-2xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="font-medium">
                  {formatToolLabel(tc.name, tc.args)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Message Bubble with Rendered Markdown */}
        <div
          className={`p-3.5 rounded-2xl text-sm leading-relaxed select-text relative shadow-xs ${
            isUser
              ? 'bg-blue-600 text-white rounded-tr-none'
              : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
          }`}
        >
          <div
            className="markdown-content select-text"
            dangerouslySetInnerHTML={{ __html: htmlContent as string }}
          />
        </div>
      </div>
    </div>
  );
};
