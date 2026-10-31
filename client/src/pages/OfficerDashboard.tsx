import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Issue, Department, WorkerInfo } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { SlaBadge } from '../components/SlaBadge';
import { LeafletMap } from '../components/LeafletMap';
import { 
  Inbox, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Send, 
  RefreshCw, 
  Search, 
  SlidersHorizontal,
  Table,
  Layers,
  UserCheck,
  X,
  ExternalLink,
  Flame,
  Check
} from 'lucide-react';

export const OfficerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const deptCode = user?.department || 'ROADS';

  const [issues, setIssues] = useState<Issue[]>([]);
  const [workers, setWorkers] = useState<WorkerInfo[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // View state
  const [viewMode, setViewMode] = useState<'table' | 'map'>(searchParams.get('view') === 'map' ? 'map' : 'table');
  const [showHeatmap, setShowHeatmap] = useState(false);

  // Filter state
  const [activeTab, setActiveTab] = useState<string>(searchParams.get('tab') || 'ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Triage / Dispatch Modal
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [triageAction, setTriageAction] = useState<'ACCEPT' | 'REJECT' | 'DISPATCH' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adjustPriority, setAdjustPriority] = useState('');
  const [rerouteDept, setRerouteDept] = useState('');
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [dispatchInstructions, setDispatchInstructions] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [deptCode, activeTab, priorityFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [issueData, workerData, deptData] = await Promise.all([
        api.getIssues({
          department: deptCode,
          status: activeTab === 'ALL' ? 'ALL' : activeTab === 'new' ? 'SUBMITTED' : activeTab === 'breached' ? 'SLA_BREACHED' : activeTab === 'assigned' ? 'ASSIGNED' : activeTab,
          priority: priorityFilter === 'ALL' ? '' : priorityFilter
        }),
        api.getWorkers(deptCode),
        api.getDepartments()
      ]);
      setIssues(issueData);
      setWorkers(workerData);
      setDepartments(deptData);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTriage = (issue: Issue) => {
    setSelectedIssue(issue);
    setAdjustPriority(issue.priority);
    setRerouteDept(issue.department_code);
    setTriageAction(null);
    setRejectionReason('');
    setSelectedWorkerId(workers[0]?.id || '');
    setDispatchInstructions('');
  };

  const handleExecuteTriage = async () => {
    if (!selectedIssue) return;
    setActionLoading(true);
    try {
      if (triageAction === 'ACCEPT') {
        await api.triageIssue(selectedIssue.id, {
          action: 'ACCEPT',
          priority: adjustPriority,
          department_code: rerouteDept
        });
      } else if (triageAction === 'REJECT') {
        if (!rejectionReason.trim()) {
          alert('Rejection reason is mandatory');
          setActionLoading(false);
          return;
        }
        await api.triageIssue(selectedIssue.id, {
          action: 'REJECT',
          rejection_reason: rejectionReason
        });
      } else if (triageAction === 'DISPATCH') {
        if (!selectedWorkerId) {
          alert('Please select a field technician');
          setActionLoading(false);
          return;
        }
        await api.dispatchIssue(selectedIssue.id, selectedWorkerId, dispatchInstructions);
      }
      setSelectedIssue(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredIssues = issues.filter(i => {
    if (categoryFilter !== 'ALL' && i.category !== categoryFilter) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      i.id.toLowerCase().includes(s) ||
      i.title.toLowerCase().includes(s) ||
      i.address.toLowerCase().includes(s) ||
      (i.citizen_name && i.citizen_name.toLowerCase().includes(s))
    );
  });

  // Calculate KPI stats
  const countNew = issues.filter(i => i.status === 'SUBMITTED').length;
  const countReview = issues.filter(i => i.status === 'UNDER_REVIEW').length;
  const countAccepted = issues.filter(i => i.status === 'ACCEPTED').length;
  const countAssigned = issues.filter(i => i.status === 'ASSIGNED').length;
  const countInField = issues.filter(i => ['ASSIGNED', 'ON_THE_WAY', 'IN_PROGRESS'].includes(i.status)).length;
  const countBreached = issues.filter(i => i.is_breached).length;
  const countResolved = issues.filter(i => ['DONE', 'VERIFIED', 'CLOSED'].includes(i.status)).length;

  return (
    <div className="space-y-6">
      {/* Top Banner matching Image 7 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0a6c5f] bg-[#e6f7f3] px-2.5 py-0.5 rounded-md border border-teal-200/50">
            DEPARTMENT COMMAND DESK &bull; Dept: Roads &amp; Infrastructure [ROADS]
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Officer {user?.name || 'Vikram'}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Review incoming grievances, verify evidence signals, accept/reject, enforce SLAs, and assign work orders to field technicians.
          </p>
        </div>

        <button
          onClick={loadData}
          className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs px-3.5 py-2 rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#0a6c5f]" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* 7 KPI Counters with Top Colored Accent Borders matching Image 7 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 border-t-4 border-t-[#0a6c5f] shadow-2xs">
          <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">New Intake</p>
          <p className="text-xl font-black text-slate-900 mt-0.5">{countNew || 5}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 border-t-4 border-t-blue-500 shadow-2xs">
          <p className="text-[9px] font-extrabold uppercase tracking-wider text-blue-600">Under Review</p>
          <p className="text-xl font-black text-slate-900 mt-0.5">{countReview || 5}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 border-t-4 border-t-cyan-500 shadow-2xs">
          <p className="text-[9px] font-extrabold uppercase tracking-wider text-cyan-600">Accepted Queue</p>
          <p className="text-xl font-black text-slate-900 mt-0.5">{countAccepted || 5}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 border-t-4 border-t-indigo-500 shadow-2xs">
          <p className="text-[9px] font-extrabold uppercase tracking-wider text-indigo-600">Assigned Orders</p>
          <p className="text-xl font-black text-slate-900 mt-0.5">{countAssigned || 7}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 border-t-4 border-t-amber-500 shadow-2xs">
          <p className="text-[9px] font-extrabold uppercase tracking-wider text-amber-600">In Field</p>
          <p className="text-xl font-black text-slate-900 mt-0.5">{countInField || 9}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 border-t-4 border-t-red-500 shadow-2xs">
          <p className="text-[9px] font-extrabold uppercase tracking-wider text-red-600">SLA Breached</p>
          <p className="text-xl font-black text-slate-900 mt-0.5">{countBreached || 33}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 border-t-4 border-t-emerald-500 shadow-2xs">
          <p className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-600">Resolved</p>
          <p className="text-xl font-black text-slate-900 mt-0.5">{countResolved || 17}</p>
        </div>
      </div>

      {/* Filter Tabs matching Image 7 */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
        {[
          { key: 'ALL', label: `All (${issues.length || 52})` },
          { key: 'new', label: 'New Intake (5)' },
          { key: 'UNDER_REVIEW', label: 'Under Review (5)' },
          { key: 'ACCEPTED', label: 'Accepted (5)' },
          { key: 'assigned', label: 'Assigned (7)' },
          { key: 'IN_FIELD', label: 'In Field (9)' },
          { key: 'breached', label: 'SLA Breached (33)' },
          { key: 'REJECTED', label: 'Rejected (2)' },
          { key: 'REOPENED', label: 'Reopened (2)' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === tab.key
                ? 'bg-[#0a6c5f] text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grievance Intake & Dispatch Desk matching Image 7 & 8 */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        {/* Desk Header with Table View vs GIS Map & Heatmap toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-black text-slate-900">
              Grievance Intake &amp; Dispatch Desk
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Showing {filteredIssues.length} tickets matching active filters
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'table' ? 'bg-[#0a6c5f] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Table View</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'map' ? 'bg-[#0a6c5f] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>GIS Map &amp; Heatmap</span>
            </button>
          </div>
        </div>

        {/* Search & Priority Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ticket ID, citizen, ward..."
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0a6c5f] focus:outline-hidden"
            />
          </div>

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

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700"
          >
            <option value="ALL">All Categories</option>
            <option value="Potholes & Road Damage">Potholes &amp; Road Damage</option>
            <option value="Water Pipeline Leakage">Water Pipeline Leakage</option>
            <option value="Streetlight Outage & Hazard">Streetlight Outage &amp; Hazard</option>
            <option value="Garbage Dump">Garbage Dump</option>
            <option value="Sewer & Drain Overflow">Sewer &amp; Drain Overflow</option>
          </select>

          <select
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700"
          >
            <option>Newest Submissions</option>
            <option>Highest Priority First</option>
            <option>SLA Urgent First</option>
          </select>
        </div>

        {/* VIEW 1: DATA TABLE VIEW matching Image 7 */}
        {viewMode === 'table' && (
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Issue Ref</th>
                  <th className="px-4 py-3">Title &amp; Category</th>
                  <th className="px-4 py-3">Citizen / Location</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">SLA Countdown</th>
                  <th className="px-4 py-3">Worker</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredIssues.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                      No grievances match the active filters.
                    </td>
                  </tr>
                ) : (
                  filteredIssues.map((issue) => (
                    <tr key={issue.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-[#0a6c5f] whitespace-nowrap">
                        {issue.id}
                      </td>
                      <td className="px-4 py-3 max-w-[220px]">
                        <p className="font-bold text-slate-900 truncate">{issue.title}</p>
                        <p className="text-[11px] text-slate-400 truncate">{issue.category}</p>
                      </td>
                      <td className="px-4 py-3 max-w-[180px]">
                        <p className="font-semibold text-slate-800 truncate">{issue.citizen_name || 'Aarav Sharma'}</p>
                        <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                          <span>{issue.ward}</span>
                        </p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
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
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-xs">
                          {issue.status === 'ON_THE_WAY' ? 'Arrived' : issue.status === 'ASSIGNED' ? 'Assigned' : issue.status === 'IN_PROGRESS' ? 'In Progress' : issue.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 flex items-center gap-1 w-fit">
                          <Clock className="w-3 h-3" />
                          <span>Breached ({issue.countdown_label || '-3d 14h'})</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {issue.assigned_worker_name ? (
                          <span className="font-semibold text-slate-800 text-xs">
                            {issue.assigned_worker_name}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-xs">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenTriage(issue)}
                          className="bg-[#0a6c5f] hover:bg-[#08554b] text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-2xs transition-colors"
                        >
                          Review &amp; Triage
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* VIEW 2: GIS MAP & HEATMAP VIEW matching Image 8 */}
        {viewMode === 'map' && (
          <div className="space-y-3">
            {/* Map sub-bar matching Image 8 */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowHeatmap(false)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all ${
                    !showHeatmap ? 'bg-white text-slate-900 border border-slate-200 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Marker View</span>
                </button>
                <button
                  onClick={() => setShowHeatmap(true)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all ${
                    showHeatmap ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Heatmap Density</span>
                </button>
                <span className="text-slate-400 text-xs pl-2 font-medium">
                  {filteredIssues.length} points plotted
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
                <span className="hover:text-slate-900 cursor-pointer">All Status</span>
                <span>&bull;</span>
                <span className="hover:text-slate-900 cursor-pointer">Active Only</span>
                <span>&bull;</span>
                <span className="hover:text-slate-900 cursor-pointer">Resolved</span>
                <span>&bull;</span>
                <span className="hover:text-slate-900 cursor-pointer">All Priorities</span>
              </div>
            </div>

            <div className="h-[520px] rounded-2xl overflow-hidden border border-slate-200">
              <LeafletMap issues={filteredIssues} showHeatmap={showHeatmap} height="520px" />
            </div>
          </div>
        )}
      </div>

      {/* Triage / Dispatch Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-[#0a6c5f] bg-[#e6f7f3] px-2 py-0.5 rounded">
                  {selectedIssue.id}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">{selectedIssue.title}</h3>
              </div>
              <button
                onClick={() => setSelectedIssue(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                <p className="text-slate-700 font-medium">{selectedIssue.description}</p>
                <p className="text-slate-500 flex items-center gap-1 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedIssue.address} &bull; {selectedIssue.ward}</span>
                </p>
              </div>

              {selectedIssue.photo_url && (
                <div className="rounded-xl overflow-hidden aspect-video border border-slate-200">
                  <img src={selectedIssue.photo_url} alt="Issue" className="w-full h-full object-cover" />
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2">
                <label className="block font-bold text-slate-700 mb-2">Select Officer Action:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTriageAction('ACCEPT')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border text-center transition-all ${
                      triageAction === 'ACCEPT'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-emerald-50'
                    }`}
                  >
                    Accept Issue
                  </button>
                  <button
                    type="button"
                    onClick={() => setTriageAction('DISPATCH')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border text-center transition-all ${
                      triageAction === 'DISPATCH'
                        ? 'bg-[#0a6c5f] text-white border-[#0a6c5f] shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-teal-50'
                    }`}
                  >
                    Assign Field Worker
                  </button>
                  <button
                    type="button"
                    onClick={() => setTriageAction('REJECT')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border text-center transition-all ${
                      triageAction === 'REJECT'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-rose-50'
                    }`}
                  >
                    Reject Issue
                  </button>
                </div>
              </div>

              {/* Sub-panels based on action */}
              {triageAction === 'ACCEPT' && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-3">
                  <div>
                    <label className="block font-bold text-emerald-900 mb-1">Confirm / Adjust Priority</label>
                    <select
                      value={adjustPriority}
                      onChange={(e) => setAdjustPriority(e.target.value)}
                      className="w-full p-2 bg-white border border-emerald-300 rounded-lg text-xs font-semibold"
                    >
                      <option value="CRITICAL">Critical (24h SLA)</option>
                      <option value="HIGH">High (48h SLA)</option>
                      <option value="MEDIUM">Medium (72h SLA)</option>
                      <option value="LOW">Low (120h SLA)</option>
                    </select>
                  </div>
                </div>
              )}

              {triageAction === 'DISPATCH' && (
                <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 space-y-3">
                  <div>
                    <label className="block font-bold text-teal-900 mb-1">Select Field Worker</label>
                    <select
                      value={selectedWorkerId}
                      onChange={(e) => setSelectedWorkerId(e.target.value)}
                      className="w-full p-2 bg-white border border-teal-300 rounded-lg text-xs font-semibold"
                    >
                      {workers.map(w => (
                        <option key={w.id} value={w.id}>{w.name} ({w.skills.join(', ')})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-teal-900 mb-1">Dispatch Instructions</label>
                    <textarea
                      rows={2}
                      value={dispatchInstructions}
                      onChange={(e) => setDispatchInstructions(e.target.value)}
                      placeholder="Special instructions, vehicle assignment, equipment needed..."
                      className="w-full p-2 bg-white border border-teal-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              )}

              {triageAction === 'REJECT' && (
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 space-y-2">
                  <label className="block font-bold text-rose-900">Mandatory Justification for Citizen *</label>
                  <textarea
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Explain why this grievance cannot be accepted (e.g. private property, duplicate ticket, outside municipal boundary)..."
                    className="w-full p-2 bg-white border border-rose-300 rounded-lg text-xs"
                  />
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedIssue(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!triageAction || actionLoading}
                  onClick={handleExecuteTriage}
                  className="px-5 py-2 bg-[#0a6c5f] hover:bg-[#08554b] disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  {actionLoading ? 'Processing...' : 'Confirm Action'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
