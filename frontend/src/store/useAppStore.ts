import { create } from 'zustand';
import type { ChatMessage, ArtifactsMap } from '../types';

export type AppModule = 'traits' | 'cvforge' | 'trainer' | 'interview' | 'tracker' | 'jobs';

interface AppState {
  messages: ChatMessage[];
  isStreaming: boolean;
  currentToolEvents: Array<{ tool: string; args: Record<string, any> }>;
  artifacts: ArtifactsMap | null;
  activeProfileTab: string;
  activeModule: AppModule;
  isChatCollapsed: boolean;
  
  // Actions
  addMessage: (msg: ChatMessage) => void;
  fetchArtifacts: () => Promise<void>;
  fetchChatHistory: () => Promise<void>;
  sendMessage: (content: string, isVoice?: boolean) => Promise<void>;
  setActiveProfileTab: (tab: string) => void;
  setActiveModule: (m: AppModule) => void;
  toggleChatCollapse: () => void;
  setChatCollapsed: (collapsed: boolean) => void;
  clearChat: () => void;
}

import { API_BASE } from '../config';

export const useAppStore = create<AppState>((set, get) => ({
  messages: [
    {
      id: 'welcome_1',
      role: 'model',
      content: "Hi, I am **Aura**, your career personal assistant.\n\nTogether, we will map out your career roadmap, turn your real experience into powerful stories, and guide your growth step-by-step.\n\n### How We Will Work Together:\n1. **One Point at a Time:** We build each story step-by-step (Situation → Plan → Execution → Result). You never have to narrate the whole story at once.\n2. **Effortless & Conversational:** Speak or type naturally—I handle the structuring and metrics extraction.\n3. **Permanent Vault:** Every detail you share is saved directly into your personal career vault.\n\nTo begin: **What is your most recent organization, and at what professional role did you work there?**",
      createdAt: new Date().toISOString()
    }
  ],
  isStreaming: false,
  currentToolEvents: [],
  artifacts: null,
  activeProfileTab: '',
  activeModule: 'traits',
  isChatCollapsed: false,

  setActiveModule: (m) => set({ activeModule: m }),
  setActiveProfileTab: (tab) => set({ activeProfileTab: tab }),
  toggleChatCollapse: () => set((state) => ({ isChatCollapsed: !state.isChatCollapsed })),
  setChatCollapsed: (collapsed) => set({ isChatCollapsed: collapsed }),
  clearChat: () => set((state) => ({ messages: [state.messages[0]] })),

  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),

  fetchArtifacts: async () => {
    try {
      const res = await fetch(`${API_BASE}/api/artifacts`);
      if (res.ok) {
        const data = await res.json();
        set({ artifacts: data });
      }
    } catch (e) {
      console.error('Failed to fetch artifacts:', e);
    }
  },

  fetchChatHistory: async () => {
    try {
      const res = await fetch(`${API_BASE}/api/chat/history?session_id=default_session`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const loadedMessages: ChatMessage[] = data.map((item: any) => ({
            id: `msg_${item.id}`,
            role: item.role === 'user' ? 'user' : 'model',
            content: item.content,
            toolCalls: item.tool_calls || undefined,
            isVoice: Boolean(item.is_voice),
            createdAt: item.created_at || new Date().toISOString()
          }));

          const welcomeMsg = get().messages[0];
          set({ messages: [welcomeMsg, ...loadedMessages] });
        }
      }
    } catch (e) {
      console.error('Failed to fetch chat history:', e);
    }
  },

  sendMessage: async (content: string, isVoice = false) => {
    if (!content.trim() || get().isStreaming) return;

    const userMessage: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content,
      isVoice,
      createdAt: new Date().toISOString()
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
      isStreaming: true,
      currentToolEvents: []
    }));

    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          session_id: 'default_session',
          is_voice: isVoice
        })
      });

      if (!response.body) throw new Error('ReadableStream not supported.');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let partialChunk = '';
      let accumulatedText = '';
      const executedTools: Array<{ tool: string; args: any }> = [];

      const botMessageId = `bot_${Date.now()}`;
      // Add empty bot placeholder
      set((state) => ({
        messages: [
          ...state.messages,
          {
            id: botMessageId,
            role: 'model',
            content: '',
            toolCalls: [],
            createdAt: new Date().toISOString()
          }
        ]
      }));

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        partialChunk += decoder.decode(value, { stream: true });
        const lines = partialChunk.split('\n\n');
        partialChunk = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'token') {
                accumulatedText += data.content;
                set((state) => ({
                  messages: state.messages.map((m) =>
                    m.id === botMessageId ? { ...m, content: accumulatedText } : m
                  )
                }));
              } else if (data.type === 'tool_executed') {
                executedTools.push({ tool: data.tool, args: data.args });
                set((state) => ({
                  currentToolEvents: [...state.currentToolEvents, { tool: data.tool, args: data.args }],
                  messages: state.messages.map((m) =>
                    m.id === botMessageId ? { ...m, toolCalls: executedTools.map(t => ({ name: t.tool, args: t.args })) } : m
                  )
                }));
                // Re-fetch artifacts to reflect deterministic state change
                get().fetchArtifacts();
              } else if (data.type === 'done') {
                set((state) => ({
                  messages: state.messages.map((m) =>
                    m.id === botMessageId ? { ...m, content: data.full_content || accumulatedText } : m
                  )
                }));
              }
            } catch (err) {
              console.warn('Error parsing SSE event:', err);
            }
          }
        }
      }
    } catch (err: any) {
      console.error('Chat stream error:', err);
      set((state) => ({
        messages: [
          ...state.messages,
          {
            id: `err_${Date.now()}`,
            role: 'model',
            content: `Error: Unable to connect to backend server. Make sure FastAPI is running on port 8000. (${err.message})`,
            createdAt: new Date().toISOString()
          }
        ]
      }));
    } finally {
      set({ isStreaming: false });
      // Final artifacts refresh
      get().fetchArtifacts();
    }
  }
}));
