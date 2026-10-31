import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AnalyticsData } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  BarChart3, 
  PieChart as PieIcon, 
  RefreshCw, 
  Building2, 
  CheckCircle2, 
  TrendingUp, 
  ShieldCheck 
} from 'lucide-react';

export const AdminAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.getAnalytics();
      setData(res);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const COLORS = [
    '#0f766e', '#14b8a6', '#0284c7', '#38bdf8', '#6366f1',
    '#a855f7', '#f59e0b', '#ef4444', '#10b981', '#64748b', '#f97316'
  ];

  if (!data) {
    return <div className="text-center py-20 text-xs text-slate-400">Loading Citywide Analytics Suite...</div>;
  }

  const m = data.metrics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200">
            BUSINESS INTELLIGENCE &bull; Executive Command Console
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Executive Citywide Analytics & Department Workload
          </h1>
          <p className="text-xs text-slate-500">
            Interactive Recharts visualizations for SLA compliance, department load distribution, and resolution velocity.
          </p>
        </div>

        <button
          onClick={loadAnalytics}
          className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs px-3.5 py-2 rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-civic-600" />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Top 6 KPI Cards (matching Figure 8.11) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[10px] font-bold uppercase text-slate-400">Total Incidents</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{m.total}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[10px] font-bold uppercase text-blue-600">Active Pipelines</p>
          <p className="text-2xl font-black text-blue-700 mt-1">{m.active}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-red-200 bg-red-50/20 shadow-2xs">
          <p className="text-[10px] font-bold uppercase text-red-600">Critical Severity</p>
          <p className="text-2xl font-black text-red-600 mt-1">{m.critical}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[10px] font-bold uppercase text-emerald-600">Resolved & Verified</p>
          <p className="text-2xl font-black text-emerald-700 mt-1">{m.resolved}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-rose-200 bg-rose-50/30 shadow-2xs">
          <p className="text-[10px] font-bold uppercase text-rose-600">SLA Breached</p>
          <p className="text-2xl font-black text-rose-600 mt-1">{m.breached}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-orange-200 bg-orange-50/20 shadow-2xs">
          <p className="text-[10px] font-bold uppercase text-orange-600">Reopened</p>
          <p className="text-2xl font-black text-orange-600 mt-1">{m.reopened}</p>
        </div>
      </div>

      {/* Main Charts Row (Figure 8.11) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Chart: Departmental Caseload & Resolution BarChart */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-civic-700" />
              <span>Departmental Caseload & Resolution</span>
            </h3>
            <p className="text-xs text-slate-500">
              Total reported vs. successfully resolved tickets by municipal department
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.department_load} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="code" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="total" name="Total Assigned" fill="#0f766e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" name="Resolved & Verified" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Chart: Lifecycle State Distribution Donut Chart */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <PieIcon className="w-4 h-4 text-civic-700" />
              <span>Lifecycle State Distribution</span>
            </h3>
            <p className="text-xs text-slate-500">
              Current proportion of civic tickets across 10 lifecycle stages
            </p>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.state_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {data.state_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px', maxHeight: '60px', overflowY: 'auto' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Departmental Operational Performance Table (Figure 8.11 Bottom) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Departmental Operational Performance</h3>
            <p className="text-xs text-slate-500">Active bodies maintaining city infrastructure</p>
          </div>
          <span className="text-xs font-bold text-civic-700 bg-civic-50 px-2.5 py-1 rounded-lg border border-civic-200">
            Citywide Resolution: {m.resolution_rate}%
          </span>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Department Name</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Total Assigned</th>
                <th className="px-4 py-3">Active Pipeline</th>
                <th className="px-4 py-3">Resolved</th>
                <th className="px-4 py-3 text-right">Resolution Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.department_load.map((dept) => (
                <tr key={dept.code} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-bold text-slate-900">{dept.department}</td>
                  <td className="px-4 py-3 font-mono text-civic-700 font-bold">{dept.code}</td>
                  <td className="px-4 py-3">{dept.total}</td>
                  <td className="px-4 py-3 text-amber-600 font-semibold">{dept.active}</td>
                  <td className="px-4 py-3 text-emerald-600 font-semibold">{dept.resolved}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-block px-2.5 py-0.5 rounded-full font-bold text-xs bg-slate-100 text-slate-800 border border-slate-200">
                      {dept.rate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

