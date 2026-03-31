import React, { useState, useEffect } from 'react';
import { Users, RefreshCw, AlertCircle } from 'lucide-react';
import { busAPI } from '../services/api';

/**
 * LivePassengerCount Component
 * 
 * Displays real-time passenger count from ESP32 via backend API
 * - Polls backend every 2 seconds
 * - Shows live updates with refresh indicator
 * - Displays loading and error states
 * - Optional capacity percentage
 * 
 * Usage:
 *   <LivePassengerCount busId="BUS001" capacity={40} />
 */
const LivePassengerCount = ({ busId = 'BUS001', capacity = 40, autoRefresh = true, refreshInterval = 2000 }) => {
  const [passengerCount, setPassengerCount = useState(0);
  const [isLoading, setIsLoading = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [occupancyPercentage, setOccupancyPercentage] = useState(0);

  /**
   * Fetch current bus status from backend
   */
  const fetchPassengerCount = async () => {
    try {
      setError(null);
      const response = await busAPI.getStatus();
      
      if (response.success && response.data) {
        const count = response.data.passengerCount || 0;
        setPassengerCount(count);
        setOccupancyPercentage(Math.round((count / capacity) * 100));
        setLastUpdate(new Date());
      }
    } catch (err) {
      console.error('Error fetching passenger count:', err);
      setError('Failed to fetch passenger count');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchPassengerCount();
  }, []);

  // Poll backend at intervals
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchPassengerCount, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, capacity]);

  // Determine color based on occupancy
  const getOccupancyColor = () => {
    if (occupancyPercentage < 50) return 'text-green-400';
    if (occupancyPercentage < 80) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getOccupancyBgColor = () => {
    if (occupancyPercentage < 50) return 'bg-green-500/10';
    if (occupancyPercentage < 80) return 'bg-yellow-500/10';
    return 'bg-red-500/10';
  };

  if (error) {
    return (
      <div className="p-4 lg:p-6 rounded-lg bg-red-500/10 border border-red-500/20">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <div>
            <p className="text-sm font-medium text-red-400">{error}</p>
            <p className="text-xs text-red-300 mt-1">Bus ID: {busId}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 lg:p-6 rounded-lg border border-slate-700 ${getOccupancyBgColor()}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className={`w-5 h-5 ${getOccupancyColor()}`} />
          <h3 className="text-sm font-medium text-slate-300">Live Passenger Count</h3>
        </div>
        {isLoading && (
          <RefreshCw className="w-4 h-4 text-slate-400 animate-spin" />
        )}
      </div>

      {/* Passenger Count Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Main Count */}
        <div>
          <div className="text-4xl font-bold text-white mb-1">
            {passengerCount}
          </div>
          <p className="text-xs text-slate-400">
            Current Passengers
          </p>
        </div>

        {/* Capacity Info */}
        <div>
          <div className="text-2xl font-semibold text-slate-300 mb-2">
            <span className={getOccupancyColor()}>{occupancyPercentage}%</span>
            <span className="text-sm text-slate-400 ml-2">Capacity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-slate-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${getOccupancyColor()}`}
                style={{ width: `${occupancyPercentage}%` }}
              />
            </div>
            <span className="text-xs text-slate-400">
              {passengerCount}/{capacity}
            </span>
          </div>
        </div>
      </div>

      {/* Last Update Info */}
      <div className="mt-4 pt-4 border-t border-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {lastUpdate ? `Last updated: ${lastUpdate.toLocaleTimeString()}` : 'Initializing...'}
          </span>
          <button
            onClick={fetchPassengerCount}
            disabled={isLoading}
            className="text-xs text-slate-400 hover:text-slate-300 disabled:opacity-50"
            title="Refresh passenger count"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mt-3 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-xs text-slate-400">
          Real-time (Updated every {refreshInterval / 1000}s)
        </span>
      </div>
    </div>
  );
};

export default LivePassengerCount;
