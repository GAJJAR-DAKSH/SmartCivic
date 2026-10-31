import React from 'react';
import { Priority } from '../types';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Props {
  priority: Priority;
  slaStatus: 'ON_TRACK' | 'WARNING' | 'BREACHED' | 'COMPLETED';
  countdownLabel: string;
  showPriority?: boolean;
}

export const SlaBadge: React.FC<Props> = ({
  priority,
  slaStatus,
  countdownLabel,
  showPriority = false
}) => {
  const priorityColors: Record<Priority, { label: string; badge: string }> = {
    CRITICAL: { label: 'Critical (6h)', badge: 'bg-red-50 text-red-700 border-red-200' },
    HIGH: { label: 'High (24h)', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
    MEDIUM: { label: 'Medium (48h)', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
    LOW: { label: 'Low (72h)', badge: 'bg-slate-50 text-slate-700 border-slate-200' }
  };

  const slaStyles = {
    BREACHED: {
      bg: 'bg-rose-50 text-rose-700 border-rose-300',
      icon: AlertTriangle,
      dot: 'bg-rose-500 animate-pulse'
    },
    WARNING: {
      bg: 'bg-amber-50 text-amber-800 border-amber-300',
      icon: Clock,
      dot: 'bg-amber-500'
    },
    ON_TRACK: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      icon: Clock,
      dot: 'bg-emerald-500'
    },
    COMPLETED: {
      bg: 'bg-slate-50 text-slate-700 border-slate-300',
      icon: CheckCircle2,
      dot: 'bg-slate-400'
    }
  };

  const currentStyle = slaStyles[slaStatus] || slaStyles.ON_TRACK;
  const Icon = currentStyle.icon;

  return (
    <div className="inline-flex items-center gap-2">
      {showPriority && (
        <span
          className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${priorityColors[priority]?.badge || 'bg-slate-100 text-slate-700'}`}
        >
          {priority}
        </span>
      )}
      <span
        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border shadow-xs ${currentStyle.bg}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${currentStyle.dot}`} />
        <Icon className="w-3 h-3" />
        <span>{countdownLabel}</span>
      </span>
    </div>
  );
};

