import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  Clock,
  CheckCircle2,
  PlusCircle,
  Search,
  Globe,
  Inbox,
  AlertTriangle,
  Send,
  MapPin,
  ShieldCheck,
  CheckSquare,
  Wrench,
  BarChart3,
  GitPullRequest,
  Sliders,
  History,
  LayoutDashboard
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const role = user.role;

  const getSubTitle = () => {
    switch (role) {
      case 'MUNICIPAL_ADMIN': return 'MUNICIPAL GOVERNANCE';
      case 'WORKER': return 'FIELD CREW OPERATIONS';
      case 'SUPERVISOR': return 'FIELD QUALITY AUDIT';
      case 'DEPARTMENT_OFFICER': return 'ROADS COMMAND';
      case 'CITIZEN':
      default:
        return 'CIVIC OPERATIONS';
    }
  };

  const navItemClass = (isActive: boolean) =>
    `flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs transition-colors ${
      isActive
        ? 'bg-[#d8f2ec] text-[#0a6c5f] font-bold shadow-2xs'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
    }`;

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0">
      <div>
        {/* Brand Header matching screenshots */}
        <div className="mb-6 px-3 py-1">
          <div className="text-base font-black tracking-tight text-slate-900">
            SmartCivic
          </div>
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#0d9488]">
            {getSubTitle()}
          </div>
        </div>

        {/* Navigation Items matching exact figures */}
        <nav className="space-y-1">
          {role === 'MUNICIPAL_ADMIN' && (
            <>
              <NavLink
                to="/admin"
                end
                className={() =>
                  navItemClass(location.pathname === '/admin' && !location.search.includes('view=map'))
                }
              >
                <FileText className="w-4 h-4" />
                <span>City Grievance Master</span>
              </NavLink>

              <NavLink
                to="/admin?view=map"
                className={() =>
                  navItemClass(location.search.includes('view=map'))
                }
              >
                <MapPin className="w-4 h-4" />
                <span>GIS Hotspot Analysis</span>
              </NavLink>

              <NavLink
                to="/admin/analytics"
                className={({ isActive }) => navItemClass(isActive)}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Citywide Analytics</span>
              </NavLink>

              <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs text-slate-400 font-medium cursor-not-allowed">
                <GitPullRequest className="w-4 h-4" />
                <span>Automated Routing Engine</span>
              </div>

              <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs text-slate-400 font-medium cursor-not-allowed">
                <Sliders className="w-4 h-4" />
                <span>Department SLA Matrix</span>
              </div>

              <NavLink
                to="/admin/audit"
                className={({ isActive }) => navItemClass(isActive)}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Security & Audit Ledger</span>
              </NavLink>

              <NavLink
                to="/track"
                className={({ isActive }) => navItemClass(isActive)}
              >
                <Search className="w-4 h-4" />
                <span>Track Reference ID</span>
              </NavLink>
            </>
          )}

          {role === 'WORKER' && (
            <>
              <NavLink
                to="/worker"
                end
                className={() =>
                  navItemClass(!location.search.includes('completed'))
                }
              >
                <Wrench className="w-4 h-4" />
                <span>Active Work Orders</span>
              </NavLink>

              <NavLink
                to="/worker?tab=completed"
                className={() =>
                  navItemClass(location.search.includes('completed'))
                }
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Completed Repairs</span>
              </NavLink>

              <NavLink
                to="/track"
                className={({ isActive }) => navItemClass(isActive)}
              >
                <Search className="w-4 h-4" />
                <span>Track Reference ID</span>
              </NavLink>
            </>
          )}

          {role === 'DEPARTMENT_OFFICER' && (
            <>
              <NavLink
                to="/officer"
                end
                className={() =>
                  navItemClass(location.pathname === '/officer' && !location.search.includes('view=map'))
                }
              >
                <Inbox className="w-4 h-4" />
                <span>Command Triage Desk</span>
              </NavLink>

              <NavLink
                to="/officer?tab=new"
                className={() =>
                  navItemClass(location.search.includes('new'))
                }
              >
                <FileText className="w-4 h-4" />
                <span>New Intake (Pending)</span>
              </NavLink>

              <NavLink
                to="/officer?tab=breached"
                className={() =>
                  navItemClass(location.search.includes('breached'))
                }
              >
                <AlertTriangle className="w-4 h-4" />
                <span>SLA Breaches & Alerts</span>
              </NavLink>

              <NavLink
                to="/officer?tab=assigned"
                className={() =>
                  navItemClass(location.search.includes('assigned'))
                }
              >
                <Send className="w-4 h-4" />
                <span>Field Crew Dispatches</span>
              </NavLink>

              <NavLink
                to="/officer?view=map"
                className={() =>
                  navItemClass(location.search.includes('view=map'))
                }
              >
                <MapPin className="w-4 h-4" />
                <span>Ward GIS & Heatmap</span>
              </NavLink>

              <NavLink
                to="/track"
                className={({ isActive }) => navItemClass(isActive)}
              >
                <Search className="w-4 h-4" />
                <span>Track Reference ID</span>
              </NavLink>
            </>
          )}

          {role === 'SUPERVISOR' && (
            <>
              <NavLink
                to="/supervisor"
                end
                className={() =>
                  navItemClass(!location.search.includes('verified'))
                }
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Quality Verification Desk</span>
              </NavLink>

              <NavLink
                to="/supervisor?tab=verified"
                className={() =>
                  navItemClass(location.search.includes('verified'))
                }
              >
                <CheckSquare className="w-4 h-4" />
                <span>Verified Closures</span>
              </NavLink>

              <NavLink
                to="/track"
                className={({ isActive }) => navItemClass(isActive)}
              >
                <Search className="w-4 h-4" />
                <span>Track Reference ID</span>
              </NavLink>
            </>
          )}

          {role === 'CITIZEN' && (
            <>
              <NavLink
                to="/citizen"
                end
                className={({ isActive }) => navItemClass(isActive && !location.search.includes('tab='))}
              >
                <FileText className="w-4 h-4" />
                <span>All My Grievances</span>
              </NavLink>

              <NavLink
                to="/citizen?tab=active"
                className={() =>
                  navItemClass(location.search.includes('active'))
                }
              >
                <Clock className="w-4 h-4" />
                <span>In Progress / Active</span>
              </NavLink>

              <NavLink
                to="/citizen?tab=resolved"
                className={() =>
                  navItemClass(location.search.includes('resolved'))
                }
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Resolved Tickets</span>
              </NavLink>

              <NavLink
                to="/report"
                className={({ isActive }) => navItemClass(isActive)}
              >
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>File New Grievance</span>
              </NavLink>

              <NavLink
                to="/track"
                className={({ isActive }) => navItemClass(isActive)}
              >
                <Search className="w-4 h-4 text-sky-600" />
                <span>Track Reference ID</span>
              </NavLink>
            </>
          )}
        </nav>
      </div>

      {/* Footer link to public portal */}
      <div className="pt-4 border-t border-slate-100">
        <NavLink
          to="/"
          className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <Globe className="w-4 h-4 text-civic-600" />
          <span>Public Portal</span>
        </NavLink>
      </div>
    </aside>
  );
};
