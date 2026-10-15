import React, { useMemo, useState } from 'react';
import { User, Sparkles, Mic, CheckCircle2, Database, Copy, Check } from 'lucide-react';
import type { ChatMessage } from '../../types';
import { marked } from 'marked';

interface MessageItemProps {
  message: ChatMessage;
}

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
    <div className={`flex gap-3.5 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-5 group`}>
      {/* Avatar */}
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
          isUser
            ? 'bg-blue-600 text-white shadow-blue-500/20'
            : 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-purple-500/20'
        }`}
      >
        {isUser ? <User className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
      </div>

      {/* Bubble Container */}
      <div className={`max-w-[85%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Meta Bar with Copy Button */}
        <div className={`flex items-center gap-2 text-[11px] text-gray-400 mb-1 px-1 w-full ${isUser ? 'justify-end' : 'justify-between'}`}>
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-300">
              {isUser ? 'You' : 'Aura Counselor'}
            </span>
            {message.isVoice && (
              <span className="inline-flex items-center gap-1 bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/20 font-medium">
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
                ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 font-medium'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/80 border border-transparent'
            }`}
            title={isUser ? "Copy your message" : "Copy Aura response"}
          >
            {isCopied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-gray-400 group-hover:text-gray-300" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Tool Execution Chips (Deterministic Confirmation) */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="w-full mb-2 space-y-1.5">
            {message.toolCalls.map((tc, idx) => (
              <div
                key={idx}
                className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs px-3 py-2 rounded-xl flex items-center space-x-2 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-mono font-medium">
                  Verified Tool Executed: <strong className="text-white">{tc.name}</strong>
                </span>
                {tc.args?.title && (
                  <span className="text-emerald-200 truncate">
                    — "{tc.args.title}"
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Message Bubble with Rendered Markdown and Selection */}
        <div
          className={`p-4 rounded-2xl text-sm leading-relaxed select-text relative ${
            isUser
              ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-600/10 selection:bg-blue-900 selection:text-white'
              : 'bg-gray-900 border border-gray-800 text-gray-200 rounded-tl-none shadow-sm selection:bg-blue-500/30 selection:text-white'
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
