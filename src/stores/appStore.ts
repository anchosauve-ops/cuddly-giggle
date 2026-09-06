import { create } from 'zustand';
import {
  ConnectionProfile,
  SessionSummary,
  Message,
  PermissionRequest,
  LocalNote,
} from '../types';

interface AppState {
  profiles: ConnectionProfile[];
  activeProfileId: string | null;
  isConnected: boolean;
  connectionError: string | null;
  lastHealthAt: number | null;

  sessions: SessionSummary[];
  activeSessionId: string | null;
  messages: Message[];
  isStreaming: boolean;

  pendingPermission: PermissionRequest | null;

  notes: LocalNote[];

  biometricEnabled: boolean;
  smallFont: boolean;
  darkMode: boolean;
  autoRefreshMs: number;

  setProfiles: (p: ConnectionProfile[]) => void;
  setActiveProfile: (id: string | null) => void;
  setConnected: (v: boolean, err?: string | null) => void;
  setLastHealth: (ts: number) => void;
  setSessions: (s: SessionSummary[]) => void;
  setActiveSession: (id: string | null) => void;
  setMessages: (m: Message[]) => void;
  appendMessage: (m: Message) => void;
  updateLastAssistant: (content: string) => void;
  patchMessage: (id: string, patch: Partial<Message>) => void;
  setStreaming: (v: boolean) => void;
  setPendingPermission: (p: PermissionRequest | null) => void;
  setBiometric: (v: boolean) => void;
  addNote: (note: LocalNote) => void;
  removeNote: (id: string) => void;
  clearNotesForSession: (sessionId: string) => void;
  wipeLocal: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  profiles: [],
  activeProfileId: null,
  isConnected: false,
  connectionError: null,
  lastHealthAt: null,

  sessions: [],
  activeSessionId: null,
  messages: [],
  isStreaming: false,

  pendingPermission: null,

  notes: [],

  biometricEnabled: true,
  smallFont: true,
  darkMode: true,
  autoRefreshMs: 12000,

  setProfiles: (profiles) => set({ profiles }),
  setActiveProfile: (id) => set({ activeProfileId: id }),
  setConnected: (isConnected, connectionError = null) =>
    set({ isConnected, connectionError }),
  setLastHealth: (ts) => set({ lastHealthAt: ts }),
  setSessions: (sessions) => set({ sessions }),
  setActiveSession: (id) => set({ activeSessionId: id }),
  setMessages: (messages) => set({ messages }),
  appendMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
  updateLastAssistant: (content) =>
    set((s) => {
      const msgs = [...s.messages];
      for (let i = msgs.length - 1; i >= 0; i--) {
        if (msgs[i].role === 'assistant') {
          msgs[i] = { ...msgs[i], content };
          break;
        }
      }
      return { messages: msgs };
    }),
  patchMessage: (id, patch) =>
    set((s) => ({
      messages: s.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    })),
  setStreaming: (isStreaming) => set({ isStreaming }),
  setPendingPermission: (pendingPermission) => set({ pendingPermission }),
  setBiometric: (biometricEnabled) => set({ biometricEnabled }),
  addNote: (note) => set((s) => ({ notes: [...s.notes, note] })),
  removeNote: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),
  clearNotesForSession: (sessionId) =>
    set((s) => ({ notes: s.notes.filter((n) => n.sessionId !== sessionId) })),
  wipeLocal: () =>
    set({
      messages: [],
      notes: [],
      pendingPermission: null,
      sessions: [],
    }),
}));
