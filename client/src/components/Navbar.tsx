import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Bell, 
  LogOut, 
  ChevronDown, 
  ShieldCheck, 
  Check, 
  LogIn,
  UserPlus
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, quickLogin, isAuthenticated } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [roleSimulatorOpen, setRoleSimulatorOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isPublicLanding = location.pathname === '/';

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'MUNICIPAL_ADMIN': return 'MUNICIPAL_ADM...';
      case 'DEPARTMENT_OFFICER': return 'OFFICER';
      case 'SUPERVISOR': return 'SUPERVISOR';
      case 'WORKER': return 'WORKER';
      case 'CITIZEN':
      default: return 'CITIZEN';
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'SC';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const personas = [
    { key: 'admin' as const, label: 'Municipal Admin (Commissioner)', role: 'MUNICIPAL_ADMIN', path: '/admin' },
    { key: 'officer' as const, label: 'Roads Officer (Vikram)', role: 'DEPARTMENT_OFFICER', path: '/officer' },
    { key: 'officer_water' as const, label: 'Water Officer (Suresh)', role: 'DEPARTMENT_OFFICER', path: '/officer' },
    { key: 'supervisor' as const, label: 'Quality Supervisor (Anjali)', role: 'SUPERVISOR', path: '/supervisor' },
    { key: 'worker' as const, label: 'Field Technician (Rajesh)', role: 'WORKER', path: '/worker' },
    { key: 'citizen' as const, label: 'Citizen (Aarav Sharma)', role: 'CITIZEN', path: '/citizen' },
  ];

  const handleSwitchRole = async (p: typeof personas[0]) => {
    setRoleSimulatorOpen(false);
    try {
      await quickLogin(p.key);
      navigate(p.path);
    } catch (e) {
      console.error('Role switch failed', e);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Left */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex flex-col group">
              <span className="text-lg font-black tracking-tight text-slate-900 group-hover:text-[#0d6e61] transition-colors leading-tight">
                SmartCivic
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                {isPublicLanding ? 'City Issue & Redressal Portal' : 'WORKSPACE'}
              </span>
            </Link>

            {!isPublicLanding && (
              <div className="hidden sm:block border-l border-slate-200 pl-4 py-1">
                <span className="text-xs font-bold text-slate-800">
                  City Command &amp; Review Portal
                </span>
              </div>
            )}
          </div>

          {/* Center Public Navigation Pill (matching Screenshot 1) */}
          {isPublicLanding && (
            <div className="hidden md:flex items-center bg-slate-100/80 rounded-full px-4 py-1.5 border border-slate-200/60 text-xs font-medium text-slate-600 gap-6">
              <a href="#about" className="hover:text-slate-900 transition-colors">About</a>
              <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How It Works</a>
              <a href="#departments" className="hover:text-slate-900 transition-colors">Departments &amp; Turnaround</a>
            </div>
          )}

          {/* Right Action Desk */}
          <div className="flex items-center gap-3">
            {/* 1-CLICK PERSONA SIMULATOR / SWITCH ROLE (DEMO) BUTTON */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setRoleSimulatorOpen(!roleSimulatorOpen);
                  setDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-400 bg-white text-emerald-700 hover:bg-emerald-50 text-xs font-semibold shadow-2xs transition-all"
                title="1-Click Persona Simulator"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">Switch Role (Demo)</span>
                <ChevronDown className="w-3.5 h-3.5 text-emerald-600" />
              </button>

              {roleSimulatorOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3.5 py-1.5 text-[10px] font-extrabold tracking-wider uppercase text-slate-400 border-b border-slate-100">
                    1-CLICK PERSONA SIMULATOR
                  </div>
                  <div className="py-1">
                    {personas.map((p) => {
                      const isActive =
                        user?.role === p.role &&
                        (p.key === 'officer' ? (user?.department === 'ROADS') : true) &&
                        (p.key === 'officer_water' ? (user?.department === 'WATER') : true);
                      return (
                        <button
                          key={p.key}
                          type="button"
                          onClick={() => handleSwitchRole(p)}
                          className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between group transition-colors"
                        >
                          <span className={isActive ? 'font-bold text-slate-900' : 'text-slate-700'}>
                            {p.label}
                          </span>
                          {isActive && (
                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                {/* Notification Bell with alert dot */}
                <button 
                  type="button"
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full relative transition-colors" 
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-400 rounded-full ring-2 ring-white"></span>
                </button>

                {/* User Pill */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(!dropdownOpen);
                      setRoleSimulatorOpen(false);
                    }}
                    className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center">
                      {getInitials(user?.name)}
                    </div>
                    <div className="text-left text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span>{user?.name || 'User'}</span>
                      <span className="text-[10px] text-slate-500 font-normal">
                        {getRoleBadge(user?.role)}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                        <p className="text-[11px] text-slate-500">{user?.email}</p>
                        <p className="text-[10px] text-teal-700 font-semibold mt-1">
                          Role: {user?.role}
                        </p>
                      </div>
                      <Link
                        to={
                          user?.role === 'MUNICIPAL_ADMIN'
                            ? '/admin'
                            : user?.role === 'DEPARTMENT_OFFICER'
                            ? '/officer'
                            : user?.role === 'SUPERVISOR'
                            ? '/supervisor'
                            : user?.role === 'WORKER'
                            ? '/worker'
                            : '/citizen'
                        }
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                      >
                        Workspace Dashboard
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setDropdownOpen(false);
                          logout();
                          navigate('/');
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium flex items-center gap-1.5"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Public Landing Actions: Sign In & Sign Up */
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 px-3.5 py-2 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-500" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/login?register=true"
                  className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#0d6e61] hover:bg-[#0b5d52] px-4 py-2 rounded-xl shadow-xs transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
