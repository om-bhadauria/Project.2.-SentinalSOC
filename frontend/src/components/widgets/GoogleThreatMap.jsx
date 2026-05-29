import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Globe2 } from 'lucide-react';

const GOOGLE_MAPS_ID = 'google-maps-script';

const threatNodes = [
  { label: 'New York', lat: 40.7128, lng: -74.006, severity: 'critical', events: 42 },
  { label: 'Singapore', lat: 1.3521, lng: 103.8198, severity: 'critical', events: 31 },
  { label: 'Frankfurt', lat: 50.1109, lng: 8.6821, severity: 'medium', events: 18 },
  { label: 'Sao Paulo', lat: -23.5558, lng: -46.6396, severity: 'high', events: 24 },
  { label: 'Tokyo', lat: 35.6762, lng: 139.6503, severity: 'low', events: 9 },
];

const attackRoutes = [
  ['New York', 'Singapore', '#ff4d4d'],
  ['Singapore', 'Sao Paulo', '#ffaa00'],
  ['Frankfurt', 'Tokyo', '#00ffcc'],
  ['Sao Paulo', 'New York', '#ff4d4d'],
];

const mapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#08111d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8b949e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#08111d' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#223047' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#0c1724' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#02070d' }] },
];

const getSeverityColor = (severity) => {
  if (severity === 'critical') return '#ff4d4d';
  if (severity === 'high') return '#ffaa00';
  if (severity === 'medium') return '#00ffcc';
  return '#60a5fa';
};

