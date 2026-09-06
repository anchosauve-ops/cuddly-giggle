export interface ConnectionProfile {
  id: string;
  name: string;
  baseUrl: string;
  username?: string;
  createdAt: number;
  lastUsedAt?: number;
  isDefault?: boolean;
}

export interface SessionSummary {
  id: string;
  title: string;
  project?: string;
  status: 'idle' | 'running' | 'waiting' | 'error' | 'completed';
  updatedAt: number;
  model?: string;
  agent?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  createdAt: number;
  toolName?: string;
  toolStatus?: 'pending' | 'approved' | 'denied' | 'running' | 'done';
  toolInput?: any;
  toolOutput?: string;
}

export interface PermissionRequest {
  id: string;
  tool: string;
  description: string;
  risk?: 'low' | 'medium' | 'high';
  input?: any;
}

export interface DiffHunk {
  id: string;
  file: string;
  oldStart: number;
  newStart: number;
  lines: DiffLine[];
}

export interface DiffLine {
  type: 'context' | 'add' | 'remove';
  content: string;
  oldNum?: number;
  newNum?: number;
}

export interface LocalNote {
  id: string;
  sessionId: string;
  text: string;
  createdAt: number;
  sensitive?: boolean;
}

export type AppScreen = 'sessions' | 'chat' | 'terminal' | 'files' | 'settings';
