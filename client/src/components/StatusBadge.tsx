import React from 'react';
import { IssueStatus } from '../types';
import { 
  FileText, 
  Search, 
  CheckCircle, 
  XCircle, 
  UserCheck, 
  Truck, 
  Wrench, 
  Sparkles, 
  ShieldCheck, 
  Archive, 
  RotateCcw 
} from 'lucide-react';

interface Props {
  status: IssueStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<Props> = ({ status, size = 'md' }) => {
  const config: Record<IssueStatus, { label: string; bg: string; text: string; border: string; icon: any }> = {
    SUBMITTED: {
      label: 'Submitted',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      icon: FileText
    },
    UNDER_REVIEW: {
      label: 'Under Review',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      icon: Search
    },
    ACCEPTED: {
      label: 'Accepted',
      bg: 'bg-teal-50',
      text: 'text-teal-700',
      border: 'border-teal-200',
      icon: CheckCircle
    },
    REJECTED: {
      label: 'Rejected',
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      icon: XCircle
    },
    ASSIGNED: {
      label: 'Assigned',
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
      icon: UserCheck
    },
    ON_THE_WAY: {
      label: 'On The Way',
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200',
      icon: Truck
    },
    IN_PROGRESS: {
      label: 'In Progress',
      bg: 'bg-amber-100',
      text: 'text-amber-800',
      border: 'border-amber-300',
      icon: Wrench
    },
    DONE: {
      label: 'Done (Pending Audit)',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-300',
      icon: Sparkles
    },
    VERIFIED: {
      label: 'Verified',
      bg: 'bg-emerald-100',
      text: 'text-emerald-800',
      border: 'border-emerald-400',
      icon: ShieldCheck
    },
    CLOSED: {
      label: 'Closed',
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-300',
      icon: Archive
    },
    REOPENED: {
      label: 'Reopened',
      bg: 'bg-orange-100',
      text: 'text-orange-800',
      border: 'border-orange-300',
      icon: RotateCcw
    }
  };

  const item = config[status] || {
    label: status,
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    icon: FileText
  };

  const Icon = item.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-semibold px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-semibold px-3 py-1.5 gap-2'
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-sm ${item.bg} ${item.text} ${item.border} ${sizeClasses[size]}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{item.label}</span>
    </span>
  );
};

