import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { busRoute } from '../services/mockDataService';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// ── STATUS COLOR MAPPING ───────────────────────────────────────────────────
const STATUS_COLORS = {
    online:  { bg: '#22C55E', glow: 'rgba(34,197,94,0.5)',  label: 'ONLINE'  },
    warning: { bg: '#F59E0B', glow: 'rgba(245,158,11,0.5)', label: 'WARNING' },
    offline: { bg: '#EF4444', glow: 'rgba(239,68,68,0.5)',  label: 'OFFLINE' },
};

// ── BUS MARKER ICON ────────────────────────────────────────────────────────
const createBusIcon = (status = 'online', isSelected = false) => {
    const { bg, glow } = STATUS_COLORS[status] || STATUS_COLORS.online;
    const size = isSelected ? 48 : 40;
    const ring = isSelected
        ? `box-shadow: 0 0 0 3px white, 0 0 0 5px ${bg}, 0 6px 20px ${glow};`
        : `box-shadow: 0 4px 12px ${glow};`;
    const pulse = status !== 'offline' ? 'animation: busMarkerPulse 2s infinite;' : '';

    return L.divIcon({
        html: `
      <div style="
        background: ${bg};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid white;
        ${ring}
        ${pulse}
        transition: all 0.3s ease;
        cursor: pointer;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="${isSelected ? 22 : 18}" height="${isSelected ? 22 : 18}"
             viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 6v6"/>
          <path d="M15 6v6"/>
          <path d="M2 12h19.6"/>
          <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/>
          <circle cx="7" cy="18" r="2"/>
          <circle cx="17" cy="18" r="2"/>
        </svg>
      </div>
      <style>
        @keyframes busMarkerPulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.08); }
        }
      </style>
    `,
        className: 'custom-bus-icon',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -(size / 2 + 4)],
    });
};

// ── WAYPOINT ICON (start / end) ────────────────────────────────────────────
const waypointIcon = (color = '#6366f1', label = '') =>
    L.divIcon({
        html: `
      <div style="
        background: ${color};
        width: 12px; height: 12px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.4);
      "></div>
    `,
        className: '',
        iconSize: [12, 12],
        iconAnchor: [6, 6],
        popupAnchor: [0, -10],
    });

// ── MAP UPDATER ────────────────────────────────────────────────────────────
function MapUpdater({ buses, selectedBusId }) {
    const map = useMap();

    useEffect(() => {
        if (!buses || buses.length === 0) return;
        const target = selectedBusId
            ? buses.find(b => b.busId === selectedBusId)
            : null;

        if (target) {
            map.flyTo(
                [target.gpsLocation.lat, target.gpsLocation.lng],
                map.getZoom() < 10 ? 10 : map.getZoom(),
                { duration: 1.2 }
            );
        }
    }, [selectedBusId, buses, map]);

    return null;
}

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────
/**
 * BusMap
 *
 * Multi-bus props (preferred):
 *   buses         – array of bus objects  { busId, status, gpsLocation, passengers, capacity, … }
 *   onBusSelect   – (bus) => void  called when a marker is clicked
 *   selectedBusId – string | null  highlights the selected bus
 *
 * Single-bus legacy props (still accepted for backwards compat):
 *   currentPosition – [lat, lng]
 *   busData         – { busId, speed, heading, lastUpdated, … }
 */
