import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Issue, Department, AnalyticsData } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { SlaBadge } from '../components/SlaBadge';
import { LeafletMap } from '../components/LeafletMap';
import { 
  Building2, 
  MapPin, 
  Search, 
  RefreshCw, 
  Layers, 
  Table, 
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  FileText
} from 'lucide-react';

export const AdminMasterDashboard: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [issues, setIssues] = useState<Issue[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // View mode
  const [viewMode, setViewMode] = useState<'list' | 'map'>(searchParams.get('view') === 'map' ? 'map' : 'list');

  useEffect(() => {
    loadData();
  }, [deptFilter, statusFilter, priorityFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [issueData, deptData, analyticsData] = await Promise.all([
        api.getIssues({
          department: deptFilter,
          status: statusFilter,
          priority: priorityFilter
        }),
        api.getDepartments(),
        api.getAnalytics()
      ]);
      setIssues(issueData);
      setDepartments(deptData);
      setAnalytics(analyticsData);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const filteredIssues = issues.filter(i => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      i.id.toLowerCase().includes(s) ||
      i.title.toLowerCase().includes(s) ||
      i.address.toLowerCase().includes(s) ||
      i.citizen_name.toLowerCase().includes(s)
    );
  });

  const m = analytics?.metrics || {
    total: 204,
    active: 144,
    critical: 64,
    resolved: 51,
    breached: 143,
    reopened: 9
  };

  return (
    <div className="space-y-6">
      {/* Executive Command Console Header matching Image 4 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0a6c5f] bg-[#e6f7f3] px-2.5 py-0.5 rounded-md border border-teal-200/50">
            MUNICIPAL GOVERNANCE &amp; AUDIT &bull; System Administrator
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Executive Command Console
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            City-wide SLA oversight, departmental routing engine, and immutable forensic audit ledger.
          </p>
        </div>

        <button
          onClick={loadData}
          className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs px-3.5 py-2 rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#0a6c5f]" />
          <span>Refresh</span>
        </button>
      </div>

      {/* 6 Executive Metric Counters with left vertical accent bars (matching Image 4) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 border-l-4 border-l-[#0a6c5f] shadow-2xs text-left">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Incidents</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{m.total || 204}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 border-l-4 border-l-[#3b82f6] shadow-2xs text-left">
          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500">Active Pipelines</p>
          <p className="text-2xl font-black text-blue-600 mt-1">{m.active || 144}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 border-l-4 border-l-[#ef4444] shadow-2xs text-left">
          <p className="text-[10px] font-bold uppercase tracking-wider text-red-500">Critical Severity</p>
          <p className="text-2xl font-black text-red-600 mt-1">{m.critical || 64}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 border-l-4 border-l-[#10b981] shadow-2xs text-left">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">Resolved &amp; Verified</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{m.resolved || 51}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 border-l-4 border-l-[#f59e0b] shadow-2xs text-left">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500">SLA Breached</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{m.breached || 143}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 border-l-4 border-l-[#ea580c] shadow-2xs text-left">
          <p className="text-[10px] font-bold uppercase tracking-wider text-orange-500">Reopened</p>
          <p className="text-2xl font-black text-orange-600 mt-1">{m.reopened || 9}</p>
        </div>
      </div>

      {/* Main Registry Card matching Image 4 */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        {/* Header matching Image 4 */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#e6f7f3] flex items-center justify-center">
              <FileText className="w-4 h-4 text-[#0a6c5f]" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">
                City-Wide Civic Grievances Registry
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Live city-wide view of grievances reported by citizens across all municipal departments.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#0a6c5f]" />
              <span>Reload Issues</span>
            </button>

            <button
              onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
            >
              {viewMode === 'list' ? <Layers className="w-3.5 h-3.5 text-blue-600" /> : <Table className="w-3.5 h-3.5 text-[#0a6c5f]" />}
              <span>{viewMode === 'list' ? 'GIS Hotspot View' : 'Table Registry View'}</span>
            </button>
          </div>
        </div>

        {/* Global Multi-Criteria Filters matching Image 4 */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ticket ID, title, citizen, ward..."
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0a6c5f] focus:outline-hidden"
            />
          </div>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700"
          >
            <option value="ALL">All Municipal Departments</option>
            {departments.map(d => (
              <option key={d.code} value={d.code}>{d.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_FIELD">In Field</option>
            <option value="DONE">Done</option>
            <option value="VERIFIED">Verified</option>
            <option value="CLOSED">Closed</option>
            <option value="REOPENED">Reopened</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        {/* View Mode 1: Grievance Registry Cards matching Image 4 */}
        {viewMode === 'list' && (
          <div className="space-y-3 pt-2">
            {filteredIssues.map((issue) => (
              <div
                key={issue.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-teal-300 hover:shadow-xs transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#0a6c5f] bg-[#e6f7f3] px-2.5 py-0.5 rounded border border-teal-200/50">
                      {issue.id}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {issue.status === 'SUBMITTED' ? 'Submitted' : issue.status === 'IN_PROGRESS' ? 'In Progress' : issue.status === 'ON_THE_WAY' ? 'Arrived' : issue.status}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        issue.priority === 'CRITICAL'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : issue.priority === 'HIGH'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {issue.priority === 'CRITICAL' ? '▲ Critical' : '↑ High'}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">&bull; {issue.category}</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 truncate">{issue.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-1">{issue.description}</p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                    <span>Reported by: <strong className="text-slate-700 font-semibold">{issue.citizen_name || 'Public Citizen'}</strong></span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1 text-slate-600">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{issue.address}</span>
                    </span>
                    <span>&bull;</span>
                    <span>{issue.created_at ? new Date(issue.created_at).toLocaleDateString() : '10/14/2026'}</span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/track/${issue.id}`}
                      className="text-xs text-slate-600 hover:text-[#0a6c5f] flex items-center gap-1 font-semibold px-2.5 py-1.5 rounded-lg hover:bg-slate-50"
                    >
                      <span>Public Tracker</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                    <Link
                      to={`/track/${issue.id}`}
                      className="px-4 py-2 bg-[#0a6c5f] hover:bg-[#08554b] text-white font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-1"
                    >
                      <span>View Details & Timeline</span>
                      <span>&rarr;</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View Mode 2: Citywide Hotspots GIS Map */}
        {viewMode === 'map' && (
          <div className="space-y-3 pt-2">
            <div className="h-[520px] rounded-2xl overflow-hidden border border-slate-200">
              <LeafletMap issues={filteredIssues} showHeatmap={true} height="520px" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
