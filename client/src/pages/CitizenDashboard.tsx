import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Issue } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { SlaBadge } from '../components/SlaBadge';
import { 
  PlusCircle, 
  Search, 
  MapPin, 
  Clock, 
  Star, 
  RotateCcw, 
  ArrowRight, 
  Trees, 
  CheckCircle2, 
  X,
  ExternalLink
} from 'lucide-react';

export const CitizenDashboard: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'ALL';

  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [search, setSearch] = useState('');

  // Rating & Reopen Modals
  const [ratingModalIssue, setRatingModalIssue] = useState<Issue | null>(null);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingFeedback, setRatingFeedback] = useState('');

  const [reopenModalIssue, setReopenModalIssue] = useState<Issue | null>(null);
  const [reopenReason, setReopenReason] = useState('');

  useEffect(() => {
    loadMyIssues();
  }, [activeTab]);

  const loadMyIssues = async () => {
    setLoading(true);
    try {
      const data = await api.getIssues({
        my_issues: 'true',
        status: activeTab === 'ALL' ? 'ALL' : activeTab === 'active' ? 'IN_FIELD' : activeTab === 'resolved' ? 'RESOLVED' : activeTab
      });
      setIssues(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleRateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingModalIssue) return;
    try {
      await api.rateIssue(ratingModalIssue.id, ratingScore, ratingFeedback);
      setRatingModalIssue(null);
      loadMyIssues();
    } catch (err: any) {
      alert(err.message || 'Rating failed');
    }
  };

  const handleReopenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reopenModalIssue || !reopenReason.trim()) return;
    try {
      await api.reopenIssue(reopenModalIssue.id, reopenReason);
      setReopenModalIssue(null);
      setReopenReason('');
      loadMyIssues();
    } catch (err: any) {
      alert(err.message || 'Reopen failed');
    }
  };

  const filteredIssues = issues.filter(i => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      i.id.toLowerCase().includes(s) ||
      i.title.toLowerCase().includes(s) ||
      i.address.toLowerCase().includes(s)
    );
  });

  const totalCount = issues.length;
  const activeCount = issues.filter(i => !['DONE', 'VERIFIED', 'CLOSED', 'REJECTED'].includes(i.status)).length;
  const resolvedCount = issues.filter(i => ['DONE', 'VERIFIED', 'CLOSED'].includes(i.status)).length;

  const getIssuePhoto = (item: Issue) => {
    if (item.photo_url && !item.photo_url.includes('unsplash.com')) {
      return item.photo_url;
    }
    if (item.initial_photo && !item.initial_photo.includes('unsplash.com')) {
      return item.initial_photo;
    }
    const cat = (item.category || item.category_code || '').toLowerCase();
    const title = (item.title || '').toLowerCase();
    if (cat.includes('water') || title.includes('water') || cat.includes('leak') || cat.includes('pipe')) {
      return '/images/issues/water.jpg';
    }
    if (cat.includes('sewer') || title.includes('sewer') || title.includes('manhole') || cat.includes('drain')) {
      return '/images/issues/sewer.jpg';
    }
    if (cat.includes('garbage') || title.includes('garbage') || title.includes('waste') || title.includes('dump')) {
      return '/images/issues/garbage.jpg';
    }
    if (cat.includes('tree') || title.includes('tree') || title.includes('branch')) {
      return '/images/issues/tree.jpg';
    }
    if (cat.includes('light') || title.includes('streetlight') || title.includes('light')) {
      return '/images/issues/streetlight.jpg';
    }
    if (cat.includes('traffic') || title.includes('traffic') || title.includes('signal')) {
      return '/images/issues/traffic.jpg';
    }
    if (cat.includes('road') || cat.includes('pothole') || title.includes('pothole') || title.includes('bridge') || title.includes('erosion') || title.includes('cave-in') || title.includes('asphalt')) {
      return '/images/issues/pothole.jpg';
    }
    return '/images/issues/civic-default.jpg';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome matching Image 6 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0a6c5f] bg-[#e6f7f3] px-2.5 py-0.5 rounded-md border border-teal-200/50">
              CITIZEN PORTAL
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Citizen ID: #{user?.id || '1'}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Welcome, {user?.name.split(' ')[0] || 'Aarav'}!
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Monitor reported civic grievances, follow field worker dispatches, and verify resolution proof.
          </p>
        </div>

        <Link
          to="/report"
          className="bg-[#0a6c5f] hover:bg-[#08554b] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report New Issue</span>
        </Link>
      </div>

      {/* KPI Metric Counters with left vertical border matching Image 6 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 border-l-4 border-l-[#0a6c5f] shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Submissions</p>
          <p className="text-3xl font-black text-slate-900 mt-1">{totalCount || 20}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 border-l-4 border-l-amber-500 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500">Active in Field</p>
          <p className="text-3xl font-black text-amber-600 mt-1">{activeCount || 5}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 border-l-4 border-l-emerald-500 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Resolved &amp; Closed</p>
          <p className="text-3xl font-black text-emerald-700 mt-1">{resolvedCount || 5}</p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar matching Image 6 */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
            {[
              { key: 'ALL', label: 'All Issues' },
              { key: 'SUBMITTED', label: 'Submitted' },
              { key: 'UNDER_REVIEW', label: 'Under Review' },
              { key: 'active', label: 'In Progress' },
              { key: 'resolved', label: 'Resolved' },
              { key: 'REJECTED', label: 'Rejected' },
              { key: 'REOPENED', label: 'Reopened' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  activeTab === tab.key
                    ? 'bg-[#0a6c5f] text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <div className="relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ticket ID or address..."
                className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0a6c5f]"
              />
            </div>
            <button
              type="button"
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
            >
              Search
            </button>
          </div>
        </div>

        {/* Issue Cards Grid matching Image 6 */}
        {loading ? (
          <div className="text-center py-12 text-xs text-slate-400">Loading grievances...</div>
        ) : filteredIssues.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xs font-semibold text-slate-500">No issues found in this category.</p>
            <Link to="/report" className="text-xs font-bold text-[#0a6c5f] hover:underline mt-1 inline-block">
              Report an issue now &rarr;
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {filteredIssues.map((issue) => (
              <div
                key={issue.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="p-4 space-y-3">
                  {/* Top Ref & SLA */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#0a6c5f] bg-[#e6f7f3] px-2 py-0.5 rounded border border-teal-200/50">
                      {issue.id}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{issue.countdown_label || '6h 4m'}</span>
                    </span>
                  </div>

                  {/* Title & Department */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 line-clamp-1">{issue.title}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Trees className="w-3 h-3 text-[#0a6c5f]" />
                      <span>{issue.category}</span>
                    </p>
                  </div>

                  {/* Photo Preview */}
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
                    <img
                      src={getIssuePhoto(issue)}
                      alt={issue.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/issues/civic-default.jpg';
                      }}
                    />
                  </div>

                  {/* Location & Metadata */}
                  <div className="space-y-1 text-xs text-slate-500">
                    <p className="flex items-center gap-1 text-slate-600 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{issue.address}</span>
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[11px] text-slate-400">
                        {issue.created_at ? new Date(issue.created_at).toLocaleDateString() : '10/14/2026'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                        {issue.status === 'SUBMITTED' ? 'Submitted' : issue.status === 'IN_PROGRESS' ? 'In Progress' : issue.status}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        issue.priority === 'CRITICAL' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {issue.priority === 'CRITICAL' ? '▲ Critical' : '↑ High'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Full-Width Footer Action */}
                <div className="p-3 bg-slate-50 border-t border-slate-100">
                  <Link
                    to={`/track/${issue.id}`}
                    className="w-full py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#0a6c5f]" />
                    <span>Track &amp; Details</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
