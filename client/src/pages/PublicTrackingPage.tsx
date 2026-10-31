import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Issue, AuditRecord } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { SlaBadge } from '../components/SlaBadge';
import { 
  Search, 
  Clock, 
  MapPin, 
  Building2, 
  User, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  History,
  ThumbsUp,
  RotateCcw
} from 'lucide-react';

export const PublicTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchToken, setSearchToken] = useState(id || 'SC-2026-00001');
  const [issue, setIssue] = useState<(Issue & { audit_trail: AuditRecord[] }) | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [upvoted, setUpvoted] = useState(false);

  useEffect(() => {
    if (id) {
      loadIssue(id);
    } else {
      loadIssue('SC-2026-00001');
    }
  }, [id]);

  const loadIssue = async (ticketId: string) => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getIssue(ticketId);
      setIssue(data);
    } catch (err: any) {
      setError(err.message || 'Ticket reference not found. Please check token number.');
      setIssue(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchToken.trim()) {
      navigate(`/track/${searchToken.trim()}`);
      loadIssue(searchToken.trim());
    }
  };

  const handleUpvote = async () => {
    if (!issue) return;
    try {
      const res = await api.upvoteIssue(issue.id);
      setIssue({ ...issue, upvotes_count: res.upvotes_count });
      setUpvoted(res.has_upvoted);
    } catch {
      // ignore
    }
  };

  // Determine stage milestone (1 to 6)
  const getWorkflowStep = (status: string) => {
    switch (status) {
      case 'SUBMITTED': return 1;
      case 'UNDER_REVIEW':
      case 'ACCEPTED': return 2;
      case 'ASSIGNED':
      case 'ON_THE_WAY': return 3;
      case 'IN_PROGRESS': return 4;
      case 'DONE': return 5;
      case 'VERIFIED':
      case 'CLOSED': return 6;
      case 'REOPENED': return 4;
      default: return 1;
    }
  };

  const currentStep = issue ? getWorkflowStep(issue.status) : 1;

  const milestones = [
    { num: 1, label: 'Submitted' },
    { num: 2, label: 'Under Review' },
    { num: 3, label: 'Assigned' },
    { num: 4, label: 'In Progress' },
    { num: 5, label: 'Repaired' },
    { num: 6, label: 'Verified & Closed' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Track Civic Issue Status
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enter your unique tracking token (e.g. SC-2026-00001) to check real-time resolution progress.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="mt-5 max-w-lg mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchToken}
                onChange={(e) => setSearchToken(e.target.value)}
                placeholder="E.G. SC-2026-00001"
                className="w-full text-xs font-mono font-bold pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl shadow-xs focus:ring-2 focus:ring-civic-600 focus:outline-hidden"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-civic-700 hover:bg-civic-800 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-sm transition-all flex items-center gap-1.5 shrink-0"
            >
              <span>{loading ? 'Searching...' : 'Track'}</span>
            </button>
          </form>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold text-center max-w-lg mx-auto">
            {error}
          </div>
        )}

        {issue && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Top Overview Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-black text-sm text-civic-700 bg-civic-50 px-2.5 py-0.5 rounded-lg border border-civic-200">
                      {issue.id}
                    </span>
                    <StatusBadge status={issue.status} size="sm" />
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border bg-amber-50 text-amber-700 border-amber-200">
                      {issue.priority} Priority
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 mt-1">{issue.title}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Reported on {new Date(issue.created_at).toLocaleDateString()} &bull; {issue.department_code} Department
                  </p>
                </div>

                <div className="sm:text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Target Resolution SLA</div>
                  <div className="mt-1">
                    <SlaBadge
                      priority={issue.priority}
                      slaStatus={issue.sla_status}
                      countdownLabel={issue.countdown_label}
                    />
                  </div>
                </div>
              </div>

              {/* 6-Milestone Workflow Progress */}
              <div className="mt-6 pt-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-4">
                  Resolution Workflow Progress
                </div>
                <div className="grid grid-cols-6 gap-2 text-center">
                  {milestones.map((m) => {
                    const isDone = currentStep >= m.num;
                    const isCurrent = currentStep === m.num;
                    return (
                      <div key={m.num} className="relative">
                        <div
                          className={`w-8 h-8 mx-auto rounded-full font-bold text-xs flex items-center justify-center transition-all ${
                            isDone
                              ? 'bg-civic-700 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-400 border border-slate-200'
                          } ${isCurrent ? 'ring-4 ring-civic-200 scale-110' : ''}`}
                        >
                          {isDone ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : m.num}
                        </div>
                        <p className={`text-[10px] mt-2 font-semibold ${isDone ? 'text-slate-900' : 'text-slate-400'}`}>
                          {m.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Split Content: Details & Evidence vs Activity Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Report Summary */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                    Report Summary
                  </h3>

                  <div className="space-y-4 text-xs">
                    <div>
                      <span className="font-semibold text-slate-500">Description</span>
                      <p className="text-slate-800 font-medium mt-1 leading-relaxed">{issue.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <span className="font-semibold text-slate-500">Issue Category</span>
                        <p className="text-slate-900 font-bold mt-0.5">{issue.category_code}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-500">Responsible Dept</span>
                        <p className="text-slate-900 font-bold mt-0.5">{issue.department_code}</p>
                      </div>
                    </div>

                    <div className="pt-2">
                      <span className="font-semibold text-slate-500">Reported Location</span>
                      <p className="text-slate-900 font-medium mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-civic-600 shrink-0" />
                        <span>{issue.address}</span>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {issue.ward} &bull; Lat: {issue.latitude}, Lon: {issue.longitude}
                      </p>
                    </div>

                    {issue.assigned_worker_name && (
                      <div className="pt-2 bg-indigo-50/60 p-3 rounded-xl border border-indigo-100">
                        <span className="font-semibold text-indigo-700">Assigned Field Crew</span>
                        <p className="text-indigo-950 font-bold text-sm mt-0.5">{issue.assigned_worker_name}</p>
                        <p className="text-[10px] text-indigo-600">Dispatched with mobile repair equipment</p>
                      </div>
                    )}

                    {/* Upvote Button */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        Is this issue affecting you too?
                      </span>
                      <button
                        onClick={handleUpvote}
                        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                          upvoted 
                            ? 'bg-amber-100 text-amber-800 border-amber-300' 
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{issue.upvotes_count || 1} Upvotes</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Photographic Evidence Before/After */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                    Photographic Proof Verification
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[11px] font-bold uppercase text-slate-500 mb-1.5">
                        Initial Citizen Intake Photo
                      </p>
                      <img
                        src={
                          issue.initial_photo && !issue.initial_photo.includes('unsplash.com')
                            ? issue.initial_photo
                            : (issue.category_code === 'water_leak' ? '/images/issues/water.jpg' : issue.category_code === 'pothole' ? '/images/issues/pothole.jpg' : '/images/issues/civic-default.jpg')
                        }
                        alt="Initial Defect"
                        className="w-full h-44 object-cover rounded-xl border border-slate-200 shadow-xs"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/issues/civic-default.jpg';
                        }}
                      />
                    </div>

                    <div>
                      <p className="text-[11px] font-bold uppercase text-slate-500 mb-1.5">
                        Field Completion After Proof
                      </p>
                      {issue.resolution_photo ? (
                        <div className="space-y-2">
                          <img
                            src={issue.resolution_photo}
                            alt="Resolution Proof"
                            className="w-full h-44 object-cover rounded-xl border border-emerald-300 shadow-xs"
                          />
                          {issue.materials_deployed && issue.materials_deployed.length > 0 && (
                            <div className="text-[10px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200">
                              <span className="font-bold">Materials Deployed:</span> {issue.materials_deployed.join(', ')}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-full h-44 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
                          <Clock className="w-6 h-6 text-slate-400 mb-1" />
                          <p className="text-xs font-semibold text-slate-500">Repair In Progress</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Post-repair photo proof will be uploaded by field crew upon completion.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Activity Timeline */}
              <div className="lg:col-span-5">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm sticky top-20">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <History className="w-4 h-4 text-civic-600" />
                      <span>Activity Timeline</span>
                    </h3>
                    <span className="text-[10px] font-semibold text-slate-400">Audit Verified</span>
                  </div>

                  <div className="space-y-4">
                    {issue.audit_trail && issue.audit_trail.length > 0 ? (
                      issue.audit_trail.map((audit) => (
                        <div key={audit.id} className="relative pl-6 pb-4 border-l-2 border-slate-200 last:border-l-0 last:pb-0">
                          <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-civic-600 ring-4 ring-civic-100" />
                          <div className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">
                            {audit.action.replace(/_/g, ' ')}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {new Date(audit.timestamp).toLocaleString()} &bull; by {audit.actor_name} ({audit.actor_role})
                          </div>
                          {audit.remarks && (
                            <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-2 rounded-lg border border-slate-100 leading-snug">
                              {audit.remarks}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400">No activity logged yet.</p>
                    )}
                  </div>

                  {/* Report New Issue CTA */}
                  <div className="mt-8 pt-4 border-t border-slate-100 text-center">
                    <p className="text-xs text-slate-500 mb-2">Have another municipal concern?</p>
                    <Link
                      to="/report"
                      className="w-full inline-flex items-center justify-center gap-1.5 bg-civic-700 hover:bg-civic-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm transition-colors"
                    >
                      <span>Report New Issue</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

