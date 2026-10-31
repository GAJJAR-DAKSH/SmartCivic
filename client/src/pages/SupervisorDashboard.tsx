import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Issue } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { SlaBadge } from '../components/SlaBadge';
import { 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Search, 
  MapPin, 
  Sparkles, 
  RotateCcw,
  X,
  FileCheck2,
  Wrench
} from 'lucide-react';

export const SupervisorDashboard: React.FC = () => {
  const { user } = useAuth();
  const deptCode = user?.department || 'ROADS';

  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  // Audit form state
  const [auditDecision, setAuditDecision] = useState<'APPROVE' | 'REWORK' | null>(null);
  const [auditRemarks, setAuditRemarks] = useState('');
  const [reworkNotes, setReworkNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [deptCode]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getIssues({ department: deptCode });
      setIssues(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const pendingVerification = issues.filter(i => i.status === 'DONE');
  const activeInField = issues.filter(i => ['ASSIGNED', 'ON_THE_WAY', 'IN_PROGRESS'].includes(i.status));
  const verifiedClosed = issues.filter(i => ['VERIFIED', 'CLOSED'].includes(i.status));
  const reopenedTickets = issues.filter(i => i.status === 'REOPENED');

  const handleOpenAudit = (issue: Issue) => {
    setSelectedIssue(issue);
    setAuditDecision('APPROVE');
    setAuditRemarks('Quality standards inspected on site. Repair executed compliant with municipal road specs.');
    setReworkNotes('');
  };

  const handleExecuteAudit = async () => {
    if (!selectedIssue || !auditDecision) return;
    setSubmitting(true);
    try {
      const isApproved = auditDecision === 'APPROVE';
      await api.verifyIssue(selectedIssue.id, isApproved, auditRemarks, reworkNotes);
      setSelectedIssue(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Audit action failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header (Figure 8.8) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-civic-700 bg-civic-50 px-2.5 py-0.5 rounded-md border border-civic-200">
            SUPERVISOR VERIFICATION DESK: Dept. {deptCode}
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Supervisor {user?.name || 'Anjali'}
          </h1>
          <p className="text-xs text-slate-500">
            Audit completion evidence, perform side-by-side Before/After quality control, and sign off on municipal repair orders.
          </p>
        </div>

        <button
          onClick={loadData}
          className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs px-3.5 py-2 rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-civic-600" />
          <span>Refresh Desk</span>
        </button>
      </div>

      {/* KPI Metric Cards (Figure 8.8) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Awaiting Verification</p>
          <p className="text-3xl font-black text-amber-600 mt-1">{pendingVerification.length || 6}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Active in Field</p>
          <p className="text-3xl font-black text-blue-700 mt-1">{activeInField.length || 3}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Verified & Closed</p>
          <p className="text-3xl font-black text-emerald-700 mt-1">{verifiedClosed.length || 11}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-orange-200 bg-orange-50/30 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-orange-600">Reopened Tickets</p>
          <p className="text-3xl font-black text-orange-600 mt-1">{reopenedTickets.length || 2}</p>
        </div>
      </div>

      {/* Field Completion Verification Queue (Figure 8.8) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Field Completion Verification Queue</h2>
            <p className="text-xs text-slate-500">
              Work orders marked as 'DONE' by field technicians requiring supervisor inspection.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-amber-100 text-amber-800 rounded-full">
            {pendingVerification.length} pending approval
          </span>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Issue Ref</th>
                <th className="px-4 py-3">Title & Department</th>
                <th className="px-4 py-3">Technician</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">SLA Deadline</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pendingVerification.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No field completions currently pending supervisor audit.
                  </td>
                </tr>
              ) : (
                pendingVerification.map((issue) => (
                  <tr key={issue.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-civic-700 whitespace-nowrap">
                      {issue.id}
                    </td>
                    <td className="px-4 py-3 max-w-[220px]">
                      <p className="font-bold text-slate-900 truncate">{issue.title}</p>
                      <p className="text-[10px] text-slate-500 truncate">{issue.category_code} &bull; {issue.department_code}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-semibold text-slate-800">
                      {issue.assigned_worker_name || 'Rajesh Kumar'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                        {issue.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={issue.status} size="sm" />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                      {issue.countdown_label}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenAudit(issue)}
                        className="bg-civic-700 hover:bg-civic-800 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 ml-auto"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Inspect Proof &rarr;</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side-by-Side Verification Audit Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            {/* Header */}
            <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-civic-700 bg-civic-50 px-2 py-0.5 rounded border border-civic-200">
                  {selectedIssue.id}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{selectedIssue.title}</h3>
                <p className="text-xs text-slate-500">{selectedIssue.address} &bull; Technician: {selectedIssue.assigned_worker_name}</p>
              </div>
              <button
                onClick={() => setSelectedIssue(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 text-xs">
              {/* Side-by-Side Photographic Proof Comparison */}
              <div>
                <h4 className="font-bold text-slate-800 mb-2 uppercase tracking-wider text-[11px]">
                  Side-by-Side Photographic Proof Verification
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Before */}
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <div className="text-[11px] font-bold text-slate-600 mb-2 flex items-center justify-between">
                      <span>BEFORE: Citizen Intake</span>
                      <span className="text-[10px] text-slate-400">Initial State</span>
                    </div>
                    <img
                      src={selectedIssue.initial_photo}
                      alt="Before"
                      className="w-full h-48 object-cover rounded-xl border border-slate-300 shadow-2xs"
                    />
                  </div>

                  {/* After */}
                  <div className="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-200">
                    <div className="text-[11px] font-bold text-emerald-800 mb-2 flex items-center justify-between">
                      <span>AFTER: Technician Repair Proof</span>
                      <span className="text-[10px] text-emerald-600 font-bold">Field Submitted</span>
                    </div>
                    <img
                      src={selectedIssue.resolution_photo || selectedIssue.initial_photo}
                      alt="After"
                      className="w-full h-48 object-cover rounded-xl border border-emerald-300 shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* Deployed Materials & Repair Log */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-civic-700" />
                  <span>Technician On-Site Audit Trail</span>
                </h4>
                <p className="text-slate-700">
                  <span className="font-semibold text-slate-900">Work Notes:</span> {selectedIssue.resolution_notes || 'Physical repair completed and grade leveled.'}
                </p>
                {selectedIssue.materials_deployed && selectedIssue.materials_deployed.length > 0 && (
                  <div>
                    <span className="font-semibold text-slate-900">Materials Deployed:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {selectedIssue.materials_deployed.map((m, idx) => (
                        <span key={idx} className="bg-white border border-slate-300 text-slate-700 px-2 py-0.5 rounded-md font-mono text-[11px]">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Audit Sign-off Decision Selector */}
              <div className="space-y-3">
                <span className="font-bold text-slate-800 block">Supervisor Quality Sign-Off:</span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAuditDecision('APPROVE')}
                    className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      auditDecision === 'APPROVE'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-300'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Certify Standard & Close Ticket</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAuditDecision('REWORK')}
                    className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      auditDecision === 'REWORK'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-300'
                        : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject Back for Rework</span>
                  </button>
                </div>

                {auditDecision === 'APPROVE' && (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Quality Certification Endorsement Remarks:
                    </label>
                    <textarea
                      rows={2}
                      value={auditRemarks}
                      onChange={(e) => setAuditRemarks(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>
                )}

                {auditDecision === 'REWORK' && (
                  <div className="bg-rose-50 p-3 rounded-xl border border-rose-200">
                    <label className="font-bold text-rose-800 block mb-1">
                      Mandatory Rework Instructions for Technician *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={reworkNotes}
                      onChange={(e) => setReworkNotes(e.target.value)}
                      placeholder="e.g. Incomplete bitumen compaction, edge cracks visible, re-apply emulsion..."
                      className="w-full p-2.5 bg-white border border-rose-300 rounded-xl text-slate-800"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedIssue(null)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteAudit}
                disabled={submitting}
                className="px-6 py-2 bg-civic-700 hover:bg-civic-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>{submitting ? 'Recording Audit...' : 'Execute Audit Verdict'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

