export type Role = 
  | 'CITIZEN' 
  | 'DEPARTMENT_OFFICER' 
  | 'WORKER' 
  | 'SUPERVISOR' 
  | 'MUNICIPAL_ADMIN';

export type IssueStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'ASSIGNED'
  | 'ON_THE_WAY'
  | 'IN_PROGRESS'
  | 'DONE'
  | 'VERIFIED'
  | 'CLOSED'
  | 'REOPENED';

export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: Role;
  department: string | null;
  phone?: string;
  title?: string;
  ward?: string;
  skills?: string[];
}

export interface Department {
  id: string;
  name: string;
  code: string;
  contact_email: string;
  head_officer: string;
}

export interface Category {
  code: string;
  name: string;
  default_priority: Priority;
  default_department: string;
  icon: string;
  description: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category_code: string;
  category?: string;
  department_code: string;
  citizen_id: string;
  citizen_name: string;
  status: IssueStatus;
  priority: Priority;
  latitude: number;
  longitude: number;
  address: string;
  ward: string;
  sla_deadline: string;
  is_breached: boolean;
  sla_status: 'ON_TRACK' | 'WARNING' | 'BREACHED' | 'COMPLETED';
  countdown_label: string;
  assigned_worker_id: string | null;
  assigned_worker_name: string | null;
  initial_photo: string;
  photo_url?: string;
  resolution_photo: string | null;
  materials_deployed: string[];
  resolution_notes: string | null;
  supervisor_notes: string | null;
  rejection_reason?: string;
  satisfaction_rating: number | null;
  citizen_feedback: string | null;
  upvotes_count: number;
  upvoted_by: string[];
  created_at: string;
  updated_at: string;
  closed_at?: string;
  reopened_at?: string;
  distance_meters?: number;
}

export interface AuditRecord {
  id: string;
  issue_id: string;
  actor_id: string;
  actor_name: string;
  actor_role: string;
  action: string;
  previous_status: string | null;
  new_status: string;
  remarks: string;
  ip_address: string;
  timestamp: string;
}

export interface WorkerInfo {
  id: string;
  name: string;
  phone: string;
  department: string;
  skills: string[];
  ward: string;
  activeTasks: number;
}

export interface AnalyticsData {
  metrics: {
    total: number;
    active: number;
    critical: number;
    resolved: number;
    breached: number;
    reopened: number;
    resolution_rate: number;
  };
  department_load: Array<{
    department: string;
    code: string;
    total: number;
    resolved: number;
    active: number;
    rate: number;
  }>;
  state_distribution: Array<{
    name: string;
    value: number;
  }>;
  ward_compliance: Array<{
    ward: string;
    total: number;
    compliant: number;
    rate: number;
  }>;
}

