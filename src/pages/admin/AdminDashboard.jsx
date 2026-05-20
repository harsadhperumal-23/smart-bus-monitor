import React, { useState, useEffect } from 'react';
import { Users, Armchair, AlertTriangle, UserCheck } from 'lucide-react';
import MetricsCard from '../components/MetricsCard';
import BusMap from '../components/BusMap';
import LiveAlertFeed from '../components/LiveAlertFeed';
import SeatGrid from '../components/SeatGrid';
import LiveSeatMonitor from '../../components/LiveSeatMonitor';
import useAlertNotifications from '../hooks/useAlertNotifications';
import {
    generateBusMetrics,
    updateBusPosition,
    getCurrentBusPosition,
    getRecentAlerts,
    getSeatData,
} from '../services/mockDataService';

const Operations = () => {
    const [metrics, setMetrics] = useState(null);
    const [busPosition, setBusPosition] = useState(getCurrentBusPosition());
    const [alerts, setAlerts] = useState([]);
    const [seats, setSeats] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Enable alert notifications
    useAlertNotifications(alerts);

    useEffect(() => {
        // Initial load
        setTimeout(() => {
            const data = generateBusMetrics();
            setMetrics(data);
            setAlerts(getRecentAlerts());
            setSeats(getSeatData());
            setIsLoading(false);
        }, 1000);

        // Polling every 3 seconds
        const interval = setInterval(() => {
            const data = generateBusMetrics();
            setMetrics(data);

            // Update bus position
            const newPosition = updateBusPosition();
            setBusPosition(newPosition);

            // Update alerts
            setAlerts(getRecentAlerts());

            // Update seat data
            setSeats(getSeatData());
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const handleSeatClick = (seat) => {
        console.log('Seat clicked:', seat);
        // Could open a modal or show detailed info
    };

    return (
        <div className="space-y-6" id="main-content">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-white light:text-slate-900 mb-2">
                    Operations Dashboard
                </h1>
                <p className="text-slate-400 light:text-slate-600">
                    Real-time bus monitoring and live metrics
                </p>
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
                    value={metrics?.driverStatus || 'Unknown'}
                    icon={UserCheck}
                    isLoading={isLoading}
                />
            </div>

            {/* Live Seat Monitor - Real-time Sensor Data */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <LiveSeatMonitor 
                        seatId="DEMO-SEAT"
                        pollInterval={800}
                    />
                </div>
                <div className="lg:col-span-2 bg-slate-900/50 border border-slate-700 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Sensor Information</h2>
                    <div className="space-y-3 text-slate-300">
                        <p>🔍 <strong>Real-time Monitoring:</strong> The Live Seat Monitor displays real-time sensor data with smooth animations.</p>
                        <p>📊 <strong>Features:</strong> Distance tracking (mm/cm), status indicators, 10-reading history, and signal strength.</p>
                        <p>🎯 <strong>Status Codes:</strong> 🧍 PASSENGER (Red) • 🧳 LUGGAGE (Orange) • 🪑 EMPTY (Green)</p>
                        <p>⚡ <strong>Polling:</strong> Updates every 800ms with smooth Framer Motion animations.</p>
                    </div>
                </div>
            </div>

            {/* Seat Occupancy Grid */}
            <SeatGrid seats={seats} onSeatClick={handleSeatClick} />

            {/* Map and Alerts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
                {/* Map - Takes 2 columns */}
                <div className="lg:col-span-2 h-full">
                    <BusMap currentPosition={busPosition} />
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

