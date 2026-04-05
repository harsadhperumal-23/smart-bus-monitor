import React, { useState, useEffect } from 'react';
import { Users, Armchair, AlertTriangle, UserCheck, Bus as BusIcon, Shield, User } from 'lucide-react';
import MetricsCard from '../components/MetricsCard';
import BusMap from '../components/BusMap';
import LiveAlertFeed from '../components/LiveAlertFeed';
import SeatGrid from '../components/SeatGrid';
import useAlertNotifications from '../hooks/useAlertNotifications';

const API_BASE_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api`;

const Operations = () => {
    const [selectedBus, setSelectedBus] = useState('BUS-001');
    const [availableBuses] = useState(['BUS-001', 'BUS-002', 'BUS-003']);
    const [busData, setBusData] = useState(null);
    const [seats, setSeats] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSwitching, setIsSwitching] = useState(false);

    // Enable alert notifications
    useAlertNotifications([]);

    // Fetch bus data from API
    const fetchBusData = async (busId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/bus/${busId}`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch bus data');
            }

            const result = await response.json();
            if (result.success) {
                setBusData(result.data);
            }
        } catch (error) {
            console.error('Error fetching bus data:', error);
        }
    };

    // Fetch seat data from API
    const fetchSeatData = async (busId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/bus/${busId}/seat-map`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch seat data');
            }

            const result = await response.json();
            if (result.success && result.data.seats) {
                console.log('📊 Raw seat data from API:', result.data.seats);

                // Transform seat data to match SeatGrid component expectations
                // Backend sends: { seatNumber, state: "HUMAN" | "LUGGAGE" | "VACANT" }
                // Frontend needs: { number, occupied: boolean, hasLuggage: boolean }
                const transformedSeats = result.data.seats.map(seat => {
                    const seatData = {
                        id: seat.seatNumber,
                        number: seat.seatNumber,
                        occupied: seat.state === 'HUMAN' || seat.state === 'LUGGAGE',
                        hasLuggage: seat.state === 'LUGGAGE',
                        passengerCount: seat.state === 'HUMAN' ? 1 : 0,
                        row: Math.floor((seat.seatNumber - 1) / 4) + 1,
                        position: ['A', 'B', 'C', 'D'][(seat.seatNumber - 1) % 4],
                        lastUpdated: new Date().toISOString()
                    };
                    return seatData;
                });

                console.log('✅ Transformed seat data:', transformedSeats);
                setSeats(transformedSeats);
            } else {
                console.warn('⚠️ No seat data received from API');
                setSeats([]);
            }
        } catch (error) {
            console.error('❌ Error fetching seat data:', error);
        }
    };

    // Initial load and polling
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            await Promise.all([
                fetchBusData(selectedBus),
                fetchSeatData(selectedBus)
            ]);
            setIsLoading(false);
            setIsSwitching(false);
        };

        loadData();

        // Poll every 3 seconds
        const interval = setInterval(() => {
            fetchBusData(selectedBus);
            fetchSeatData(selectedBus);
        }, 3000);

        return () => clearInterval(interval);
    }, [selectedBus]);

    const handleSeatClick = (seat) => {
        console.log('Seat clicked:', seat);
    };

    // Extract data from busData with safety checks
    const driverStatus = busData?.driverStatus
        ? {
            name: busData.driverStatus.name || 'Unknown Driver',
            present: busData.driverStatus.present || false,
            location: busData.driverStatus.location || 'N/A'
        }
        : { name: 'Unknown Driver', present: false, location: 'N/A' };

    const attenderStatus = busData?.attenderStatus
        ? {
            name: busData.attenderStatus.name || 'Unknown Attender',
            present: busData.attenderStatus.present || false,
            location: busData.attenderStatus.location || 'N/A'
        }
        : { name: 'Unknown Attender', present: false, location: 'N/A' };

    const metrics = {
        totalPassengers: busData?.humanCount || 0,
        occupiedSeats: busData?.seatStates?.filter(s => s.state === 'occupied').length || 0,
        luggageAlerts: busData?.luggageCount || 0
    };

    const busPosition = busData?.gpsLocation
        ? { lat: busData.gpsLocation.lat, lng: busData.gpsLocation.lng }
        : null;

    const alerts = busData?.alerts || [];

    return (
        <div className="space-y-6" id="main-content">
            {/* Page Header with Bus Selector */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white light:text-slate-900 mb-2">
                        Operations Dashboard
                    </h1>
                    <p className="text-slate-400 light:text-slate-600">
                        Real-time bus monitoring and live metrics
                    </p>
                </div>

                {/* Bus Selector */}
                <div className="glass-card p-4 rounded-xl">
                    <label className="text-sm text-slate-400 light:text-slate-600 mb-2 block">
                        Select Bus
                    </label>
                    <select
                        value={selectedBus}
                        onChange={(e) => setSelectedBus(e.target.value)}
                        className="bg-white/10 light:bg-slate-200 text-white light:text-slate-900 px-4 py-2 rounded-lg border border-white/20 light:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {availableBuses.map(bus => (
                            <option key={bus} value={bus} className="bg-slate-800 light:bg-white">
                                {bus}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Driver and Attender Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Driver Status */}
                <div className="glass-card rounded-xl p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                            <Shield className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white light:text-slate-900">Driver Status</h3>
                            <p className="text-sm text-slate-400 light:text-slate-600">{driverStatus.name}</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400 light:text-slate-600">Status</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${driverStatus.present
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                }`}>
                                {driverStatus.present ? 'Present' : 'Absent'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400 light:text-slate-600">Location</span>
                            <span className="text-white light:text-slate-900 font-medium">{driverStatus.location}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400 light:text-slate-600">Last Seen</span>
                            <span className="text-white light:text-slate-900 font-medium">Just now</span>
                        </div>
                    </div>
                </div>

                {/* Attender Status */}
                <div className="glass-card rounded-xl p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white light:text-slate-900">Attender Status</h3>
                            <p className="text-sm text-slate-400 light:text-slate-600">{attenderStatus.name}</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400 light:text-slate-600">Status</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${attenderStatus.present
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                }`}>
                                {attenderStatus.present ? 'Present' : 'Absent'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400 light:text-slate-600">Location</span>
                            <span className="text-white light:text-slate-900 font-medium">{attenderStatus.location}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400 light:text-slate-600">Last Seen</span>
                            <span className="text-white light:text-slate-900 font-medium">30s ago</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricsCard
                    title="Total Passengers"
                    value={metrics?.totalPassengers || 0}
                    icon={Users}
                    trend={2}
                    isLoading={isLoading}
                />
                <MetricsCard
                    title="Occupied Seats"
                    value={`${metrics?.occupiedSeats || 0}/40`}
                    icon={Armchair}
                    isLoading={isLoading}
                />
                <MetricsCard
                    title="Luggage Alerts"
                    value={metrics?.luggageAlerts || 0}
                    icon={AlertTriangle}
                    trend={-1}
                    isLoading={isLoading}
                />
                <MetricsCard
                    title="Driver Status"
                    value={driverStatus.present ? 'Active' : 'Inactive'}
                    icon={UserCheck}
                    isLoading={isLoading}
                />
            </div>

            {/* Seat Occupancy Grid with Legend */}
            <div>
                {isLoading || seats.length === 0 ? (
                    <div className="glass-card rounded-xl p-12 text-center">
                        <div className="animate-pulse">
                            <div className="text-2xl font-bold text-white light:text-slate-900 mb-2">
                                🚌 Connecting to Bus...
                            </div>
                            <p className="text-slate-400 light:text-slate-600">
                                Loading seat data from {selectedBus}
                            </p>
                        </div>
                    </div>
                ) : (
                    <SeatGrid seats={seats} onSeatClick={handleSeatClick} />
                )}
            </div>

            {/* Map and Alerts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
                {/* Map - Takes 2 columns */}
                <div className="lg:col-span-2 h-full">
                    <BusMap currentPosition={busPosition} busData={busData} />
                </div>

                {/* Live Alert Feed - Takes 1 column */}
                <div className="h-full">
                    <LiveAlertFeed alerts={alerts} />
                </div>
            </div>
        </div>
    );
};

export default Operations;
