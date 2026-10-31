import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { 
  Building2, 
  Search, 
  PlusCircle, 
  UserPlus, 
  MapPin, 
  Clock, 
  CheckCircle, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  Layers,
  FileCheck2,
  Check
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [trackId, setTrackId] = useState('');
  const navigate = useNavigate();

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackId.trim()) {
      navigate(`/track/${trackId.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-['Inter',sans-serif]">
      {/* Top Hero Section (Figure: Public Landing Page Hero Section) */}
      <section className="pt-12 pb-16 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6">
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Report Civic Issues.<br />
              <span className="text-[#0d6e61]">Track Real–Time City Repairs.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
              SmartCivic connects residents directly with city maintenance teams. Spot a pothole,
              broken streetlight, or water leak? Submit a photo with GPS location, and track the fix
              from start to finish.
            </p>

            {/* Track an Existing Report Box (matching Screenshot 1) */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs max-w-lg">
              <div className="text-[11px] font-semibold text-slate-600 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold text-slate-700">
                  <Search className="w-3.5 h-3.5 text-slate-500" />
                  Track an Existing Report
                </span>
                <span className="text-[11px] text-slate-400">No login required</span>
              </div>
              <form onSubmit={handleTrack} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={trackId}
                    onChange={(e) => setTrackId(e.target.value)}
                    placeholder="Enter Reference ID (e.g. SC-2026-00001)"
                    className="w-full text-xs pl-8 pr-3 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#0d6e61]"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#0d6e61] hover:bg-[#0b5d52] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors shrink-0"
                >
                  Track Status
                </button>
              </form>
            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                to="/report"
                className="bg-[#0d6e61] hover:bg-[#0b5d52] text-white font-bold text-xs px-5 py-3 rounded-xl shadow-xs transition-all flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Report an Issue</span>
              </Link>
              <Link
                to="/login?register=true"
                className="bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs px-5 py-3 rounded-xl border border-slate-300 shadow-2xs transition-colors flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4 text-slate-600" />
                <span>Create Citizen Account</span>
              </Link>
            </div>

            {/* Bullet Indicators Row */}
            <div className="flex flex-wrap items-center gap-6 pt-2 text-[11px] text-slate-600">
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#0d6e61]" />
                <span>Geotagged Photo Verification</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Clear 24h–48h Turnaround</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-[#0d6e61]" />
                <span>Direct Citizen Feedback</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Card with Image (matching Screenshot 1) */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xl">
              <img
                src="/images/hero-team.jpg"
                alt="Rapid Field Action & Transparent Oversight"
                className="w-full h-64 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=900&auto=format&fit=crop&q=80';
                }}
              />
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Rapid Field Action & Transparent Oversight
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Connecting citizens, municipal officers, and field technicians across all city wards with photo & GPS verification.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[9px] uppercase font-bold text-slate-400">AVERAGE SLA</p>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">24h–48h Turnaround</p>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[9px] uppercase font-bold text-slate-400">PROOF STANDARD</p>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">Before & After Proof</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Feature Cards (Figure: Civic Problem Category Directory with Real-Time Issue Volume Counts and Status Indicators - Top) */}
      <section id="about" className="py-12 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-[#f8fbfb] border border-[#e2f0ed]">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#0d6e61] border border-teal-100 flex items-center justify-center mb-4">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-2">GPS & Photo Proof</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Every issue includes precise location data and photos so maintenance teams can find and fix problems quickly without guesswork.
              </p>
              <div className="text-[11px] font-semibold text-[#0d6e61] flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>Accurate field locations</span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-[#f8fbfb] border border-[#e2f0ed]">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#0d6e61] border border-teal-100 flex items-center justify-center mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-2">Duplicate Grouping</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                If multiple neighbors report the same issue within 50 meters, the system groups them together to increase priority.
              </p>
              <div className="text-[11px] font-semibold text-[#0d6e61] flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>Prevents duplicate work orders</span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-[#f8fbfb] border border-[#e2f0ed]">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#0d6e61] border border-teal-100 flex items-center justify-center mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-2">Clear Turnaround Deadlines</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Every category has a target resolution window. If a repair is delayed, it automatically escalates to senior supervisors.
              </p>
              <div className="text-[11px] font-semibold text-[#0d6e61] flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>12h to 48h targets</span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-[#f8fbfb] border border-[#e2f0ed]">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#0d6e61] border border-teal-100 flex items-center justify-center mb-4">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-2">Completed Fix Verification</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Field workers upload an after-repair photo before marking any ticket complete, allowing residents to verify the resolution.
              </p>
              <div className="text-[11px] font-semibold text-[#0d6e61] flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>Verified before closure</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How City Issues Get Resolved (matching Screenshot 2) */}
      <section id="how-it-works" className="py-16 bg-[#fcfdfe] border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 text-center">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            How City Issues Get Resolved
          </h2>
          <p className="text-xs text-slate-500 mt-1 mb-10">
            From your phone straight to the repair crew on site in four simple steps.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-2xs group text-left">
              <div className="relative h-36">
                <img
                  src="/images/step-1.jpg"
                  alt="Step 01"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&auto=format&fit=crop&q=80';
                  }}
                />
                <span className="absolute top-2 right-2 bg-slate-900/80 text-white font-bold text-[10px] px-2 py-0.5 rounded-full backdrop-blur-xs">
                  01
                </span>
              </div>
              <div className="p-4">
                <h4 className="text-xs font-bold text-slate-900">Pinpoint &amp; Geotag</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Resident submits photo with sub-meter GPS coordinates.
                </p>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-2xs group text-left">
              <div className="relative h-36">
                <img
                  src="/images/step-2.jpg"
                  alt="Step 02"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80';
                  }}
                />
                <span className="absolute top-2 right-2 bg-slate-900/80 text-white font-bold text-[10px] px-2 py-0.5 rounded-full backdrop-blur-xs">
                  02
                </span>
              </div>
              <div className="p-4">
                <h4 className="text-xs font-bold text-slate-900">Department Intake Triage</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Ward officer reviews, enforces statutory SLA priority, and dispatches crew.
                </p>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-2xs group text-left">
              <div className="relative h-36">
                <img
                  src="/images/step-3.jpg"
                  alt="Step 03"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80';
                  }}
                />
                <span className="absolute top-2 right-2 bg-slate-900/80 text-white font-bold text-[10px] px-2 py-0.5 rounded-full backdrop-blur-xs">
                  03
                </span>
              </div>
              <div className="p-4">
                <h4 className="text-xs font-bold text-slate-900">Field Redressal Action</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Technician completes repairs, logs materials, and uploads after proof.
                </p>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-2xs group text-left">
              <div className="relative h-36">
                <img
                  src="/images/step-4.jpg"
                  alt="Step 04"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&auto=format&fit=crop&q=80';
                  }}
                />
                <span className="absolute top-2 right-2 bg-slate-900/80 text-white font-bold text-[10px] px-2 py-0.5 rounded-full backdrop-blur-xs">
                  04
                </span>
              </div>
              <div className="p-4">
                <h4 className="text-xs font-bold text-slate-900">Audit &amp; Citizen Rating</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Supervisor certifies quality standard. Citizen rates redressal with 48h reopen window.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="departments" className="mt-auto bg-slate-900 text-slate-400 py-8 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-sm">SmartCivic</span>
            <span className="text-slate-500">&bull; City Issue & Redressal Portal</span>
          </div>
          <div className="text-slate-400">
            Nirma University &bull; Full-Stack Development Innovative Assignment
          </div>
        </div>
      </footer>
    </div>
  );
};