const BusMap = ({ buses, onBusSelect, selectedBusId, currentPosition, busData }) => {
    // Determine map centre
    const firstBus = buses && buses.length > 0 ? buses[0] : null;
    const center = firstBus
        ? [firstBus.gpsLocation.lat, firstBus.gpsLocation.lng]
        : currentPosition || busRoute[0];

    // ── time-ago helper ────────────────────────────────────────────────────
    const getTimeAgo = (timestamp) => {
        if (!timestamp) return 'Never';
        const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        return `${Math.floor(seconds / 3600)}h ago`;
    };

    // ── legacy single-bus support ──────────────────────────────────────────
    const isOnline = busData?.lastUpdated
        ? (new Date() - new Date(busData.lastUpdated)) / 1000 < 15
        : false;

    return (
        <div className="glass-card rounded-xl overflow-hidden h-full relative">

            {/* Fleet count badge */}
            {buses && buses.length > 0 && (
                <div className="absolute top-4 right-4 z-[1000] bg-[#0F172A]/90 backdrop-blur-sm rounded-lg shadow-lg px-4 py-2 border border-[#1F2937]">
                    <div className="flex items-center gap-3">
                        {Object.entries(STATUS_COLORS).map(([key, val]) => {
                            const count = buses.filter(b => b.status === key).length;
                            if (count === 0) return null;
                            return (
                                <div key={key} className="flex items-center gap-1.5">
                                    <span
                                        style={{ background: val.bg }}
                                        className="w-2.5 h-2.5 rounded-full inline-block"
                                    />
                                    <span className="text-xs font-bold text-white">{count}</span>
                                </div>
                            );
                        })}
                        <span className="text-[10px] text-gray-400 font-semibold ml-1 uppercase tracking-wider">
                            Fleet
                        </span>
                    </div>
                </div>
            )}

            {/* Legacy single-bus status badge */}
            {!buses && (
                <div className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg shadow-lg px-4 py-2">
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                        <span className="text-sm font-semibold text-slate-900">
                            {isOnline ? 'ONLINE' : 'OFFLINE'}
                        </span>
                    </div>
                </div>
            )}

            <MapContainer
                center={center}
                zoom={7}
                style={{ height: '100%', width: '100%' }}
                zoomControl={true}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />

                {/* Route Polyline */}
                <Polyline
                    positions={busRoute}
                    pathOptions={{
                        color: '#3b82f6',
                        weight: 3,
                        opacity: 0.4,
                        dashArray: '10, 10',
                    }}
                />

                {/* ── MULTI-BUS MARKERS ─────────────────────────────────── */}
                {buses && buses.map((bus) => {
                    const pos = [bus.gpsLocation.lat, bus.gpsLocation.lng];
                    const isSelected = bus.busId === selectedBusId;
                    const statusColor = STATUS_COLORS[bus.status] || STATUS_COLORS.online;
                    const occupancy = Math.round((bus.passengers / bus.capacity) * 100);

                    return (
                        <Marker
                            key={bus.busId}
                            position={pos}
                            icon={createBusIcon(bus.status, isSelected)}
                            eventHandlers={{
                                click: () => onBusSelect && onBusSelect(bus),
                            }}
                        >
                            {/* Compact popup – bus number + pax count */}
                            <Popup
                                className="bus-popup"
                                closeButton={false}
                                autoPan={false}
                            >
                                <div style={{
                                    fontFamily: 'Inter, system-ui, sans-serif',
                                    minWidth: 160,
                                    padding: '8px 4px 4px',
                                }}>
                                    {/* Header */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                        <span style={{
                                            background: statusColor.bg,
                                            color: 'white',
                                            fontWeight: 700,
                                            fontSize: 13,
                                            padding: '2px 8px',
                                            borderRadius: 6,
                                            letterSpacing: '0.05em',
                                        }}>
                                            {bus.busId}
                                        </span>
                                        <span style={{
                                            fontSize: 10,
                                            fontWeight: 700,
                                            color: statusColor.bg,
                                            letterSpacing: '0.08em',
                                            textTransform: 'uppercase',
                                        }}>
                                            {statusColor.label}
                                        </span>
                                    </div>

                                    {/* Route */}
                                    <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6 }}>
                                        {bus.route} · {bus.routeCode}
                                    </div>

                                    {/* Passenger count */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
                                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                            <circle cx="9" cy="7" r="4"/>
                                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                        </svg>
                                        <span style={{ fontSize: 13, fontWeight: 700 }}>
                                            {bus.passengers}
                                        </span>
                                        <span style={{ fontSize: 11, color: '#9ca3af' }}>
                                            / {bus.capacity} pax ({occupancy}%)
                                        </span>
                                    </div>

                                    {/* Capacity bar */}
                                    <div style={{
                                        background: '#f3f4f6',
                                        borderRadius: 4,
                                        height: 5,
                                        overflow: 'hidden',
                                        marginBottom: 8,
                                    }}>
                                        <div style={{
                                            width: `${occupancy}%`,
                                            height: '100%',
                                            background: occupancy > 90 ? '#EF4444' : occupancy > 70 ? '#F59E0B' : '#22C55E',
                                            borderRadius: 4,
                                            transition: 'width 0.4s',
                                        }} />
                                    </div>

                                    {/* Speed */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6b7280' }}>
                                        <span>Speed: <strong>{bus.speed} km/h</strong></span>
                                        <span>{getTimeAgo(bus.lastUpdated)}</span>
                                    </div>

                                    {/* Click hint */}
                                    <div style={{
                                        marginTop: 8,
                                        paddingTop: 6,
                                        borderTop: '1px solid #f3f4f6',
                                        fontSize: 10,
                                        color: '#6366f1',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                    }}
                                        onClick={() => onBusSelect && onBusSelect(bus)}
                                    >
                                        Click marker for full details →
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}

                {/* ── LEGACY SINGLE-BUS MARKER (backwards compat) ─────── */}
                {!buses && currentPosition && (
                    <Marker position={currentPosition} icon={createBusIcon(isOnline ? 'online' : 'offline', true)}>
                        <Popup>
                            <div className="p-2">
                                <h3 className="font-bold text-lg mb-2">{busData?.busId || 'Bus Location'}</h3>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between gap-4">
                                        <span className="text-slate-600">Status:</span>
                                        <span className={`font-semibold ${isOnline ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {isOnline ? 'ONLINE' : 'OFFLINE'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <span className="text-slate-600">Speed:</span>
                                        <span className="font-semibold">
                                            {busData?.speed ? `${(busData.speed * 3.6).toFixed(1)} km/h` : '0 km/h'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <span className="text-slate-600">Updated:</span>
                                        <span className="font-semibold">{getTimeAgo(busData?.lastUpdated)}</span>
                                    </div>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Route Start / End Waypoints */}
                <Marker position={busRoute[0]} icon={waypointIcon('#22C55E')}>
                    <Popup><div className="font-semibold text-sm">Start: Kochi</div></Popup>
                </Marker>
                <Marker position={busRoute[busRoute.length - 1]} icon={waypointIcon('#EF4444')}>
                    <Popup><div className="font-semibold text-sm">End: Bengaluru</div></Popup>
                </Marker>

                <MapUpdater buses={buses} selectedBusId={selectedBusId} />
            </MapContainer>
        </div>
    );
};

export default BusMap;
