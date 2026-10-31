import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LeafletMap } from '../components/LeafletMap';
import { DuplicateAlertModal } from '../components/DuplicateAlertModal';
import { Category, Issue } from '../types';
import { 
  Building2, 
  MapPin, 
  Camera, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  Upload, 
  AlertTriangle,
  Car,
  Droplets,
  Lightbulb,
  Waves,
  Trash2,
  Trees,
  HelpCircle,
  Crosshair,
  Search,
  Check,
  AlertCircle,
  Sparkles
} from 'lucide-react';

export const ReportIssuePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Wizard Steps: 1 = Category, 2 = Location Map, 3 = Details & Photo, 4 = Review & Submit
  const [step, setStep] = useState(1);

  // Form State
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('cat') || 'pothole');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCoord, setSelectedCoord] = useState<[number, number]>([23.0305, 72.5645]);
  const [address, setAddress] = useState('Near Navrangpura, Ahmedabad');
  const [ward, setWard] = useState('Ward 4 - Riverside');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80');
  
  // Geolocation Permission & Status State
  const [geoStatus, setGeoStatus] = useState<{
    loading: boolean;
    message: string;
    type: 'idle' | 'loading' | 'success' | 'error';
    accuracy?: number;
  }>({
    loading: false,
    message: '',
    type: 'idle'
  });

  // Landmark search input
  const [landmarkSearch, setLandmarkSearch] = useState('');
  const [searchingLandmark, setSearchingLandmark] = useState(false);

  // Duplicate Detection State
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [nearbyDuplicates, setNearbyDuplicates] = useState<Issue[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {});
  }, []);

  // Request user location via browser Geolocation API
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus({
        loading: false,
        message: 'GPS geolocation is not supported by your browser. Please click on the map.',
        type: 'error'
      });
      return;
    }

    setGeoStatus({
      loading: true,
      message: 'Requesting GPS permission from your device...',
      type: 'loading'
    });

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = Math.round(pos.coords.accuracy || 10);

        setSelectedCoord([lat, lng]);
        setGeoStatus({
          loading: false,
          message: `Exact GPS location acquired with ±${accuracy}m precision!`,
          type: 'success',
          accuracy
        });

        // Auto reverse geocode coordinates to street address
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          if (res.ok) {
            const data = await res.json();
            if (data.display_name) {
              setAddress(data.display_name.split(',').slice(0, 3).join(', '));
            }
          }
        } catch {
          setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        }
      },
      (err) => {
        let msg = 'Unable to extract location.';
        if (err.code === 1) {
          msg = 'Location permission was denied. You can click on the map or type your address manually below.';
        } else if (err.code === 2) {
          msg = 'Position unavailable. Please select your location on the map.';
        } else if (err.code === 3) {
          msg = 'GPS request timed out. Please click directly on the map.';
        }
        setGeoStatus({
          loading: false,
          message: msg,
          type: 'error'
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  // Search by landmark or address
  const handleSearchLandmark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!landmarkSearch.trim()) return;
    setSearchingLandmark(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          landmarkSearch.trim() + ', India'
        )}&limit=1`
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          setSelectedCoord([lat, lon]);
          setAddress(data[0].display_name.split(',').slice(0, 3).join(', '));
          setGeoStatus({
            loading: false,
            message: `Map centered on "${landmarkSearch.trim()}"`,
            type: 'success'
          });
        } else {
          setGeoStatus({
            loading: false,
            message: `Location "${landmarkSearch}" not found. Try another landmark or click on map.`,
            type: 'error'
          });
        }
      }
    } catch {
      setGeoStatus({
        loading: false,
        message: 'Could not connect to geocoding service. Please click directly on the map.',
        type: 'error'
      });
    } finally {
      setSearchingLandmark(false);
    }
  };

  const getCategoryVisual = (code: string) => {
    switch (code) {
      case 'pothole':
        return {
          icon: Car,
          bg: 'bg-amber-50 text-amber-700 border-amber-200/80',
          label: 'Roads'
        };
      case 'water_leak':
        return {
          icon: Droplets,
          bg: 'bg-blue-50 text-blue-700 border-blue-200/80',
          label: 'Water'
        };
      case 'streetlight':
        return {
          icon: Lightbulb,
          bg: 'bg-yellow-50 text-amber-700 border-yellow-200/80',
          label: 'Lighting'
        };
      case 'sewer':
        return {
          icon: Waves,
          bg: 'bg-cyan-50 text-cyan-800 border-cyan-200/80',
          label: 'Sanitation'
        };
      case 'garbage':
        return {
          icon: Trash2,
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
          label: 'Waste'
        };
      case 'tree':
        return {
          icon: Trees,
          bg: 'bg-green-50 text-green-800 border-green-200/80',
          label: 'Parks'
        };
      case 'traffic_light':
        return {
          icon: AlertTriangle,
          bg: 'bg-rose-50 text-rose-700 border-rose-200/80',
          label: 'Traffic'
        };
      case 'other':
      default:
        return {
          icon: HelpCircle,
          bg: 'bg-purple-50 text-purple-700 border-purple-200/80',
          label: 'General'
        };
    }
  };

  const getCategoryIcon = (code: string) => {
    switch (code) {
      case 'pothole': return Car;
      case 'water_leak': return Droplets;
      case 'streetlight': return Lightbulb;
      case 'sewer': return Waves;
      case 'garbage': return Trash2;
      case 'tree': return Trees;
      case 'traffic_light': return AlertTriangle;
      default: return HelpCircle;
    }
  };

  const handleCoordSelect = (coord: [number, number], resolvedAddress?: string) => {
    setSelectedCoord(coord);
    if (resolvedAddress) {
      setAddress(resolvedAddress);
    }
    setGeoStatus({
      loading: false,
      message: `Pin set at: ${coord[0].toFixed(5)}, ${coord[1].toFixed(5)}`,
      type: 'success'
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  // Step 2 -> 3 Transition: Run Proximity Duplicate Detection
  const handleProceedFromLocation = async () => {
    try {
      const res = await api.checkDuplicate(selectedCoord[0], selectedCoord[1], selectedCategory);
      if (res.has_duplicate && res.duplicates.length > 0) {
        setNearbyDuplicates(res.duplicates);
        setDuplicateModalOpen(true);
        return;
      }
    } catch {
      // ignore
    }
    setStep(3);
  };

  const handleUpvoteDuplicate = async (dupId: string) => {
    try {
      await api.upvoteIssue(dupId);
      navigate(`/track/${dupId}?upvoted=true`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upvote');
    }
  };

  const handleProceedAnyway = () => {
    setDuplicateModalOpen(false);
    setStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setErrorMsg('Please enter both an issue title and description.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category_code', selectedCategory);
      formData.append('latitude', selectedCoord[0].toString());
      formData.append('longitude', selectedCoord[1].toString());
      formData.append('address', address);
      formData.append('ward', ward);
      if (photoFile) {
        formData.append('photo', photoFile);
      } else {
        formData.append('photo_url', photoPreview);
      }

      const created = await api.createIssue(formData);
      navigate(`/track/${created.id}?new=true`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create grievance ticket');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Top Header matching Screenshot 3 */}
        <div className="text-center mb-8">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0a6c5f] bg-[#e6f7f3] border border-teal-200/50 px-3 py-1 rounded-full">
            Citizen Grievance Submission Desk
          </span>
          <h1 className="text-3xl font-black text-slate-900 mt-2">Report a Civic Grievance</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Submit a photo and GPS location to trigger dispatch to the responsible municipal department.
          </p>
        </div>

        {/* 5-Step Milestone Progress Bar matching Screenshot 3 */}
        <div className="mb-8 max-w-2xl mx-auto">
          <div className="grid grid-cols-5 text-center">
            {[
              { num: 1, label: 'Category' },
              { num: 2, label: 'Evidence' },
              { num: 3, label: 'Location' },
              { num: 4, label: 'Details' },
              { num: 5, label: 'Review' }
            ].map((s) => (
              <div key={s.num} className="relative">
                <div
                  className={`w-9 h-9 mx-auto rounded-full font-bold text-xs flex items-center justify-center transition-all ${
                    step >= s.num
                      ? 'bg-[#0a6c5f] text-white shadow-md'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {step > s.num ? <CheckCircle2 className="w-5 h-5 text-emerald-300" /> : s.num}
                </div>
                <p className={`text-xs mt-1 font-semibold ${step >= s.num ? 'text-slate-900' : 'text-slate-400'}`}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Wizard Step 1: Category Picker (matching 2-column layout in Screenshot 3) */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-black text-slate-900">Select Issue Category</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose the category that best describes the issue for automated routing to the responsible department.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((c) => {
                const isSelected = selectedCategory === c.code;
                const visual = getCategoryVisual(c.code);
                const Icon = visual.icon;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => setSelectedCategory(c.code)}
                    className={`p-4 rounded-2xl text-left border-2 transition-all flex items-center gap-4 ${
                      isSelected
                        ? 'border-[#0a6c5f] bg-[#e6f7f3]/40 shadow-xs ring-2 ring-[#0a6c5f]/10'
                        : 'border-slate-200 hover:border-slate-300 bg-white shadow-2xs hover:shadow-xs'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center shrink-0 ${visual.bg}`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 leading-snug truncate">{c.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">{c.description}</p>
                    </div>
                    {isSelected ? (
                      <div className="w-6 h-6 rounded-full bg-[#0a6c5f] text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-200 shrink-0"></div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                &lt; Back
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep(2);
                }}
                className="bg-[#0a6c5f] hover:bg-[#08554b] text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                <span>Continue &gt;</span>
              </button>
            </div>
          </div>
        )}

        {/* Wizard Step 2: Leaflet GPS Geopicker with User Location Permission */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Pinpoint Exact Incident Location</h2>
                <p className="text-xs text-slate-500">
                  Allow browser GPS access to extract your exact position, or click directly on the map.
                </p>
              </div>

              {/* Prominent Auto-Detect GPS Button */}
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={geoStatus.loading}
                className="bg-gradient-to-r from-teal-600 to-civic-700 hover:from-teal-700 hover:to-civic-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 shrink-0 active:scale-95"
              >
                <Crosshair className={`w-4 h-4 ${geoStatus.loading ? 'animate-spin' : ''}`} />
                <span>{geoStatus.loading ? 'Extracting GPS...' : 'Use My Current Location'}</span>
              </button>
            </div>

            {/* Geolocation Status / Feedback Banner */}
            {geoStatus.message && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  geoStatus.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : geoStatus.type === 'error'
                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                    : 'bg-blue-50 text-blue-800 border-blue-200'
                }`}
              >
                {geoStatus.type === 'success' && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                {geoStatus.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                {geoStatus.type === 'loading' && (
                  <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
                )}
                <span className="font-medium">{geoStatus.message}</span>
              </div>
            )}

            {/* Address / Landmark Search Bar for convenience */}
            <form onSubmit={handleSearchLandmark} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={landmarkSearch}
                  onChange={(e) => setLandmarkSearch(e.target.value)}
                  placeholder="Or search by landmark / area (e.g. Navrangpura Bus Station, MG Road)..."
                  className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-civic-600"
                />
              </div>
              <button
                type="submit"
                disabled={searchingLandmark}
                className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-xl shrink-0"
              >
                {searchingLandmark ? 'Searching...' : 'Find on Map'}
              </button>
            </form>

            {/* Map Container */}
            <div>
              <LeafletMap
                center={selectedCoord}
                zoom={15}
                selectable={true}
                selectedCoord={selectedCoord}
                onSelectCoord={handleCoordSelect}
                height="380px"
              />
            </div>

            {/* Resolved Location Details Form */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <label className="font-semibold text-slate-700">GPS Coordinates</label>
                <p className="font-mono text-civic-700 font-bold mt-1">
                  {selectedCoord[0].toFixed(5)}, {selectedCoord[1].toFixed(5)}
                </p>
              </div>
              <div>
                <label className="font-semibold text-slate-700">Street / Landmark Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700">Municipal Ward</label>
                <select
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium"
                >
                  <option value="Ward 4 - Riverside">Ward 4 - Riverside</option>
                  <option value="Ward 7 - West Zone">Ward 7 - West Zone</option>
                  <option value="Ward 12 - Suburb">Ward 12 - Suburb</option>
                  <option value="Ward 2 - Deccan">Ward 2 - Deccan</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleProceedFromLocation}
                className="bg-civic-700 hover:bg-civic-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <span>Continue to Issue Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Wizard Step 3: Issue Details & Mandatory Photo Upload */}
        {step === 3 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Issue Details & Evidence Photo</h2>
            <p className="text-xs text-slate-500 mb-6">
              Provide a clear title, description, and attach photographic proof so the repair crew can diagnose equipment needs in advance.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Issue Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Deep crater pothole near bus stop 4"
                  className="w-full text-xs font-medium px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-civic-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Incident Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the severity, duration, and safety hazards..."
                  className="w-full text-xs font-medium px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-civic-600 focus:outline-hidden"
                />
              </div>

              {/* Photo Upload Box with Camera Support */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Mandatory Photo Evidence <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div className="border-2 border-dashed border-slate-300 hover:border-civic-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/60">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      id="photo-upload"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <label htmlFor="photo-upload" className="cursor-pointer block">
                      <Camera className="w-8 h-8 text-civic-600 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-800">Take Photo or Upload Image</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Click to open camera or browse files</p>
                    </label>
                  </div>

                  {photoPreview && (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm group h-40">
                      <img
                        src={photoPreview}
                        alt="Evidence Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
                        Photo Attached
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                disabled={!title.trim() || !description.trim()}
                className="bg-civic-700 hover:bg-civic-800 disabled:opacity-50 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <span>Review & Submit</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Wizard Step 4: Final Review & Submission */}
        {step === 4 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Final Submission Review</h2>
            <p className="text-xs text-slate-500 mb-6">
              Review your report details. Once submitted, a statutory SLA countdown timer will be initiated.
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <div className="border border-slate-200 rounded-2xl overflow-hidden mb-6">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-civic-700 uppercase tracking-wider">
                    Category: {categories.find(c => c.code === selectedCategory)?.name}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">{title}</h3>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-civic-100 text-civic-800">
                  Target SLA: 24h–48h
                </span>
              </div>

              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-600">Location:</p>
                  <p className="text-xs text-slate-900 mt-0.5">{address}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{ward} &bull; GPS: {selectedCoord[0].toFixed(4)}, {selectedCoord[1].toFixed(4)}</p>

                  <p className="text-xs font-bold text-slate-600 mt-4">Description:</p>
                  <p className="text-xs text-slate-800 mt-0.5 leading-relaxed">{description}</p>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-600 mb-1">Evidence Photo:</p>
                  <img
                    src={photoPreview}
                    alt="Review Photo"
                    className="w-full h-36 object-cover rounded-xl border border-slate-200 shadow-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Edit</span>
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-civic-700 to-teal-700 hover:from-civic-800 hover:to-teal-800 text-white font-bold text-sm px-8 py-3 rounded-xl shadow-lg transition-all flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Transmitting to Municipal Triage...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                    <span>Confirm & File Grievance</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Proximity Duplicate Detection Modal (50m) */}
      <DuplicateAlertModal
        isOpen={duplicateModalOpen}
        onClose={() => setDuplicateModalOpen(false)}
        duplicates={nearbyDuplicates}
        onUpvote={handleUpvoteDuplicate}
        onProceedAnyway={handleProceedAnyway}
      />
    </div>
  );
};
