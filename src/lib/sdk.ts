import axios, { AxiosInstance } from 'axios';
import { SessionSummary, Message, PermissionRequest, DiffHunk } from '../types';

/**
 * ENI Mobile OpenCode client
 * Hardened for personal red-team use:
 * - aggressive timeouts
 * - normalizes multiple server response shapes
 * - clean permission + stream surface
 * - no logging of sensitive payloads
 */
export class OpenCodeClient {
  private http: AxiosInstance;
  private baseUrl: string;
  private authHeader?: string;

  constructor(baseUrl: string, username?: string, password?: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    if (username && password) {
      this.authHeader = 'Basic ' + btoa(`${username}:${password}`);
    }

    this.http = axios.create({
      baseURL: this.baseUrl,
      timeout: 20000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(this.authHeader ? { Authorization: this.authHeader } : {}),
      },
    });
  }

  private normalizeStatus(s: any): SessionSummary['status'] {
    const raw = (s?.status || s?.state || 'idle').toLowerCase();
    if (raw.includes('run') || raw.includes('active') || raw.includes('stream')) return 'running';
    if (raw.includes('wait') || raw.includes('pending') || raw.includes('permission')) return 'waiting';
    if (raw.includes('err') || raw.includes('fail')) return 'error';
    if (raw.includes('done') || raw.includes('complete')) return 'completed';
    return 'idle';
  }

  async health(): Promise<{ healthy: boolean; version?: string; uptime?: number }> {
    try {
      const { data } = await this.http.get('/health');
      return {
        healthy: data?.healthy ?? data?.ok ?? true,
        version: data?.version,
        uptime: data?.uptime,
      };
    } catch {
      // some servers use /api/health or root
      try {
        const { data } = await this.http.get('/api/health');
        return { healthy: !!data, version: data?.version };
      } catch {
        return { healthy: false };
      }
    }
  }

  async listSessions(): Promise<SessionSummary[]> {
    const endpoints = ['/sessions', '/api/sessions', '/v1/sessions'];
    let data: any = null;
    for (const ep of endpoints) {
      try {
        const res = await this.http.get(ep);
        data = res.data;
        break;
      } catch {
        continue;
      }
    }
    if (!data) return [];

    const list = Array.isArray(data)
      ? data
      : data?.sessions ?? data?.data ?? data?.items ?? [];

    return list.map((s: any) => ({
      id: String(s.id ?? s.session_id ?? s.uuid ?? ''),
      title: s.title ?? s.name ?? s.summary ?? (s.id ? String(s.id).slice(0, 10) : 'untitled'),
      project: s.project ?? s.workspace ?? s.cwd ?? s.path,
      status: this.normalizeStatus(s),
      updatedAt: Number(s.updated_at ?? s.updatedAt ?? s.modified ?? Date.now()),
      model: s.model ?? s.model_id,
      agent: s.agent ?? s.agent_id,
    })).filter((s: SessionSummary) => !!s.id);
  }

  async getSession(id: string): Promise<{ messages: Message[]; meta?: any }> {
    const endpoints = [`/sessions/${id}`, `/api/sessions/${id}`, `/v1/sessions/${id}`];
    let data: any = null;
    for (const ep of endpoints) {
      try {
        const res = await this.http.get(ep);
        data = res.data;
        break;
      } catch {
        continue;
      }
    }
    if (!data) return { messages: [] };

    const raw = data?.messages ?? data?.transcript ?? data?.history ?? data?.data?.messages ?? [];
    const messages: Message[] = (Array.isArray(raw) ? raw : []).map((m: any, i: number) => {
      let content = '';
      if (typeof m.content === 'string') content = m.content;
      else if (Array.isArray(m.content)) {
        content = m.content
          .map((c: any) => (typeof c === 'string' ? c : c?.text ?? c?.content ?? ''))
          .join('');
      } else if (m.content && typeof m.content === 'object') {
        content = m.content.text ?? m.content.content ?? JSON.stringify(m.content);
      } else {
        content = m.text ?? m.message ?? '';
      }

      return {
        id: String(m.id ?? m.message_id ?? `msg-${i}`),
        role: (m.role ?? m.type ?? 'assistant') as Message['role'],
        content,
        createdAt: Number(m.created_at ?? m.timestamp ?? m.createdAt ?? Date.now()),
        toolName: m.tool_name ?? m.tool ?? m.name,
        toolStatus: m.tool_status ?? m.status,
        toolInput: m.input ?? m.args ?? m.arguments,
        toolOutput: m.output ?? m.result,
      };
    });

    return { messages, meta: data };
  }

  async sendPrompt(
    sessionId: string,
    prompt: string,
    opts?: { model?: string; agent?: string; stream?: boolean }
  ) {
    const body = { prompt, message: prompt, content: prompt, ...opts };
    const endpoints = [
      `/sessions/${sessionId}/prompt`,
      `/sessions/${sessionId}/messages`,
      `/api/sessions/${sessionId}/prompt`,
      `/v1/sessions/${sessionId}/chat`,
    ];
    for (const ep of endpoints) {
      try {
        const { data } = await this.http.post(ep, body);
        return data;
      } catch {
        continue;
      }
    }
    throw new Error('No working prompt endpoint');
  }

  async createSession(opts?: { project?: string; title?: string; model?: string }) {
    const endpoints = ['/sessions', '/api/sessions', '/v1/sessions'];
    for (const ep of endpoints) {
      try {
        const { data } = await this.http.post(ep, opts ?? {});
        return data;
      } catch {
        continue;
      }
    }
    throw new Error('Could not create session');
  }

  async stopSession(sessionId: string) {
    const endpoints = [
      `/sessions/${sessionId}/stop`,
      `/sessions/${sessionId}/cancel`,
      `/api/sessions/${sessionId}/stop`,
    ];
    for (const ep of endpoints) {
      try {
        await this.http.post(ep, {});
        return true;
      } catch {
        continue;
      }
    }
    return false;
  }

  async approveTool(
    permissionId: string,
    decision: 'approve' | 'deny' | 'edit',
    edit?: any
  ) {
    const endpoints = [
      `/permissions/${permissionId}`,
      `/api/permissions/${permissionId}`,
      `/tools/${permissionId}/decision`,
    ];
    const body = { decision, action: decision, edit, approved: decision === 'approve' };
    for (const ep of endpoints) {
      try {
        const { data } = await this.http.post(ep, body);
        return data;
      } catch {
        continue;
      }
    }
    throw new Error('Permission endpoint failed');
  }

  /** Returns the best-guess SSE / events URL for a session */
  getStreamUrl(sessionId: string): string {
    return `${this.baseUrl}/sessions/${sessionId}/events`;
  }

  getAuthHeader(): string | undefined {
    return this.authHeader;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }
}

export function createClient(baseUrl: string, username?: string, password?: string) {
  return new OpenCodeClient(baseUrl, username, password);
}
