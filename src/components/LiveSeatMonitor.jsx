import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * LiveSeatMonitor - Advanced real-time seat monitoring component
 * 
 * Features:
 * - Real-time sensor data polling (800ms interval)
 * - Glassmorphism design with smooth animations
 * - Distance display in mm and cm
 * - 10-reading history chart with sparkline
 * - Seat ID support for multi-seat deployments
 * - Signal strength indicator
 * - Responsive dark theme
 * 
 * @param {Object} props - Component props
 * @param {string} props.seatId - Unique seat identifier (e.g., "A-1")
 * @param {string} props.apiUrl - Backend API endpoint
 * @param {number} props.pollInterval - Polling interval in ms (default: 800)
 * @param {Function} props.onStatusChange - Callback when status changes
 */
const LiveSeatMonitor = ({ 
  seatId = 'SEAT-001',
  apiUrl = 'http://127.0.0.1:5000/sensor-data',
  pollInterval = 800,
  onStatusChange = null
}) => {
  // ==================== State Management ====================
  const [currentData, setCurrentData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [signalStrength, setSignalStrength] = useState(100);
  const [previousStatus, setPreviousStatus] = useState(null);

  // ==================== Status Configuration ====================
  const statusConfig = {
    PASSENGER: {
      color: 'from-red-600 to-red-800',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/50',
      emoji: '🧍',
      label: 'Passenger',
      textColor: 'text-red-500',
      accentColor: 'bg-red-500',
      lightAccent: 'bg-red-500/20',
    },
    LUGGAGE: {
      color: 'from-amber-600 to-amber-800',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/50',
      emoji: '🧳',
      label: 'Luggage',
      textColor: 'text-amber-500',
      accentColor: 'bg-amber-500',
      lightAccent: 'bg-amber-500/20',
    },
    EMPTY: {
      color: 'from-emerald-600 to-emerald-800',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/50',
      emoji: '🪑',
      label: 'Empty',
      textColor: 'text-emerald-500',
      accentColor: 'bg-emerald-500',
      lightAccent: 'bg-emerald-500/20',
    },
    UNKNOWN: {
      color: 'from-slate-600 to-slate-800',
      bgColor: 'bg-slate-500/10',
      borderColor: 'border-slate-500/50',
      emoji: '❓',
      label: 'Unknown',
      textColor: 'text-slate-500',
      accentColor: 'bg-slate-500',
      lightAccent: 'bg-slate-500/20',
    },
  };

  // ==================== Data Fetching ====================
  const fetchSensorData = useCallback(async () => {
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      const data = await response.json();

      // Validate data structure
      if (!data.distance || !data.status) {
        throw new Error('Invalid sensor data format');
      }

      // Handle status change callback
      if (previousStatus && previousStatus !== data.status && onStatusChange) {
        onStatusChange(data.status, previousStatus);
      }

      setCurrentData(data);
      setPreviousStatus(data.status);
      
      // Add to history and keep last 10 readings
      setHistory(prev => {
        const newHistory = [...prev, { distance: data.distance, timestamp: Date.now() }];
        return newHistory.slice(-10);
      });

      setError(null);
      setIsLive(true);
      setLastUpdated(new Date());
      setSignalStrength(100);
      setLoading(false);

      // Reset live indicator pulse
      setTimeout(() => setIsLive(false), 400);
    } catch (err) {
      setError(err.message);
      setSignalStrength(prev => Math.max(prev - 10, 0));
      setLoading(false);
    }
  }, [apiUrl, previousStatus, onStatusChange]);

  // ==================== Effects ====================
  useEffect(() => {
    // Initial fetch
    fetchSensorData();

    // Set up polling interval
    const interval = setInterval(fetchSensorData, pollInterval);

    return () => clearInterval(interval);
  }, [fetchSensorData, pollInterval]);

  // ==================== Utility Functions ====================
  const formatDistance = (distance) => {
    const mm = distance || 0;
    const cm = (mm / 10).toFixed(1);
    return { mm, cm };
  };

  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Get max distance for sparkline scaling
  const maxDistance = history.length > 0 ? Math.max(...history.map(h => h.distance)) : 100;
  const minDistance = history.length > 0 ? Math.min(...history.map(h => h.distance)) : 0;
  const distanceRange = maxDistance - minDistance || 1;

  // ==================== Component Render ====================
  const config = currentData 
    ? statusConfig[currentData.status] || statusConfig.UNKNOWN 
    : statusConfig.UNKNOWN;

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {loading && !currentData ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center p-12"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full"
            />
            <p className="mt-4 text-slate-400 text-sm font-medium">Connecting to sensor...</p>
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl backdrop-blur-md"
          >
            <p className="text-red-500 font-semibold">Connection Error</p>
            <p className="text-red-400 text-sm mt-2">{error}</p>
            <p className="text-red-400 text-xs mt-3 opacity-75">
              Ensure backend is running at {apiUrl}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            {/* Main Glassmorphism Card */}
            <div className={`relative overflow-hidden rounded-3xl border ${config.borderColor} bg-gradient-to-br ${config.bgColor} backdrop-blur-2xl shadow-2xl transition-all duration-500`}>
              
              {/* Animated Background Gradient */}
              <motion.div
                animate={{
                  backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                }}
                transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-5`}
                style={{ backgroundSize: '200% 200%' }}
              />

              {/* Light Source Effect */}
              <div className={`absolute -top-40 -right-40 w-80 h-80 ${config.accentColor} opacity-5 blur-3xl rounded-full`} />

              {/* Content Container */}
              <div className="relative p-6 md:p-8 space-y-6">
                
                {/* ===== HEADER ===== */}
                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                      Seat Monitor
                    </h3>
                    <p className={`text-lg font-bold ${config.textColor}`}>{seatId}</p>
                  </div>

                  {/* Live Indicator */}
                  <motion.div
                    animate={isLive ? { scale: [1, 1.15, 1] } : {}}
                    transition={{ duration: 0.5 }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10"
                  >
                    <motion.div
                      animate={isLive ? { opacity: [1, 0.3, 1], scale: [1, 1.3, 1] } : { opacity: 0.5 }}
                      transition={{ duration: 0.5 }}
                      className={`w-2 h-2 rounded-full ${config.accentColor}`}
                    />
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      {isLive ? 'Live' : 'Ready'}
                    </span>
                  </motion.div>
                </div>

                {/* ===== EMOJI STATUS ===== */}
                <div className="flex justify-center py-2">
                  <motion.div
                    key={`emoji-${currentData?.status}`}
                    initial={{ scale: 0, rotate: -180, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    exit={{ scale: 0, rotate: 180, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="text-7xl md:text-8xl"
                  >
                    {config.emoji}
                  </motion.div>
                </div>

                {/* ===== DISTANCE DISPLAY ===== */}
                <motion.div layout className="text-center space-y-3">
                  <motion.div
                    key={`distance-${currentData?.distance}`}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className={`text-5xl md:text-6xl font-bold ${config.textColor} font-mono`}
                  >
                    {currentData?.distance || '0'}
                  </motion.div>

                  {/* Dual Distance Display */}
                  <div className="flex items-center justify-center gap-4 text-sm">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10"
                    >
                      <span className="text-slate-400">mm: </span>
                      <span className="font-semibold text-slate-200">
                        {formatDistance(currentData?.distance).mm}
                      </span>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10"
                    >
                      <span className="text-slate-400">cm: </span>
                      <span className="font-semibold text-slate-200">
                        {formatDistance(currentData?.distance).cm}
                      </span>
                    </motion.div>
                  </div>
                </motion.div>

                {/* ===== STATUS BADGE ===== */}
                <motion.div
                  layout
                  key={`status-${currentData?.status}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`px-6 py-3 rounded-xl border ${config.borderColor} ${config.bgColor} text-center`}
                >
                  <p className={`text-xl font-bold ${config.textColor}`}>
                    {config.label}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">
                    Current Status
                  </p>
                </motion.div>

                {/* ===== SPARKLINE CHART ===== */}
                {history.length > 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-2"
                  >
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Distance History (Last 10 readings)
                    </p>
                    <div className="flex items-end justify-center gap-1 h-12 px-2 py-3 rounded-lg bg-white/5 border border-white/10">
                      {history.map((reading, idx) => {
                        const normalizedHeight = ((reading.distance - minDistance) / distanceRange) * 100;
                        return (
                          <motion.div
                            key={`bar-${idx}`}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: `${Math.max(normalizedHeight, 5)}%`, opacity: 0.8 }}
                            transition={{ duration: 0.3, delay: idx * 0.02 }}
                            whileHover={{ opacity: 1, scale: 1.1 }}
                            className={`flex-1 rounded-sm ${config.accentColor} hover:${config.accentColor} cursor-pointer transition-all`}
                            title={`${reading.distance}mm`}
                          />
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* ===== METRICS GRID ===== */}
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/5">
                  
                  {/* Last Updated */}
                  <motion.div
                    layout
                    className="text-center"
                  >
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Updated
                    </p>
                    <motion.p
                      key={lastUpdated?.getTime()}
                      initial={{ opacity: 0.5 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm font-mono text-slate-300"
                    >
                      {formatTime(lastUpdated)}
                    </motion.p>
                  </motion.div>

                  {/* Signal Strength */}
                  <motion.div layout className="text-center">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Signal
                    </p>
                    <motion.div
                      layout
                      className="flex items-center justify-center gap-1"
                    >
                      {[...Array(4)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{
                            opacity: signalStrength > (i * 25) ? 1 : 0.2,
                          }}
                          transition={{ duration: 0.3 }}
                          className={`w-1 h-2 rounded-sm ${
                            signalStrength > (i * 25) ? config.accentColor : 'bg-slate-700'
                          }`}
                        />
                      ))}
                    </motion.div>
                  </motion.div>

                  {/* Reading Count */}
                  <motion.div layout className="text-center">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Readings
                    </p>
                    <p className="text-sm font-mono text-slate-300">
                      {history.length}/10
                    </p>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Footer Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4 text-center text-xs text-slate-500"
            >
              <p>Polling every {pollInterval}ms • VL53L1X Sensor</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LiveSeatMonitor;
