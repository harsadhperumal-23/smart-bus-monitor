import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    Users, Armchair, AlertTriangle, UserCheck, MapPin, Navigation, 
    Clock, CheckCircle, Bus, Map as MapIcon, Plus, Info, Zap, Activity, Bell
} from 'lucide-react';
import BusMap from '../components/BusMap';
import BusSidePanel from '../components/BusSidePanel';
import SeatGrid from '../components/SeatGrid';
import LiveAlertFeed from '../components/LiveAlertFeed';
import SmartAlerts from '../components/SmartAlerts';
import DriverActivityCard from '../components/DriverActivityCard';
import useAlertNotifications from '../hooks/useAlertNotifications';
import { AnimatePresence, motion } from 'framer-motion';
import { MULTI_BUS_DATA, getFleetSnapshot } from '../services/mockDataService';

const API_BASE_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api`;

const Operations = React.memo(() => {
    const [selectedBus, setSelectedBus] = useState('BUS-001');
    const [availableBuses] = useState(['BUS-001', 'BUS-002', 'BUS-003']);
    const [busData, setBusData] = useState(null);
    const [seats, setSeats] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDemoMode, setIsDemoMode] = useState(false);
    
    // New Features States
    const [isLiveTracking, setIsLiveTracking] = useState(true);
    const [isPublicLinkEnabled, setIsPublicLinkEnabled] = useState(false);
    const [showSeatMap, setShowSeatMap] = useState(false);

    // Responsive Mobile layout states
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [activeMobileTab, setActiveMobileTab] = useState('map');

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // ── Multi-bus fleet state ────────────────────────────────────────────────
    const [allBuses, setAllBuses] = useState(MULTI_BUS_DATA);
    const [selectedMapBus, setSelectedMapBus] = useState(null); // bus clicked on map
    
    const [lastRefresh, setLastRefresh] = useState(new Date());

    const [sensorData, setSensorData] = useState({
        distance: 0,
        status: "EMPTY"
    });

    useAlertNotifications([]);

    const simulateSeats = useCallback((currentSeats) => {
        if (!currentSeats || currentSeats.length === 0) {
            return Array.from({ length: 40 }, (_, i) => ({
                number: i + 1,
                state: Math.random() < 0.1 ? 'LUGGAGE' : Math.random() < 0.5 ? 'OCCUPIED' : 'EMPTY',
                lastUpdated: new Date().toISOString()
            }));
        }
        return currentSeats.map(seat => {
            if (Math.random() > 0.85) { 
                const rand = Math.random();
                let state = "EMPTY";
                if (rand < 0.1) state = "LUGGAGE";
                else if (rand < 0.5) state = "OCCUPIED";
                return { ...seat, state, lastUpdated: new Date().toISOString() };
            }
            return seat;
        });
    }, []);

    const fetchBusData = useCallback(async (busId) => {
        if (isDemoMode) {
            setBusData({
                busId, 
                driverStatus: { name: 'Demo Driver', present: true, location: 'Virtual' },
                attenderStatus: { name: 'Demo Attender', present: true, location: 'Virtual' },
                gpsLocation: { lat: 13.0827, lng: 80.2707 },
                alerts: [{ id: 1, type: 'luggage', message: 'Luggage detected on Seat 12', severity: 'warning', timestamp: new Date().toLocaleTimeString() }]
            });
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/bus/${busId}`);
            if (response.ok) {
                const result = await response.json();
                if (result.success) setBusData(result.data);
            }
        } catch (error) {
            console.error('Error fetching bus data:', error);
        }
    }, [isDemoMode]);

    const fetchSeatData = useCallback(async (busId) => {
        if (isDemoMode) {
            setSeats(prev => simulateSeats(prev));
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/bus/${busId}/seat-map`);
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data.seats && result.data.seats.length > 0) {
                    const transformedSeats = result.data.seats.map(seat => {
                        let normalizedState = "EMPTY";
                        if (seat.state === 'HUMAN') normalizedState = "OCCUPIED";
                        if (seat.state === 'LUGGAGE') normalizedState = "LUGGAGE";
                        return { number: seat.seatNumber, state: normalizedState, lastUpdated: new Date().toISOString() };
                    });
                    const fullSeats = Array.from({ length: 40 }, (_, i) => {
                        return transformedSeats.find(s => s.number === i + 1) || { number: i + 1, state: 'EMPTY', lastUpdated: new Date().toISOString() };
                    });
                    setSeats(fullSeats);
                    return;
                }
            }
            setSeats(prev => simulateSeats(prev));
        } catch (error) {
            setSeats(prev => simulateSeats(prev));
        }
    }, [isDemoMode, simulateSeats]);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            await fetchBusData(selectedBus);
            await fetchSeatData(selectedBus);
            setIsLoading(false);
        };
        loadData();
        const interval = setInterval(() => {
            if (isLiveTracking) {
                fetchBusData(selectedBus);
                fetchSeatData(selectedBus);
            }
        }, 3000);
        return () => clearInterval(interval);
    }, [selectedBus, isDemoMode, isLiveTracking]);

    // ── Fleet live refresh (demo) ───────────────────────────────────────────
    useEffect(() => {
        const refreshFleet = () => {
            setAllBuses(getFleetSnapshot());
            // If the side panel is open, sync it with the latest data
            setSelectedMapBus(prev =>
                prev ? getFleetSnapshot().find(b => b.busId === prev.busId) || prev : null
            );
        };
        const id = setInterval(refreshFleet, 3000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("http://127.0.0.1:5000/sensor-data");
                const data = await res.json();
                setSensorData(data);
            } catch (err) {
                console.log(err);
            }
        };
        fetchData();
        const interval = setInterval(fetchData, 1000);
        return () => clearInterval(interval);
    }, []);

    const metrics = useMemo(() => {
        const occupied = seats.filter(s => s.state === 'OCCUPIED').length;
        const total = 40;
        const util = Math.round((occupied / total) * 100) || 0;
        return {
            totalPassengers: occupied,
            utilization: util,
            luggageAlerts: seats.filter(s => s.state === 'LUGGAGE').length,
        };
    }, [seats]);

    // Mock Stops for UI
    const stops = [
        { name: 'Central Station', time: '10:00 AM', passed: true },
        { name: 'Tech Park', time: '10:45 AM', passed: true },
        { name: 'North Terminal', time: '11:30 AM', passed: false, current: true },
        { name: 'Airport', time: '12:15 PM', passed: false },
    ];

    if (isMobile) {
        return (
            <div className="flex flex-col h-full w-full bg-[#161616] text-white overflow-hidden pb-16">
                {/* Mobile Sub-Header: Active Bus Selector & Mode Toggle */}
                <div className="flex-shrink-0 bg-[#202020] border-b border-[#404040] p-4 flex items-center justify-between gap-3 z-10">
                    <div className="flex-1 min-w-0">
                        <select
                            value={selectedBus}
                            onChange={(e) => setSelectedBus(e.target.value)}
                            className="w-full bg-[#161616] border border-[#404040] rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-[#3b82f6]"
                        >
                            {availableBuses.map(bus => (
                                <option key={bus} value={bus}>{bus}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={() => setIsDemoMode(!isDemoMode)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all duration-200 ${isDemoMode ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400' : 'bg-[#161616] border-[#404040] text-gray-300'}`}
                    >
                        <Zap className={`w-3.5 h-3.5 ${isDemoMode ? 'animate-pulse' : ''}`} />
                        {isDemoMode ? 'Sim' : 'Live'}
                    </button>

                    <span className={`flex items-center gap-1 px-2.5 py-1 rounded text-[9px] font-bold tracking-wider ${isLiveTracking ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-[#EF4444]/10 text-[#EF4444]'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isLiveTracking ? 'bg-[#22C55E] animate-pulse' : 'bg-[#EF4444]'}`}></span>
                        {isLiveTracking ? 'LIVE' : 'PAUSED'}
                    </span>
                </div>

                {/* Active Tab Content Area - Scrollable */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none pb-20">
                    {activeMobileTab === 'map' && (
                        <div className="relative bg-[#0A0A0A] rounded-2xl overflow-hidden border border-[#404040] shadow-xl" style={{ height: 'calc(100vh - 250px)', minHeight: '350px' }}>
                            <BusMap
                                buses={allBuses}
                                onBusSelect={setSelectedMapBus}
                                selectedBusId={selectedMapBus?.busId || null}
                                currentPosition={busData?.gpsLocation ? [busData.gpsLocation.lat, busData.gpsLocation.lng] : null}
                                busData={busData}
                            />
                            {/* Floating Map Info Overlay */}
                            <div className="absolute bottom-3 left-3 right-3 z-[1000] bg-[#202020]/90 backdrop-blur-md border border-[#404040] p-3 rounded-xl shadow-xl flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Active Vehicle</p>
                                    <p className="text-sm font-black text-white">{selectedBus}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Occupancy</p>
                                    <p className="text-xs font-bold text-indigo-400">{metrics.totalPassengers} / 40 ({metrics.utilization}%)</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeMobileTab === 'seats' && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#202020] border border-[#404040] rounded-2xl overflow-hidden p-2 shadow-xl"
                        >
                            <SeatGrid seats={seats} />
                        </motion.div>
                    )}

                    {activeMobileTab === 'alerts' && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4 pb-4"
                        >
                            {/* Live Sensor Card */}
                            <div className="bg-[#202020] text-white p-5 rounded-2xl border border-[#404040] relative overflow-hidden shadow-xl">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-indigo-400" />
                                        Door Sensor (IoT)
                                    </h3>
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">VL53L0X ToF</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div className="bg-[#161616] p-3 rounded-xl border border-[#303030]">
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Distance</p>
                                        <p className="text-lg font-mono font-bold text-white mt-1">{sensorData.distance} cm</p>
                                    </div>
                                    <div className="bg-[#161616] p-3 rounded-xl border border-[#303030]">
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Detection Status</p>
                                        <p className={`text-base font-bold mt-1 ${sensorData.status === 'OCCUPIED' ? 'text-[#22C55E]' : 'text-gray-400'}`}>
                                            {sensorData.status}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Core Telemetry Cards */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-[#202020] border border-[#404040] rounded-2xl p-4 shadow-xl">
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">ETA Next Stop</p>
                                    <p className="text-xl font-mono font-bold text-indigo-400">14:00</p>
                                    <p className="text-[10px] text-gray-400 mt-1">Mins remaining</p>
                                </div>
                                <div className="bg-[#202020] border border-[#404040] rounded-2xl p-4 shadow-xl">
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Schedule</p>
                                    <p className="text-lg font-bold text-[#22C55E]">On Time</p>
                                    <p className="text-[10px] text-gray-400 mt-1">+2m buffer</p>
                                </div>
                            </div>

                            {/* Smart Alerts Feed */}
                            <div className="bg-[#202020] border border-[#404040] rounded-2xl p-4 space-y-4 shadow-xl">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                                    AI Smart Alerts
                                </h3>
                                <SmartAlerts maxHeight="350px" />
                            </div>
                        </motion.div>
                    )}

                    {activeMobileTab === 'route' && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4 pb-4"
                        >
                            {/* Route details */}
                            <div className="bg-[#202020] border border-[#404040] rounded-2xl p-4 space-y-4 shadow-xl">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Navigation className="w-4 h-4 text-indigo-400" />
                                    <h3 className="text-xs font-bold uppercase tracking-widest">Current Route Details</h3>
                                </div>
                                <div className="bg-[#161616] border border-[#303030] rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-bold text-sm">Downtown Express</span>
                                        <span className="text-xs px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-lg font-bold">R-42</span>
                                    </div>
                                    <div className="relative pl-4 mt-4 space-y-4">
                                        <div className="absolute left-1.5 top-2 bottom-2 w-px bg-[#1F2937]"></div>
                                        {stops.map((stop, i) => (
                                            <div key={i} className="relative text-xs">
                                                <div className={`absolute -left-[21px] top-1 w-2 h-2 rounded-full border-2 ${stop.passed ? 'bg-indigo-500 border-indigo-500' : stop.current ? 'bg-[#0A0A0A] border-indigo-500 animate-pulse' : 'bg-[#0A0A0A] border-[#1F2937]'}`}></div>
                                                <div className="flex justify-between items-start">
                                                    <p className={`font-medium ${stop.passed ? 'text-gray-400' : stop.current ? 'text-white font-bold' : 'text-gray-500'}`}>{stop.name}</p>
                                                    <p className={`font-mono text-[9px] ${stop.passed ? 'text-gray-500' : 'text-indigo-400'}`}>{stop.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Driver activity */}
                            <DriverActivityCard />

                            {/* Settings / Controls */}
                            <div className="bg-[#202020] border border-[#404040] rounded-2xl p-4 space-y-4 shadow-xl">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Operations Control</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold">Live Polling</p>
                                            <p className="text-[10px] text-gray-500">Update GPS every 3s</p>
                                        </div>
                                        <button 
                                            onClick={() => setIsLiveTracking(!isLiveTracking)}
                                            className={`w-12 h-6 rounded-full transition-colors relative ${isLiveTracking ? 'bg-[#3b82f6]' : 'bg-[#333333]'}`}
                                        >
                                            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isLiveTracking ? 'left-7' : 'left-1'}`}></span>
                                        </button>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold">Public Tracking</p>
                                            <p className="text-[10px] text-gray-500">Share location link</p>
                                        </div>
                                        <button 
                                            onClick={() => setIsPublicLinkEnabled(!isPublicLinkEnabled)}
                                            className={`w-12 h-6 rounded-full transition-colors relative ${isPublicLinkEnabled ? 'bg-[#3b82f6]' : 'bg-[#333333]'}`}
                                        >
                                            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isPublicLinkEnabled ? 'left-7' : 'left-1'}`}></span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Mobile Bottom Tab Bar */}
                <div className="flex-shrink-0 bg-[#202020] border-t border-[#404040] fixed bottom-0 left-0 right-0 h-16 flex items-center justify-around z-[9999] shadow-2xl px-2">
                    {[
                        { id: 'map', icon: MapIcon, label: 'GPS Map' },
                        { id: 'seats', icon: Armchair, label: 'Seats' },
                        { id: 'alerts', icon: Bell, label: 'Alerts' },
                        { id: 'route', icon: Navigation, label: 'Trip/Route' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveMobileTab(tab.id)}
                            className={`flex flex-col items-center justify-center flex-1 h-full py-2 transition-all ${activeMobileTab === tab.id ? 'text-[#3b82f6]' : 'text-gray-400 hover:text-white'}`}
                        >
                            <tab.icon className={`w-5 h-5 mb-1 ${activeMobileTab === tab.id ? 'scale-110' : ''}`} />
                            <span className="text-[9px] font-bold uppercase tracking-wider">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Slides in panel details if clicked on map */}
                <BusSidePanel
                    bus={selectedMapBus}
                    onClose={() => setSelectedMapBus(null)}
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row h-full w-full bg-[#161616] text-white overflow-auto md:overflow-hidden">
            
            {/* ── LEFT PANEL: TRIP INFO ──────────────────────────────── */}
            <div className="w-full md:w-80 flex-shrink-0 border-b md:border-b-0 md:border-r border-[#404040] bg-[#202020] flex flex-col z-10 hidden md:flex">
                <div className="p-5 border-b border-[#404040]">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold tracking-widest text-gray-400 uppercase">Trip Monitor</h2>
                        <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${isLiveTracking ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-[#EF4444]/10 text-[#EF4444]'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isLiveTracking ? 'bg-[#22C55E] animate-pulse' : 'bg-[#EF4444]'}`}></span>
                            {isLiveTracking ? 'LIVE' : 'PAUSED'}
                        </span>
                    </div>

                    <select
                        value={selectedBus}
                        onChange={(e) => setSelectedBus(e.target.value)}
                        className="w-full bg-[#161616] border border-[#404040] rounded-xl px-4 py-3 text-lg font-bold text-white focus:outline-none focus:border-[#3b82f6] transition-colors"
                    >
                        {availableBuses.map(bus => (
                            <option key={bus} value={bus}>{bus}</option>
                        ))}
                    </select>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-thumb-[#404040]">
                    {/* Route Details */}
                    <div>
                        <div className="flex items-center gap-2 mb-3 text-gray-400">
                            <Navigation className="w-4 h-4 text-indigo-400" />
                            <h3 className="text-xs font-bold uppercase tracking-widest">Current Route</h3>
                        </div>
                        <div className="bg-[#161616] border border-[#404040] rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-bold">Downtown Express</span>
                                <span className="text-xs px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg font-bold">R-42</span>
                            </div>
                            <div className="relative pl-4 mt-4 space-y-4">
                                <div className="absolute left-1.5 top-2 bottom-2 w-px bg-[#1F2937]"></div>
                                {stops.map((stop, i) => (
                                    <div key={i} className="relative">
                                        <div className={`absolute -left-[21px] top-1.5 w-2 h-2 rounded-full border-2 ${stop.passed ? 'bg-indigo-500 border-indigo-500' : stop.current ? 'bg-[#0A0A0A] border-indigo-500 animate-pulse' : 'bg-[#0A0A0A] border-[#1F2937]'}`}></div>
                                        <div className="flex justify-between items-start">
                                            <p className={`text-sm font-medium ${stop.passed ? 'text-gray-400' : stop.current ? 'text-white font-bold' : 'text-gray-500'}`}>{stop.name}</p>
                                            <p className={`text-[10px] font-mono ${stop.passed ? 'text-gray-500' : 'text-indigo-400'}`}>{stop.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Driver Activity */}
                    <DriverActivityCard />

                    {/* Quick Actions */}
                    <button 
                        onClick={() => setShowSeatMap(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold transition-colors"
                    >
                        <Armchair className="w-5 h-5" />
                        View Seat Map
                    </button>

                    <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#202020] hover:bg-[#2a2a2a] border border-[#404040] text-white rounded-xl font-medium transition-colors">
                        <Plus className="w-4 h-4" />
                        Add Trip Note
                    </button>
                </div>
            </div>

            {/* ── CENTER PANEL: FULL MAP ─────────────────────────────── */}
            <div className="flex-1 relative bg-[#0A0A0A] flex flex-col" style={{ minHeight: '55vw' }}>
                <div className="absolute inset-0 z-0">
                    <BusMap
                        buses={allBuses}
                        onBusSelect={setSelectedMapBus}
                        selectedBusId={selectedMapBus?.busId || null}
                        /* Legacy single-bus props kept as fallback */
                        currentPosition={busData?.gpsLocation ? [busData.gpsLocation.lat, busData.gpsLocation.lng] : null}
                        busData={busData}
                    />
                </div>

                {/* Optional overlay gradient at the top of the map to blend with header */}
                <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#161616]/80 to-transparent pointer-events-none z-10"></div>

                {/* Floating Demo Mode button on map */}
                <div className="absolute top-6 left-6 z-20">
                    <button
                        onClick={() => setIsDemoMode(!isDemoMode)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-xl backdrop-blur-md border transition-all duration-200 ${isDemoMode ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400' : 'bg-[#202020]/80 border-[#404040] text-gray-300 hover:bg-[#2a2a2a]/80'}`}
                    >
                        <Zap className={`w-4 h-4 ${isDemoMode ? 'animate-pulse' : ''}`} />
                        {isDemoMode ? 'Demo Sim Active' : 'Live Fleet Mode'}
                    </button>
                </div>

                {/* ── BUS SIDE PANEL (slides in over the map from right) ── */}
                <BusSidePanel
                    bus={selectedMapBus}
                    onClose={() => setSelectedMapBus(null)}
                />
            </div>

            {/* ── RIGHT PANEL: SUMMARY & METRICS ─────────────────────── */}
            <div className="w-full md:w-80 xl:flex flex-shrink-0 border-t md:border-t-0 md:border-l border-[#404040] bg-[#202020] flex-col z-10 hidden xl:flex">
                <div className="p-5 border-b border-[#404040]">
                    <h2 className="text-sm font-bold tracking-widest text-gray-400 uppercase mb-4">Live Telemetry</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[#161616] border border-[#404040] rounded-xl p-3">
                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">ETA Next</p>
                            <p className="text-xl font-mono font-bold text-indigo-400">14:00</p>
                            <p className="text-[10px] text-gray-400 mt-1">Mins remaining</p>
                        </div>
                        <div className="bg-[#161616] border border-[#404040] rounded-xl p-3">
                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Status</p>
                            <p className="text-lg font-bold text-[#22C55E]">On Time</p>
                            <p className="text-[10px] text-gray-400 mt-1">+2 mins buffer</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-thumb-[#404040]">
                    
                    {/* Core Metrics */}
                    <div className="space-y-3">
                        <div className="bg-[#161616] border border-[#404040] rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#22C55E]/10 rounded-lg">
                                    <Activity className="w-5 h-5 text-[#22C55E]" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-medium">Distance Traveled</p>
                                    <p className="text-sm font-bold text-white">42.5 km <span className="text-gray-500 font-normal">/ 120 km</span></p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#161616] border border-[#404040] rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-500/10 rounded-lg">
                                    <Users className="w-5 h-5 text-indigo-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-medium">Current Occupancy</p>
                                    <p className="text-sm font-bold text-white">{metrics.totalPassengers} Pax <span className="text-gray-500 font-normal">({metrics.utilization}%)</span></p>
                                </div>
                            </div>
                        </div>

                        {metrics.luggageAlerts > 0 && (
                            <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-[#EF4444]/20 rounded-lg">
                                        <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-[#EF4444] font-bold">Anomalies Detected</p>
                                        <p className="text-sm font-bold text-white">{metrics.luggageAlerts} Luggage Items</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Toggles */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Settings</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold">Live Polling</p>
                                    <p className="text-[10px] text-gray-500">Update GPS every 3s</p>
                                </div>
                                <button 
                                    onClick={() => setIsLiveTracking(!isLiveTracking)}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${isLiveTracking ? 'bg-[#3b82f6]' : 'bg-[#333333]'}`}
                                >
                                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isLiveTracking ? 'left-7' : 'left-1'}`}></span>
                                </button>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold">Public Tracking</p>
                                    <p className="text-[10px] text-gray-500">Share location link</p>
                                </div>
                                <button 
                                    onClick={() => setIsPublicLinkEnabled(!isPublicLinkEnabled)}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${isPublicLinkEnabled ? 'bg-[#3b82f6]' : 'bg-[#333333]'}`}
                                >
                                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isPublicLinkEnabled ? 'left-7' : 'left-1'}`}></span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Live Sensor Data Card */}
                    <div className="bg-[#202020] text-white p-5 rounded-xl border border-[#404040]">
                        <h2 className="text-2xl font-bold">
                            Live Sensor Data
                        </h2>
                        <p className="mt-3">
                            Distance: {sensorData.distance} cm
                        </p>
                        <p className="text-green-400 text-xl">
                            Status: {sensorData.status}
                        </p>
                    </div>

                    {/* Smart Alert Feed */}
                    <SmartAlerts maxHeight="260px" />
                </div>
            </div>

            {/* ── SEAT MAP OVERLAY / MODAL ───────────────────────────── */}
            <AnimatePresence>
                {showSeatMap && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-[#161616]/90 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4 md:p-8"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-[#202020] border-0 sm:border border-[#404040] rounded-none sm:rounded-2xl w-full h-full sm:h-auto sm:max-w-4xl sm:max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl"
                        >
                            <div className="sticky top-0 bg-[#202020] border-b border-[#404040] p-4 flex items-center justify-between z-10">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Armchair className="w-5 h-5 text-[#3b82f6]" />
                                    Live Seat Occupancy Matrix
                                </h2>
                                <button 
                                    onClick={() => setShowSeatMap(false)}
                                    className="p-2 bg-[#2a2a2a] hover:bg-[#333333] rounded-lg text-white transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                            <div className="p-6">
                                <SeatGrid seats={seats} />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
});

Operations.displayName = 'Operations';

export default Operations;
