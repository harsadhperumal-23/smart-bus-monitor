import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Activity, CheckCircle, XCircle, Smartphone } from 'lucide-react';
import axios from 'axios';

const DriverTracker = () => {
    const [tracking, setTracking] = useState(false);
    const [error, setError] = useState(null);
    const [selectedBus, setSelectedBus] = useState('BUS-001');
    const [availableBuses] = useState(['BUS-001', 'BUS-002', 'BUS-003']);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [updateCount, setUpdateCount] = useState(0);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [watchId, setWatchId] = useState(null);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError('GPS not supported by your browser');
            return;
        }
        startTracking();
        return () => {
            if (watchId) {
                navigator.geolocation.clearWatch(watchId);
            }
        };
    }, [selectedBus]);

    const startTracking = () => {
        setError(null);
        setTracking(false);

        const id = navigator.geolocation.watchPosition(
            (position) => {
                const locationData = {
                    busId: selectedBus,
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    speed: position.coords.speed || 0,
                    heading: position.coords.heading || 0
                };
                setCurrentLocation(locationData);
                setTracking(true);
                setLastUpdate(new Date());

                axios.post('/api/bus/location', locationData, { withCredentials: true })
                    .then(() => { setUpdateCount(prev => prev + 1); })
                    .catch((err) => {
                        console.error('Failed to send location:', err);
                        setError('Failed to update location on server');
                    });
            },
            (err) => {
                console.error('Geolocation error:', err);
                setTracking(false);
                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        setError('GPS permission denied. Please enable location access.');
                        break;
                    case err.POSITION_UNAVAILABLE:
                        setError('Location information unavailable. Check your GPS settings.');
                        break;
                    case err.TIMEOUT:
                        setError('Location request timed out. Please try again.');
                        break;
                    default:
                        setError('An unknown error occurred while tracking location.');
                }
            },
            { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
        );
        setWatchId(id);
    };

    const handleBusChange = (e) => {
        if (watchId) { navigator.geolocation.clearWatch(watchId); }
        setSelectedBus(e.target.value);
        setUpdateCount(0);
    };

    const card = {
        background: '#202020',
        border: '1px solid #404040',
        borderRadius: 12,
        padding: '20px 24px',
    };

    const dataCell = {
        background: '#161616',
        border: '1px solid #333',
        borderRadius: 8,
        padding: '12px 14px',
    };

    return (
        <div style={{ minHeight: '100%', background: '#161616', padding: 24, overflowY: 'auto' }}>
            <div style={{ maxWidth: 640, margin: '0 auto' }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 72, height: 72,
                        background: 'rgba(59,130,246,0.12)',
                        border: '1px solid rgba(59,130,246,0.2)',
                        borderRadius: '50%',
                        marginBottom: 16,
                    }}>
                        <MapPin style={{ width: 32, height: 32, color: '#3b82f6' }} />
                    </div>
                    <h1 style={{ fontSize: 26, fontWeight: 800, color: '#ffffff', marginBottom: 6 }}>
                        Driver GPS Tracker
                    </h1>
                    <p style={{ color: '#808080', fontSize: 13 }}>
                        Keep this page open to transmit your location
                    </p>
                </div>

                {/* Bus Selector */}
                <div style={{ ...card, marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#666666', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                        Select Bus
                    </label>
                    <select
                        value={selectedBus}
                        onChange={handleBusChange}
                        style={{
                            width: '100%',
                            background: '#161616',
                            color: '#ffffff',
                            padding: '10px 14px',
                            borderRadius: 8,
                            border: '1px solid #404040',
                            fontSize: 14,
                            fontWeight: 600,
                            outline: 'none',
                            fontFamily: 'Inter, sans-serif',
                        }}
                    >
                        {availableBuses.map(bus => (
                            <option key={bus} value={bus} style={{ background: '#202020' }}>
                                {bus}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Status Card */}
                <div style={{ ...card, marginBottom: 16 }}>
                    {/* Tracking Status */}
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid #333',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            {tracking ? (
                                <>
                                    <CheckCircle style={{ width: 28, height: 28, color: '#10b981' }} />
                                    <div>
                                        <div style={{ fontSize: 17, fontWeight: 700, color: '#ffffff' }}>GPS Active</div>
                                        <div style={{ fontSize: 12, color: '#10b981', marginTop: 2 }}>Tracking {selectedBus}</div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <XCircle style={{ width: 28, height: 28, color: '#666666' }} />
                                    <div>
                                        <div style={{ fontSize: 17, fontWeight: 700, color: '#ffffff' }}>GPS Inactive</div>
                                        <div style={{ fontSize: 12, color: '#666666', marginTop: 2 }}>Waiting for location...</div>
                                    </div>
                                </>
                            )}
                        </div>
                        {tracking && (
                            <div style={{ animation: 'pulse 2s infinite' }}>
                                <Activity style={{ width: 24, height: 24, color: '#3b82f6' }} />
                            </div>
                        )}
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div style={{
                            marginBottom: 20, padding: '12px 14px',
                            background: 'rgba(239,68,68,0.08)',
                            border: '1px solid rgba(239,68,68,0.2)',
                            borderRadius: 8,
                            display: 'flex', alignItems: 'center', gap: 8,
                        }}>
                            <XCircle style={{ width: 16, height: 16, color: '#ef4444', flexShrink: 0 }} />
                            <p style={{ color: '#ef4444', fontSize: 13 }}>{error}</p>
                        </div>
                    )}

                    {/* Location Data */}
                    {currentLocation && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                <div style={dataCell}>
                                    <div style={{ fontSize: 10, color: '#666666', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Latitude</div>
                                    <div style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', fontFamily: 'JetBrains Mono, monospace' }}>
                                        {currentLocation.lat.toFixed(6)}°
                                    </div>
                                </div>
                                <div style={dataCell}>
                                    <div style={{ fontSize: 10, color: '#666666', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Longitude</div>
                                    <div style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', fontFamily: 'JetBrains Mono, monospace' }}>
                                        {currentLocation.lng.toFixed(6)}°
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                <div style={dataCell}>
                                    <div style={{ fontSize: 10, color: '#666666', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Speed</div>
                                    <div style={{ fontSize: 16, fontWeight: 700, color: '#ffffff' }}>
                                        {currentLocation.speed
                                            ? `${(currentLocation.speed * 3.6).toFixed(1)} km/h`
                                            : 'Stationary'}
                                    </div>
                                </div>
                                <div style={dataCell}>
                                    <div style={{ fontSize: 10, color: '#666666', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Heading</div>
                                    <div style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        {currentLocation.heading !== null ? (
                                            <>
                                                <Navigation
                                                    style={{ width: 14, height: 14, transform: `rotate(${currentLocation.heading}deg)`, color: '#3b82f6' }}
                                                />
                                                {currentLocation.heading.toFixed(0)}°
                                            </>
                                        ) : 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Stats Card */}
                <div style={{ ...card, marginBottom: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, textAlign: 'center' }}>
                        <div>
                            <div style={{ fontSize: 28, fontWeight: 800, color: '#3b82f6', marginBottom: 4, fontFamily: 'JetBrains Mono, monospace' }}>
                                {updateCount}
                            </div>
                            <div style={{ fontSize: 11, color: '#666666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Updates Sent</div>
                        </div>
                        <div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: '#10b981', marginBottom: 4, fontFamily: 'JetBrains Mono, monospace' }}>
                                {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : '--:--:--'}
                            </div>
                            <div style={{ fontSize: 11, color: '#666666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Last Update</div>
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div style={{
                    padding: '16px 20px',
                    background: 'rgba(59,130,246,0.06)',
                    border: '1px solid rgba(59,130,246,0.15)',
                    borderRadius: 12,
                }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <Smartphone style={{ width: 18, height: 18, color: '#3b82f6', marginTop: 2, flexShrink: 0 }} />
                        <div>
                            <p style={{ fontWeight: 700, color: '#ffffff', marginBottom: 8, fontSize: 13 }}>Important:</p>
                            <ul style={{ color: '#808080', fontSize: 13, lineHeight: 1.8, listStyle: 'none', padding: 0 }}>
                                <li>• Keep this page open and your phone unlocked</li>
                                <li>• Ensure location services are enabled</li>
                                <li>• Keep your phone charged or connected to power</li>
                                <li>• Your location is transmitted automatically</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DriverTracker;
