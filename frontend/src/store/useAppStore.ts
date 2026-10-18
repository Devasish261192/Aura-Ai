import { create } from 'zustand';
import type { ChatMessage, ArtifactsMap, AuthUser } from '../types';
import { API_BASE } from '../config';

export type AppModule = 'landing' | 'traits' | 'cvforge' | 'trainer' | 'interview' | 'tracker' | 'jobs';

export const getWelcomeMessage = (user: AuthUser | null): ChatMessage => {
  const isAssigned = user?.is_assigned && user?.latest_role;
  const roleHint = isAssigned ? ` (Calibrated for **${user.latest_role}**)` : '';
  const greeting = user?.name ? `Hi **${user.name}**` : 'Welcome';
  return {
    id: 'welcome_1',
    role: 'model',
    content: `${greeting}! I am **Aura**, your autonomous career architect and intelligence partner${roleHint}.\n\nTogether, we will map your complete career trajectory from the ground up through 4 progressive stages:\n\n1. **Recent Role Calibration:** Pin your current or most recent job title and organization.\n2. **Skills, Tools & Daily Workflow:** Catalog your core domain skills, software/platforms used, and operational workflow.\n3. **Career Timeline Mapping:** Record all prior professional titles and organizations (from your career start to current) so your full Career Tree is plotted from day one. You can list them here or click **'Upload CV / Timeline'**.\n4. **Targeted Story Mining (STARR):** Capture high-impact, verified achievement stories role by role.\n\nTo begin: **What is your most recent organization, and what was your exact professional job title there?**`,
    createdAt: new Date().toISOString()
  };
};

let storedUser: AuthUser | null = null;
try {
  const raw = localStorage.getItem('aura_current_user');
  if (raw) {
    storedUser = JSON.parse(raw);
  }
} catch {
  storedUser = null;
}

interface AppState {
  currentUser: AuthUser | null;
  messages: ChatMessage[];
  isStreaming: boolean;
  currentToolEvents: Array<{ tool: string; args: Record<string, any> }>;
  artifacts: ArtifactsMap | null;
  activeProfileTab: string;
  activeModule: AppModule;
  isChatCollapsed: boolean;
  testers: AuthUser[];
  
  // Actions
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  fetchTesters: () => Promise<void>;
  updateTesterRole: (role: string, company?: string, candidateName?: string) => Promise<boolean>;
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

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: storedUser,
  messages: [getWelcomeMessage(storedUser)],
  isStreaming: false,
  currentToolEvents: [],
  artifacts: null,
  activeProfileTab: '',
  activeModule: 'traits',
  isChatCollapsed: false,
  testers: [],

  login: async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) return false;
      const data = await res.json();
      if (data.status === 'success' && data.user) {
        localStorage.setItem('aura_current_user', JSON.stringify(data.user));
        set({
          currentUser: data.user,
          messages: [getWelcomeMessage(data.user)],
          artifacts: null
        });
        await get().fetchArtifacts();
        await get().fetchChatHistory();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('aura_current_user');
    set({
      currentUser: null,
      artifacts: null,
      messages: [getWelcomeMessage(null)]
    });
  },

  fetchTesters: async () => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/testers`);
      if (res.ok) {
        const data = await res.json();
        set({ testers: data });
      }
    } catch (e) {
      console.error('Failed to fetch testers:', e);
    }
  },

  updateTesterRole: async (role: string, company?: string, candidateName?: string) => {
    try {
      const user = get().currentUser?.username || 'user1';
      const res = await fetch(`${API_BASE}/api/auth/update-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user
        },
        body: JSON.stringify({
          role,
          company: company || '',
          candidate_name: candidateName || ''
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          localStorage.setItem('aura_current_user', JSON.stringify(data.user));
          set({ currentUser: data.user });
          await get().fetchArtifacts();
          await get().fetchTesters();
          return true;
        }
      }
      return false;
    } catch (e) {
      console.error('Failed to update tester role:', e);
      return false;
    }
  },

  setActiveModule: (m) => set({ activeModule: m }),
  setActiveProfileTab: (tab) => set({ activeProfileTab: tab }),
  toggleChatCollapse: () => set((state) => ({ isChatCollapsed: !state.isChatCollapsed })),
  setChatCollapsed: (collapsed) => set({ isChatCollapsed: collapsed }),
  clearChat: () => set((state) => ({ messages: [getWelcomeMessage(state.currentUser)] })),

  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),

  fetchArtifacts: async () => {
    try {
      const user = get().currentUser?.username || 'user1';
      const res = await fetch(`${API_BASE}/api/artifacts`, {
        headers: {
          'X-User-Id': user
        }
      });
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
      const user = get().currentUser?.username || 'user1';
      const res = await fetch(`${API_BASE}/api/chat/history?session_id=${encodeURIComponent(user)}`, {
        headers: {
          'X-User-Id': user
        }
      });
      if (res.ok) {
        const data = await res.json();
        const welcomeMsg = getWelcomeMessage(get().currentUser);
        if (Array.isArray(data) && data.length > 0) {
          const loadedMessages: ChatMessage[] = data.map((item: any) => ({
            id: `msg_${item.id}`,
            role: item.role === 'user' ? 'user' : 'model',
            content: item.content,
            toolCalls: item.tool_calls || undefined,
            isVoice: Boolean(item.is_voice),
            createdAt: item.created_at || new Date().toISOString()
          }));

          set({ messages: [welcomeMsg, ...loadedMessages] });
        } else {
          set({ messages: [welcomeMsg] });
        }
      }
    } catch (e) {
      console.error('Failed to fetch chat history:', e);
    }
  },

  sendMessage: async (content: string, isVoice = false) => {
    if (!content.trim() || get().isStreaming) return;

    const user = get().currentUser?.username || 'user1';

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
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Id': user
        },
        body: JSON.stringify({
          message: content,
          session_id: user,
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
