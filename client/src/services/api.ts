import { Issue, Department, Category, WorkerInfo, AuditRecord, AnalyticsData, User } from '../types';

const API_BASE = `${import.meta.env.VITE_API_URL || ''}/api`;

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('smartcivic_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  // Auth
  async login(username: string, password: string):Promise<{ access: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Login failed. Please check your credentials.');
    }
    return res.json();
  },

  async googleLogin(data?: { email?: string; name?: string }): Promise<{ access: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/google/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data || {})
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Google sign-in failed');
    }
    return res.json();
  },

  async register(data: any): Promise<{ access: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Registration failed');
    }
    return res.json();
  },

  async getMe(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me/`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Session expired');
    return res.json();
  },

  // Metadata
  async getDepartments(): Promise<Department[]> {
    const res = await fetch(`${API_BASE}/departments/`);
    return res.json();
  },

  async getCategories(): Promise<Category[]> {
    const res = await fetch(`${API_BASE}/categories/`);
    return res.json();
  },

  async getWorkers(department?: string): Promise<WorkerInfo[]> {
    const url = department ? `${API_BASE}/workers/?department=${department}` : `${API_BASE}/workers/`;
    const res = await fetch(url);
    return res.json();
  },

  // Issues
  async getIssues(params?: Record<string, string>): Promise<Issue[]> {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/issues/${query ? `?${query}` : ''}`, {
      headers: getAuthHeader()
    });
    return res.json();
  },

  async getIssue(id: string): Promise<Issue & { audit_trail: AuditRecord[] }> {
    const res = await fetch(`${API_BASE}/issues/${id}/`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Ticket not found');
    return res.json();
  },

  async checkDuplicate(latitude: number, longitude: number, category_code: string): Promise<{
    has_duplicate: boolean;
    count: number;
    duplicates: Issue[];
  }> {
    const res = await fetch(`${API_BASE}/issues/check-duplicate/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latitude, longitude, category_code })
    });
    return res.json();
  },

  async createIssue(formData: FormData): Promise<Issue> {
    const res = await fetch(`${API_BASE}/issues/`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to submit grievance');
    }
    return res.json();
  },

  // Triage & Workflow
  async triageIssue(id: string, data: {
    action: 'ACCEPT' | 'REJECT' | 'UNDER_REVIEW';
    priority?: string;
    department_code?: string;
    rejection_reason?: string;
    remarks?: string;
  }): Promise<Issue> {
    const res = await fetch(`${API_BASE}/issues/${id}/triage/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Triage operation failed');
    }
    return res.json();
  },

  async dispatchIssue(id: string, worker_id: string, instructions?: string): Promise<Issue> {
    const res = await fetch(`${API_BASE}/issues/${id}/dispatch/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ worker_id, instructions })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Dispatch failed');
    }
    return res.json();
  },

  async updateWorkerStatus(id: string, status: 'ON_THE_WAY' | 'IN_PROGRESS', remarks?: string): Promise<Issue> {
    const res = await fetch(`${API_BASE}/issues/${id}/status/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ status, remarks })
    });
    return res.json();
  },

  async submitEvidence(id: string, formData: FormData): Promise<Issue> {
    const res = await fetch(`${API_BASE}/issues/${id}/evidence/`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to submit completion proof');
    }
    return res.json();
  },

  async verifyIssue(id: string, approved: boolean, remarks?: string, rework_notes?: string): Promise<Issue> {
    const res = await fetch(`${API_BASE}/issues/${id}/verify/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ approved, remarks, rework_notes })
    });
    return res.json();
  },

  async reopenIssue(id: string, reason: string): Promise<Issue> {
    const res = await fetch(`${API_BASE}/issues/${id}/reopen/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ reason })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Reopen failed');
    }
    return res.json();
  },

  async rateIssue(id: string, rating: number, feedback?: string): Promise<Issue> {
    const res = await fetch(`${API_BASE}/issues/${id}/rate/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ rating, feedback })
    });
    return res.json();
  },

  async upvoteIssue(id: string): Promise<{ upvotes_count: number; has_upvoted: boolean }> {
    const res = await fetch(`${API_BASE}/issues/${id}/upvote/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });
    return res.json();
  },

  // Audit Ledger
  async getAudit(issue_id?: string): Promise<AuditRecord[]> {
    const url = issue_id ? `${API_BASE}/audit/?issue_id=${issue_id}` : `${API_BASE}/audit/`;
    const res = await fetch(url);
    return res.json();
  },

  // Analytics
  async getAnalytics(): Promise<AnalyticsData> {
    const res = await fetch(`${API_BASE}/analytics/`);
    return res.json();
  }
};

