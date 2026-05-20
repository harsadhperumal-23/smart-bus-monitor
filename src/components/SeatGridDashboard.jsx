import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import LiveSeatMonitor from './LiveSeatMonitor';
import { AlertCircle, Users, BarChart3, RefreshCw } from 'lucide-react';

/**
 * SeatGridDashboard - Complete seat monitoring grid for buses
 * 
 * Displays multiple LiveSeatMonitor components in a grid layout
 * with real-time statistics and alert management.
 * 
 * Features:
 * - 3x4 seat layout (customizable)
 * - Real-time occupancy stats
 * - Alert feed for status changes
 * - Responsive design
 * - Color-coded summary
 */
const SeatGridDashboard = ({ 
  busId = 'BUS-001',
  backendUrl = 'http://127.0.0.1:5000',
  maxAlerts = 10
}) => {
  // ==================== State Management ====================
  const [seatStatuses, setSeatStatuses] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);

  // ==================== Seat Layout ====================
  // Customize this to match your bus configuration
  const SEAT_LAYOUT = [
    ['A-1', 'A-2', 'A-3', 'A-4'],
    ['B-1', 'B-2', 'B-3', 'B-4'],
    ['C-1', 'C-2', 'C-3', 'C-4'],
  ];

  const ALL_SEATS = SEAT_LAYOUT.flat();

  // ==================== Event Handlers ====================
  const handleStatusChange = useCallback((seatId, newStatus, oldStatus) => {
    // Update seat status
    setSeatStatuses(prev => ({
      ...prev,
      [seatId]: newStatus
    }));

    // Create alert for significant changes
    let alertMessage = '';
    let alertType = 'info';

    if (oldStatus === 'EMPTY' && newStatus === 'PASSENGER') {
      alertMessage = `🧍 Seat ${seatId} is now occupied`;
      alertType = 'occupancy';
    } else if (oldStatus === 'EMPTY' && newStatus === 'LUGGAGE') {
      alertMessage = `🧳 Luggage detected in seat ${seatId}`;
      alertType = 'luggage';
    } else if (oldStatus !== 'EMPTY' && newStatus === 'EMPTY') {
      alertMessage = `🪑 Seat ${seatId} is now empty`;
      alertType = 'emptied';
    } else if (oldStatus !== newStatus) {
      alertMessage = `Seat ${seatId}: ${oldStatus} → ${newStatus}`;
      alertType = 'change';
    }

    // Add to alert feed
    if (alertMessage) {
      setAlerts(prev => [{
        id: Date.now(),
        seatId,
        message: alertMessage,
        type: alertType,
        timestamp: new Date(),
      }, ...prev].slice(0, maxAlerts));
    }
  }, [maxAlerts]);

  // ==================== Statistics ====================
  const stats = {
    total: ALL_SEATS.length,
    occupied: Object.values(seatStatuses).filter(s => s === 'PASSENGER').length,
    luggage: Object.values(seatStatuses).filter(s => s === 'LUGGAGE').length,
    empty: Object.values(seatStatuses).filter(s => s === 'EMPTY').length,
    monitored: Object.keys(seatStatuses).length,
    occupancyRate: Math.round((Object.values(seatStatuses).filter(s => s === 'PASSENGER').length / ALL_SEATS.length) * 100),
  };

  // ==================== Get Seat Status Badge ====================
  const getSeatStatusColor = (status) => {
    switch (status) {
      case 'PASSENGER': return 'bg-red-500/20 border-red-500/30 text-red-400';
      case 'LUGGAGE': return 'bg-amber-500/20 border-amber-500/30 text-amber-400';
      case 'EMPTY': return 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400';
      default: return 'bg-slate-500/20 border-slate-500/30 text-slate-400';
    }
  };

  // ==================== Component Render ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      
      {/* ===== HEADER ===== */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Bus Seat Monitoring
        </h1>
        <p className="text-slate-400">
          Real-time occupancy tracking • Bus {busId}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* ===== MAIN CONTENT AREA ===== */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3"
          >
            {/* Occupied Count */}
            <div className="bg-gradient-to-br from-red-900/20 to-red-800/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-400 text-xs font-semibold uppercase tracking-wider mb-1">
                Occupied
              </p>
              <p className="text-2xl md:text-3xl font-bold text-red-500">
                {stats.occupied}
              </p>
              <p className="text-xs text-red-400/60 mt-1">of {stats.total}</p>
            </div>

            {/* Luggage Count */}
            <div className="bg-gradient-to-br from-amber-900/20 to-amber-800/10 border border-amber-500/30 rounded-lg p-4">
              <p className="text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
                Luggage
              </p>
              <p className="text-2xl md:text-3xl font-bold text-amber-500">
                {stats.luggage}
              </p>
              <p className="text-xs text-amber-400/60 mt-1">stored</p>
            </div>

            {/* Empty Count */}
            <div className="bg-gradient-to-br from-emerald-900/20 to-emerald-800/10 border border-emerald-500/30 rounded-lg p-4">
              <p className="text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
                Empty
              </p>
              <p className="text-2xl md:text-3xl font-bold text-emerald-500">
                {stats.empty}
              </p>
              <p className="text-xs text-emerald-400/60 mt-1">available</p>
            </div>

            {/* Occupancy Rate */}
            <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1">
                Occupancy
              </p>
              <p className="text-2xl md:text-3xl font-bold text-blue-500">
                {stats.occupancyRate}%
              </p>
              <p className="text-xs text-blue-400/60 mt-1">capacity</p>
            </div>
          </motion.div>

          {/* Seat Grid */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-slate-900/30 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-md"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users size={20} />
                Seat Layout
              </h2>
              <span className="text-xs text-slate-400">
                {stats.monitored}/{stats.total} monitored
              </span>
            </div>

            {/* Seat Grid Container */}
            <div className="space-y-4">
              {SEAT_LAYOUT.map((row, rowIdx) => (
                <motion.div
                  key={rowIdx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 + rowIdx * 0.1 }}
                  className="grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                  {row.map(seatId => (
                    <motion.div
                      key={seatId}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedSeat(selectedSeat === seatId ? null : seatId)}
                      className="cursor-pointer"
                    >
                      <div
                        className={`overflow-hidden rounded-xl border-2 transition-all ${
                          selectedSeat === seatId
                            ? 'border-blue-500/80 ring-2 ring-blue-500/30'
                            : 'border-slate-700/50 hover:border-slate-600'
                        }`}
                      >
                        <LiveSeatMonitor
                          seatId={seatId}
                          apiUrl={`${backendUrl}/sensor-data/${seatId}`}
                          pollInterval={800}
                          onStatusChange={(newStatus, oldStatus) =>
                            handleStatusChange(seatId, newStatus, oldStatus)
                          }
                        />
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Selected Seat Details */}
          <AnimatePresence>
            {selectedSeat && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-slate-900/50 border border-blue-500/30 rounded-xl p-4"
              >
                <h3 className="font-semibold text-white mb-2">
                  Seat Details: {selectedSeat}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-slate-400">Current Status</p>
                    <p className={`font-semibold ${getSeatStatusColor(seatStatuses[selectedSeat])}`}>
                      {seatStatuses[selectedSeat] || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Last Updated</p>
                    <p className="font-semibold text-blue-400">
                      Just now
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Signal</p>
                    <p className="font-semibold text-emerald-400">●●●● Strong</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Sensor</p>
                    <p className="font-semibold text-slate-300">VL53L1X</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ===== SIDEBAR ===== */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          
          {/* Alert Feed */}
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 backdrop-blur-md">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <AlertCircle size={16} />
              Recent Activity
            </h3>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {alerts.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center h-20"
                >
                  <p className="text-slate-500 text-sm text-center">
                    No recent activity
                  </p>
                </motion.div>
              ) : (
                alerts.map((alert, idx) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`text-xs border-l-2 pl-3 py-2 rounded-r ${
                      alert.type === 'occupancy'
                        ? 'border-red-500/50 bg-red-500/10'
                        : alert.type === 'luggage'
                        ? 'border-amber-500/50 bg-amber-500/10'
                        : alert.type === 'emptied'
                        ? 'border-emerald-500/50 bg-emerald-500/10'
                        : 'border-slate-500/50 bg-slate-500/10'
                    }`}
                  >
                    <p className="font-semibold text-white">
                      {alert.message}
                    </p>
                    <p className="text-slate-400 mt-1">
                      {alert.timestamp.toLocaleTimeString()}
                    </p>
                  </motion.div>
                ))
              )}
            </div>

            {alerts.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setAlerts([])}
                className="mt-3 w-full py-2 text-xs font-semibold text-slate-400 hover:text-slate-300 border border-slate-700 rounded hover:bg-slate-800/50 transition-colors"
              >
                Clear Alerts
              </motion.button>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 backdrop-blur-md space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 size={16} />
              Summary
            </h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Seats:</span>
                <span className="font-semibold text-white">{stats.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Monitored:</span>
                <span className="font-semibold text-blue-400">{stats.monitored}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Occupied:</span>
                <span className="font-semibold text-red-400">{stats.occupied}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Luggage:</span>
                <span className="font-semibold text-amber-400">{stats.luggage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Empty:</span>
                <span className="font-semibold text-emerald-400">{stats.empty}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-700">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-400">OCCUPANCY</span>
                <span className="text-lg font-bold text-white">{stats.occupancyRate}%</span>
              </div>
              <div className="mt-2 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.occupancyRate}%` }}
                  transition={{ duration: 1 }}
                  className="h-full bg-gradient-to-r from-red-500 to-red-600"
                />
              </div>
            </div>
          </div>

          {/* Refresh Info */}
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <RefreshCw size={14} className="text-slate-400" />
              </motion.div>
              <span className="text-xs text-slate-400">Auto-updating</span>
            </div>
            <p className="text-xs text-slate-500">
              Every 800ms
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Animation component import
const AnimatePresence = ({ children }) => <>{children}</>;

export default SeatGridDashboard;
