import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AuditRecord } from '../types';
import { 
  History, 
  Search, 
  RefreshCw, 
  ShieldCheck, 
  Lock, 
  ArrowRight,
  Terminal
} from 'lucide-react';

export const AdminAuditPage: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  useEffect(() => {
    loadAudit();
  }, []);

  const loadAudit = async () => {
    setLoading(true);
    try {
      const data = await api.getAudit();
      setAuditLogs(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = !search ||
      log.issue_id.toLowerCase().includes(search.toLowerCase()) ||
      log.actor_name.toLowerCase().includes(search.toLowerCase()) ||
      log.remarks.toLowerCase().includes(search.toLowerCase()) ||
      log.ip_address.includes(search);

    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6">
      {/* Header (Figure 8.12) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200">
            MUNICIPAL GOVERNANCE & AUDIT &bull; System Administrator
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Forensic System Audit Trail
          </h1>
          <p className="text-xs text-slate-500">
            Append-only immutable record of all lifecycle events and state mutations.
          </p>
        </div>

        <button
          onClick={loadAudit}
          className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs px-3.5 py-2 rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-civic-600" />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Audit Ledger Panel (Figure 8.12) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full sm:w-96">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ticket ID, actor, or remarks..."
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px] font-medium">
              Showing {filteredLogs.length} ledger events
            </span>
            <div className="flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-emerald-200">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span>Tamper Evident</span>
            </div>
          </div>
        </div>

        {/* Ledger Table (matching Figure 8.12) */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Issue Ticket</th>
                <th className="px-4 py-3">Actor & Role</th>
                <th className="px-4 py-3">Action Event</th>
                <th className="px-4 py-3">Event Details & Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400 font-sans">
                    No ledger entries match search.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-bold text-civic-700">
                      {log.issue_id}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="font-bold text-slate-900">{log.actor_name}</p>
                      <span className="text-[10px] text-slate-400 uppercase font-sans font-semibold">
                        {log.actor_role} &bull; {log.ip_address}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-bold text-slate-800">
                      <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-md font-sans">
                      {log.previous_status && log.new_status ? (
                        <div className="flex items-center gap-1.5 mb-1 text-[10px] font-bold">
                          <span className="text-slate-400">{log.previous_status}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span className="text-civic-700">{log.new_status}</span>
                        </div>
                      ) : null}
                      <p className="text-xs text-slate-700 leading-snug">{log.remarks}</p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