const loadGoogleMaps = (apiKey) => {
  if (window.google?.maps) return Promise.resolve(window.google.maps);

  const existingScript = document.getElementById(GOOGLE_MAPS_ID);
  if (existingScript) {
    return new Promise((resolve, reject) => {
      existingScript.addEventListener('load', () => resolve(window.google.maps), { once: true });
      existingScript.addEventListener('error', reject, { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = GOOGLE_MAPS_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google.maps);
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

const GoogleThreatMap = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const overlaysRef = useRef([]);
  const [mapStatus, setMapStatus] = useState('loading');
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const nodeByLabel = useMemo(() => {
    return threatNodes.reduce((acc, node) => ({ ...acc, [node.label]: node }), {});
  }, []);

  useEffect(() => {
    if (!apiKey) {
      setMapStatus('missing-key');
      return;
    }

    let cancelled = false;

    loadGoogleMaps(apiKey)
      .then((maps) => {
        if (cancelled || !mapRef.current) return;

        setMapStatus('ready');
        const map = new maps.Map(mapRef.current, {
          center: { lat: 18, lng: 20 },
          zoom: 2,
          minZoom: 2,
          maxZoom: 5,
          disableDefaultUI: true,
          gestureHandling: 'greedy',
          backgroundColor: '#05070a',
          styles: mapStyle,
        });

        mapInstanceRef.current = map;
        overlaysRef.current.forEach((overlay) => overlay.setMap?.(null));
        overlaysRef.current = [];

        threatNodes.forEach((node) => {
          const color = getSeverityColor(node.severity);
          const marker = new maps.Marker({
            position: { lat: node.lat, lng: node.lng },
            map,
            title: `${node.label}: ${node.events} events`,
            icon: {
              path: maps.SymbolPath.CIRCLE,
              fillColor: color,
              fillOpacity: 0.95,
              strokeColor: '#ffffff',
              strokeOpacity: 0.45,
              strokeWeight: 1,
              scale: node.severity === 'critical' ? 8 : 6,
            },
            label: {
              text: `${node.events}`,
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: '700',
            },
          });

          const infoWindow = new maps.InfoWindow({
            content: `<div style="font-family:Inter,Arial,sans-serif;min-width:150px"><strong>${node.label}</strong><br/><span>${node.severity.toUpperCase()} risk</span><br/><span>${node.events} correlated events</span></div>`,
          });

          marker.addListener('click', () => infoWindow.open({ anchor: marker, map }));
          overlaysRef.current.push(marker, infoWindow);
        });

        attackRoutes.forEach(([from, to, color]) => {
          const start = nodeByLabel[from];
          const end = nodeByLabel[to];
          const line = new maps.Polyline({
            path: [
              { lat: start.lat, lng: start.lng },
              { lat: end.lat, lng: end.lng },
            ],
            map,
            geodesic: true,
            strokeColor: color,
            strokeOpacity: 0.72,
            strokeWeight: 2,
            icons: [{
              icon: {
                path: maps.SymbolPath.FORWARD_CLOSED_ARROW,
                scale: 3,
                strokeColor: color,
              },
              offset: '72%',
            }],
          });
          overlaysRef.current.push(line);
        });
      })
      .catch(() => setMapStatus('error'));

    return () => {
      cancelled = true;
      overlaysRef.current.forEach((overlay) => overlay.setMap?.(null));
      overlaysRef.current = [];
    };
  }, [apiKey, nodeByLabel]);

  return (
    <div className="glass-panel group relative flex h-full min-h-[360px] flex-col overflow-hidden border-accent/20 bg-[#05070a] p-5">
      <div className="relative z-10 mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-accent">
            <Globe2 size={15} />
            Global telemetry
          </div>
          <h2 className="text-xl font-bold text-white">Threat Surface Map</h2>
        </div>
        <span className="rounded-md border border-accent/30 bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent">
          {apiKey ? 'Google Maps API' : 'Google Maps Embed'}
        </span>
      </div>

      <div className="relative z-10 min-h-[245px] flex-1 overflow-hidden rounded-lg border border-white/10 bg-black/40">
        {apiKey ? (
          <div ref={mapRef} className="h-full min-h-[245px] w-full" />
        ) : (
          <FallbackMap />
        )}

        {mapStatus === 'loading' && apiKey && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm text-textMuted">
            Loading Google Maps...
          </div>
        )}

        {mapStatus === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 p-4 text-center text-sm text-warning">
            Google Maps could not load. Check the API key and browser network access.
          </div>
        )}
      </div>

      <div className="relative z-10 mt-3 grid grid-cols-3 gap-2 text-xs">
        <MapMetric label="Ingress" value="18.4k" tone="text-danger" />
        <MapMetric label="Blocked" value="93%" tone="text-accent" />
        <MapMetric label="Regions" value="5" tone="text-blue-300" />
      </div>
    </div>
  );
};

const FallbackMap = () => (
  <div className="relative h-full min-h-[245px] overflow-hidden bg-[#05070a]">
    <iframe
      title="Google Maps world telemetry"
      src="https://maps.google.com/maps?q=world&t=k&z=2&output=embed"
      className="absolute inset-0 h-full w-full border-0 opacity-45 saturate-50"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    ></iframe>
    <div className="absolute inset-0 bg-[#05070a]/40 mix-blend-multiply"></div>
    <div className="absolute inset-0 threat-grid opacity-35"></div>

    <svg viewBox="0 0 900 420" className="pointer-events-none absolute inset-0 h-full w-full">
      <defs>
        <filter id="fallbackGlow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path d="M265 115 Q 450 30 710 128" stroke="rgba(255,77,77,0.78)" strokeWidth="2.2" fill="transparent" className="attack-beam" filter="url(#fallbackGlow)" />
      <path d="M710 128 Q 508 295 334 292" stroke="rgba(255,170,0,0.74)" strokeWidth="2" fill="transparent" strokeDasharray="6,8" className="attack-beam" />
      <path d="M472 120 Q 585 78 770 105" stroke="rgba(0,255,204,0.58)" strokeWidth="1.8" fill="transparent" strokeDasharray="4,9" className="attack-beam reverse-beam" />
    </svg>

    {[
      { label: 'New York', x: '29%', y: '36%', severity: 'critical', events: 42 },
      { label: 'Singapore', x: '75%', y: '58%', severity: 'critical', events: 31 },
      { label: 'Frankfurt', x: '52%', y: '32%', severity: 'medium', events: 18 },
      { label: 'Sao Paulo', x: '37%', y: '70%', severity: 'high', events: 24 },
      { label: 'Tokyo', x: '82%', y: '35%', severity: 'low', events: 9 },
    ].map((node) => (
      <div
        key={node.label}
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
        style={{ left: node.x, top: node.y }}
      >
        <div
          className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20"
          style={{ backgroundColor: getSeverityColor(node.severity) }}
        ></div>
        <div
          className="relative flex h-6 w-6 items-center justify-center rounded-full border border-white/40 text-[9px] font-bold text-white shadow-lg"
          style={{ backgroundColor: getSeverityColor(node.severity) }}
        >
          {node.events}
        </div>
        <div className="absolute left-7 top-[-10px] whitespace-nowrap rounded bg-black/65 px-2 py-1 text-[10px] font-mono text-gray-100">
          {node.label}
        </div>
      </div>
    ))}

    <div className="absolute bottom-3 left-3 rounded-md border border-accent/30 bg-black/70 px-3 py-2 text-xs text-accent">
      Live API overlay enabled when `VITE_GOOGLE_MAPS_API_KEY` is set.
    </div>
  </div>
);

const MapMetric = ({ label, value, tone }) => (
  <div className="rounded-lg border border-white/10 bg-black/35 p-3">
    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-textMuted">{label}</p>
    <p className={`mt-1 text-lg font-bold ${tone}`}>{value}</p>
  </div>
);

export default GoogleThreatMap;
