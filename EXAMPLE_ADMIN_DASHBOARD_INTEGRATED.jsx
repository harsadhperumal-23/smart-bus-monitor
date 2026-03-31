import React, { useState, useEffect } from 'react';
import { Users, Armchair, AlertTriangle, UserCheck } from 'lucide-react';
import MetricsCard from '../components/MetricsCard';
import BusMap from '../components/BusMap';
import LiveAlertFeed from '../components/LiveAlertFeed';
import SeatGrid from '../components/SeatGrid';
import LivePassengerCount from '../components/LivePassengerCount';  // NEW: Import live counter
import useAlertNotifications from '../hooks/useAlertNotifications';
import {
    generateBusMetrics,
    updateBusPosition,
    getCurrentBusPosition,
    getRecentAlerts,
    getSeatData,
} from '../services/mockDataService';

/**
 * Admin Dashboard - ENHANCED WITH LIVE PASSENGER COUNTER
 * 
 * NEW: LivePassengerCount component integrated in the metrics grid
 * Shows real-time passenger count from ESP32 sensor via API
 */
const AdminDashboard = () => {
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

        // Polling every 3 seconds (for mock data)
        // LivePassengerCount component polls at 2-second intervals independently
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
    };

    return (
        <div className="space-y-6" id="main-content">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-white light:text-slate-900 mb-2">
                    Operations Dashboard
                </h1>
                <p className="text-slate-400 light:text-slate-600">
                    Real-time bus monitoring with IoT sensors and live metrics
                </p>
            </div>

            {/* Metrics Grid - UPDATED WITH LIVE PASSENGER COUNTER */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                
                {/* NEW: Live Passenger Counter (spans 2 columns on large screens) */}
                <div className="md:col-span-2 lg:col-span-1 lg:row-span-2">
                    <LivePassengerCount 
                        busId="BUS001" 
                        capacity={40}
                        autoRefresh={true}
                        refreshInterval={2000}
                    />
                </div>

                {/* Existing Metrics */}
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

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Bus Map - spans 2 columns */}
                <div className="lg:col-span-2">
                    <BusMap position={busPosition} />
                </div>

                {/* Live Alerts - Sidebar */}
                <LiveAlertFeed alerts={alerts} />
            </div>

            {/* Seat Grid */}
            <div className="p-6 rounded-lg bg-slate-800/40 border border-slate-700">
                <h2 className="text-xl font-bold text-white mb-4">Seat Configuration</h2>
                <SeatGrid seats={seats} onSeatClick={handleSeatClick} />
            </div>

            {/* Optional: System Status Panel */}
            <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">
                        🟢 ESP32 Sensor Status: <span className="text-green-400 font-medium">Active</span>
                    </span>
                    <span className="text-slate-400">
                        📡 WiFi: <span className="text-green-400 font-medium">Connected</span>
                    </span>
                    <span className="text-slate-400">
                        📊 API: <span className="text-green-400 font-medium">Responding</span>
                    </span>
                    <span className="text-slate-400">
                        ⏱️ Update Interval: <span className="text-blue-400 font-medium">2s</span>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

/**
 * INTEGRATION NOTES:
 * 
 * 1. The LivePassengerCount component is now integrated alongside existing metrics
 * 
 * 2. It occupies one column in the metrics grid and spans 2 rows
 *    - On mobile: Full width (stacked above other metrics)
 *    - On tablet: 2 columns (middle of grid)
 *    - On desktop: 1 column (left side, double height)
 * 
 * 3. Component polls the API independently:
 *    - Fetches from: GET /api/bus/status
 *    - Every 2 seconds (configurable)
 *    - Shows real-time passenger count from ESP32
 * 
 * 4. Color Coding:
 *    - Green (0-50%): Good occupancy
 *    - Yellow (50-80%): Moderate
 *    - Red (80%+): Full/Near capacity
 * 
 * 5. No changes needed to other components:
 *    - Existing metrics still work with mock data
 *    - LivePassengerCount uses real API data independently
 *    - Can coexist with mock data for development
 * 
 * CUSTOMIZATION OPTIONS:
 * 
 * Option 1: Change update interval
 *   <LivePassengerCount busId="BUS001" capacity={40} refreshInterval={5000} />
 * 
 * Option 2: Disable auto-refresh (manual refresh only)
 *   <LivePassengerCount busId="BUS001" capacity={40} autoRefresh={false} />
 * 
 * Option 3: Multiple buses (change busId)
 *   {buses.map(bus => (
 *     <LivePassengerCount key={bus.id} busId={bus.id} capacity={bus.capacity} />
 *   ))}
 * 
 * Option 4: Show in a sidebar panel
 *   const [selectedBus, setSelectedBus] = useState('BUS001');
 *   <LivePassengerCount busId={selectedBus} capacity={40} />
 */
