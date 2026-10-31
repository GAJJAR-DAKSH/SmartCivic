import React from 'react';
import { Issue } from '../types';
import { AlertCircle, ThumbsUp, ArrowRight, X } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  duplicates: Issue[];
  onUpvote: (issueId: string) => void;
  onProceedAnyway: () => void;
}

export const DuplicateAlertModal: React.FC<Props> = ({
  isOpen,
  onClose,
  duplicates,
  onUpvote,
  onProceedAnyway
}) => {
  if (!isOpen || !duplicates.length) return null;

  const topIssue = duplicates[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-amber-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">Similar Civic Issue Detected Nearby!</h3>
              <p className="text-xs text-amber-100">Within {topIssue.distance_meters || 25} meters of your selected location</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-white/20 rounded-lg text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <p className="text-xs text-slate-600 mb-3">
            Another citizen has already reported a civic issue in this category at this location.
            To speed up repair and prevent municipal backlog, you can <span className="font-semibold text-slate-900">upvote</span> this existing ticket to escalate its operational priority!
          </p>

          <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/70 mb-4 hover:border-amber-300 transition-colors">
            <div className="flex items-start gap-3">
              {topIssue.initial_photo && (
                <img
                  src={topIssue.initial_photo}
                  alt="Existing Issue"
                  className="w-16 h-16 rounded-lg object-cover border border-slate-200 shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-mono font-bold text-civic-700">{topIssue.id}</span>
                  <StatusBadge status={topIssue.status} size="sm" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900 truncate">{topIssue.title}</h4>
                <p className="text-xs text-slate-500 truncate">{topIssue.address}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-slate-600">
                  <span className="font-semibold text-amber-600">{topIssue.upvotes_count || 1} community upvotes</span>
                  <span>&bull;</span>
                  <span className="text-slate-500">{topIssue.distance_meters ? `${topIssue.distance_meters}m away` : 'Nearby'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={() => onUpvote(topIssue.id)}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold text-sm py-2.5 px-4 rounded-xl shadow-md transition-all transform active:scale-95"
            >
              <ThumbsUp className="w-4 h-4" />
              <span>Upvote Existing Ticket #{topIssue.id} (Recommended)</span>
            </button>

            <button
              onClick={onProceedAnyway}
              className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs py-2 px-4 rounded-xl transition-colors"
            >
              <span>This is a distinct problem, proceed with new filing</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

