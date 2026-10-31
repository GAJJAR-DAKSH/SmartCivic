import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Issue } from '../types';

interface Props {
  center?: [number, number];
  zoom?: number;
  selectable?: boolean;
  selectedCoord?: [number, number] | null;
  onSelectCoord?: (coord: [number, number], address?: string) => void;
  issues?: Issue[];
  onIssueClick?: (issue: Issue) => void;
  showHeatmap?: boolean;
  height?: string;
}

export const LeafletMap: React.FC<Props> = ({
  center = [23.0305, 72.5645], // Default Ahmedabad Civic Zone
  zoom = 13,
  selectable = false,
  selectedCoord = null,
  onSelectCoord,
  issues = [],
  onIssueClick,
  showHeatmap = false,
  height = '420px'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerGroupRef = useRef<L.LayerGroup | null>(null);
  const heatGroupRef = useRef<L.LayerGroup | null>(null);
  const selectedMarkerRef = useRef<L.Marker | null>(null);
  const [geocoding, setGeocoding] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center,
      zoom,
      zoomControl: true,
      scrollWheelZoom: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors | SmartCivic Municipal GIS',
      maxZoom: 19
    }).addTo(map);

    const markerGroup = L.layerGroup().addTo(map);
    const heatGroup = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    markerGroupRef.current = markerGroup;
    heatGroupRef.current = heatGroup;

    // Handle clicks in selectable mode
    if (selectable) {
      map.on('click', async (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        setGeocoding(true);
        let address = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        try {
          // Reverse geocoding via OpenStreetMap Nominatim with fallback
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          if (res.ok) {
            const data = await res.json();
            if (data.display_name) {
              address = data.display_name.split(',').slice(0, 3).join(',');
            }
          }
        } catch {
          // fallback to coordinate
        }
        setGeocoding(false);
        if (onSelectCoord) {
          onSelectCoord([lat, lng], address);
        }
      });
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update center when center prop changes
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.setView(center, zoom);
    }
  }, [center[0], center[1], zoom]);

  // Update Selected Marker in Geopicker Mode
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (selectedCoord) {
      if (selectedMarkerRef.current) {
        selectedMarkerRef.current.setLatLng(selectedCoord);
      } else {
        const pinIcon = L.divIcon({
          className: 'custom-selected-pin',
          html: `<div class="w-8 h-8 -translate-x-1/2 -translate-y-full bg-rose-600 rounded-full border-2 border-white shadow-xl flex items-center justify-center animate-bounce">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/></svg>
          </div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 32]
        });

        const m = L.marker(selectedCoord, { icon: pinIcon }).addTo(mapInstanceRef.current);
        selectedMarkerRef.current = m;
      }
      mapInstanceRef.current.panTo(selectedCoord);
    } else if (selectedMarkerRef.current) {
      selectedMarkerRef.current.remove();
      selectedMarkerRef.current = null;
    }
  }, [selectedCoord]);

  // Render Issues and Heatmap
  useEffect(() => {
    if (!mapInstanceRef.current || !markerGroupRef.current || !heatGroupRef.current) return;

    markerGroupRef.current.clearLayers();
    heatGroupRef.current.clearLayers();

    if (showHeatmap) {
      // Density circles for heatmap view
      issues.forEach(issue => {
        const radius = issue.priority === 'CRITICAL' ? 350 : issue.priority === 'HIGH' ? 250 : 180;
        const color = issue.priority === 'CRITICAL' ? '#ef4444' : issue.priority === 'HIGH' ? '#f59e0b' : '#3b82f6';
        
        const circle = L.circle([issue.latitude, issue.longitude], {
          color: color,
          fillColor: color,
          fillOpacity: 0.35,
          radius: radius,
          stroke: false
        });
        heatGroupRef.current?.addLayer(circle);
      });
    }

    // Render Markers
    issues.forEach(issue => {
      const isBreached = issue.is_breached;
      let badgeColor = 'bg-teal-600';
      if (isBreached) badgeColor = 'bg-rose-600';
      else if (issue.priority === 'CRITICAL') badgeColor = 'bg-red-500';
      else if (issue.priority === 'HIGH') badgeColor = 'bg-amber-500';
      else if (issue.status === 'DONE' || issue.status === 'VERIFIED') badgeColor = 'bg-emerald-600';

      const pinIcon = L.divIcon({
        className: 'custom-issue-pin',
        html: `
          <div class="relative group cursor-pointer -translate-x-1/2 -translate-y-full">
            <div class="w-8 h-8 rounded-full border-2 border-white shadow-lg ${badgeColor} flex items-center justify-center text-white transition-transform transform hover:scale-125">
              <span class="text-[10px] font-black tracking-tighter">${issue.id.slice(-3)}</span>
            </div>
            <div class="w-2 h-2 bg-slate-900 rotate-45 mx-auto -mt-1 shadow-sm"></div>
          </div>
        `,
        iconSize: [32, 36],
        iconAnchor: [16, 36]
      });

      const marker = L.marker([issue.latitude, issue.longitude], { icon: pinIcon });
      
      const popupHtml = `
        <div style="font-family: inherit; width: 230px;" class="p-1">
          <div style="font-size: 11px; font-weight: 700; color: #0f766e;">${issue.id} &bull; ${issue.priority}</div>
          <div style="font-size: 13px; font-weight: 600; color: #0f172a; margin-top: 2px;">${issue.title}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${issue.address}</div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; padding-top: 6px; border-top: 1px solid #e2e8f0;">
            <span style="font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 9999px; background: #e0f2fe; color: #0369a1;">${issue.status}</span>
            <span style="font-size: 10px; color: ${isBreached ? '#b91c1c' : '#475569'}; font-weight: 600;">${issue.countdown_label || ''}</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        if (onIssueClick) onIssueClick(issue);
      });

      markerGroupRef.current?.addLayer(marker);
    });
  }, [issues, showHeatmap]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm" style={{ height }}>
      {geocoding && (
        <div className="absolute top-3 left-12 z-20 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-civic-700 shadow-md flex items-center gap-2">
          <div className="w-3 h-3 rounded-full border-2 border-civic-600 border-t-transparent animate-spin" />
          Resolving street address...
        </div>
      )}
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};

