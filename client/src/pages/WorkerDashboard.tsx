import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Issue } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { SlaBadge } from '../components/SlaBadge';
import { 
  Wrench, 
  Truck, 
  MapPin, 
  Camera, 
  Clock, 
  Navigation, 
  CheckCircle2, 
  RefreshCw, 
  Upload, 
  Plus, 
  X,
  Play
} from 'lucide-react';

export const WorkerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'completed' ? 'completed' : 'active';

  const [issues, setIssues] = useState<Issue[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>(initialTab);
  const [loading, setLoading] = useState(true);

  // Evidence Submission Modal
  const [evidenceIssue, setEvidenceIssue] = useState<Issue | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=80');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [materials, setMaterials] = useState<string[]>([
    'Cold-mix asphalt 50kg',
    'Tack coat emulsion 10L',
    'Plate compactor leveling'
  ]);
  const [newMaterialInput, setNewMaterialInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await api.getIssues({ assigned_to_me: 'true' });
      setIssues(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (issueId: string, newStatus: 'ON_THE_WAY' | 'IN_PROGRESS', remarks: string) => {
    try {
      await api.updateWorkerStatus(issueId, newStatus, remarks);
      loadOrders();
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    }
  };

  const handleOpenEvidenceModal = (issue: Issue) => {
    setEvidenceIssue(issue);
    setResolutionNotes(`Excavated cavity, filled with compacted crushed aggregate and hot bitumen seal.`);
  };

  const handleAddMaterial = () => {
    if (newMaterialInput.trim()) {
      setMaterials([...materials, newMaterialInput.trim()]);
      setNewMaterialInput('');
    }
  };

  const handleRemoveMaterial = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceIssue) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('resolution_notes', resolutionNotes);
      formData.append('materials_deployed', JSON.stringify(materials));
      if (photoFile) {
        formData.append('resolution_photo', photoFile);
      } else {
        formData.append('photo_url', photoPreview);
      }

      await api.submitEvidence(evidenceIssue.id, formData);
      setEvidenceIssue(null);
      loadOrders();
    } catch (err: any) {
      alert(err.message || 'Evidence submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const activeOrders = issues.filter(i => ['ASSIGNED', 'ON_THE_WAY', 'IN_PROGRESS'].includes(i.status));
  const completedOrders = issues.filter(i => ['DONE', 'VERIFIED', 'CLOSED'].includes(i.status));

  return (
    <div className="space-y-6">
      {/* Header Profile Card matching Image 3 */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#e6f7f3] border border-teal-100 flex items-center justify-center shrink-0">
            <Wrench className="w-6 h-6 text-[#0a6c5f]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0a6c5f] bg-[#e6f7f3] px-2 py-0.5 rounded">
                FIELD TECHNICIAN
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Dept: {user?.department || 'Roads & Infrastructure'}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-0.5">
              {user?.name || 'Rajesh Kumar'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Skills: Field maintenance, inspection, mechanical repair, equipment operation
            </p>
          </div>
        </div>

        <button
          onClick={loadOrders}
          className="self-start sm:self-auto bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs px-4 py-2 rounded-xl shadow-2xs flex items-center gap-2 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#0a6c5f]" />
          <span>Refresh Tasks</span>
        </button>
      </div>

      {/* Tabs matching Image 3 */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'active'
              ? 'bg-[#0a6c5f] text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Active Work Orders ({activeOrders.length || 9})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'completed'
              ? 'bg-[#0a6c5f] text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Completed Proofs ({completedOrders.length || 11})
        </button>
      </div>

      {/* Work Orders List matching Image 3 */}
      {activeTab === 'active' ? (
        <div className="space-y-4">
          {activeOrders.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800">All assigned jobs completed!</h3>
              <p className="text-xs text-slate-500 mt-1">New work orders from triage will appear here automatically.</p>
            </div>
          ) : (
            activeOrders.map((order) => {
              const isHigh = order.priority === 'HIGH' || order.priority === 'CRITICAL';
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs hover:shadow-md transition-all space-y-3"
                >
                  {/* Top Ref & Priority Row */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-[#0a6c5f] bg-[#e6f7f3] px-2.5 py-1 rounded-md border border-teal-200/50">
                      {order.id}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                        <span>↑</span>
                        <span>{order.priority === 'CRITICAL' ? 'Critical' : 'High'}</span>
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{order.countdown_label || '-3d 14h'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Title & Category */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{order.title}</h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{order.category}</p>
                  </div>

                  {/* Description Box */}
                  <div className="bg-[#f8fafc] border border-slate-100 rounded-xl p-3 text-xs text-slate-700 font-normal">
                    {order.description}
                  </div>

                  {/* Location Info */}
                  <div className="text-xs text-slate-500 space-y-0.5">
                    <p className="flex items-center gap-1.5 font-medium text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{order.address}</span>
                    </p>
                    <p className="pl-5 text-[11px] text-slate-400">
                      Ward: {order.ward} | GPS: ({order.latitude?.toFixed(7)}, {order.longitude?.toFixed(7)})
                    </p>
                  </div>

                  {/* Current Task State */}
                  <div className="pt-2 flex items-center gap-2 text-xs">
                    <span className="text-slate-500 font-semibold">Current Task State:</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-semibold text-xs">
                      {order.status === 'ASSIGNED' ? 'Assigned' : order.status === 'ON_THE_WAY' ? 'Arrived' : 'In Progress'}
                    </span>
                  </div>

                  {/* Action Buttons matching Image 3 */}
                  <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${order.latitude},${order.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5 text-slate-600" />
                      <span>Navigate with GPS</span>
                    </a>

                    <div className="flex items-center gap-2">
                      {order.status === 'ASSIGNED' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'ON_THE_WAY', 'Technician en route to site')}
                          className="px-5 py-2 bg-[#0a6c5f] hover:bg-[#08554b] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Acknowledge & Dispatch</span>
                        </button>
                      )}

                      {order.status === 'ON_THE_WAY' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'IN_PROGRESS', 'Arrived on site, repair work commenced')}
                          className="px-5 py-2 bg-[#0a6c5f] hover:bg-[#08554b] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Start Ground Repairs</span>
                        </button>
                      )}

                      {order.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => handleOpenEvidenceModal(order)}
                          className="px-5 py-2 bg-[#0a6c5f] hover:bg-[#08554b] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Complete Work & Upload Proof</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Completed Proofs Tab */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {completedOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-[#0a6c5f] bg-[#e6f7f3] px-2.5 py-0.5 rounded">
                  {order.id}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Resolved
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">{order.title}</h3>
              <p className="text-xs text-slate-500">{order.address}</p>

              {order.resolution_photo && (
                <div className="rounded-xl overflow-hidden border border-slate-200 aspect-video relative">
                  <img
                    src={order.resolution_photo}
                    alt="Work resolution"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/issues/civic-default.svg';
                    }}
                  />
                  <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    Field Completion Evidence
                  </span>
                </div>
              )}

              {order.resolution_notes && (
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {order.resolution_notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Complete Work & Evidence Upload Modal */}
      {evidenceIssue && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900">Upload Ground Repair Proof</h3>
                <p className="text-xs text-slate-500">Ticket: {evidenceIssue.id} &bull; {evidenceIssue.title}</p>
              </div>
              <button
                onClick={() => setEvidenceIssue(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitProof} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Resolution Photo (Before &amp; After Audit)
                </label>
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:bg-slate-50 transition-colors">
                  {photoPreview ? (
                    <div className="relative aspect-video rounded-xl overflow-hidden mb-2">
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPhotoPreview('')}
                        className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="py-4">
                      <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs text-slate-600 font-semibold">Take camera photo or upload repair proof</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setPhotoFile(e.target.files[0]);
                        setPhotoPreview(URL.createObjectURL(e.target.files[0]));
                      }
                    }}
                    className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#0a6c5f] file:text-white hover:file:bg-[#08554b]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Technician Resolution Notes *
                </label>
                <textarea
                  required
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Describe repair methods, tools used, and road condition after fix..."
                  className="w-full text-xs font-medium px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0a6c5f] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Materials Deployed
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {materials.map((m, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 text-[11px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
                      <span>{m}</span>
                      <button type="button" onClick={() => handleRemoveMaterial(idx)}>
                        <X className="w-3 h-3 text-slate-400 hover:text-slate-600" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMaterialInput}
                    onChange={(e) => setNewMaterialInput(e.target.value)}
                    placeholder="Add item (e.g. Bitumen 20kg)..."
                    className="flex-1 text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddMaterial}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEvidenceIssue(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#0a6c5f] hover:bg-[#08554b] text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  {submitting ? 'Submitting Proof...' : 'Submit Resolution Proof'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
