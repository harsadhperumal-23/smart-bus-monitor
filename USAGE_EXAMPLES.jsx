/**
 * USAGE EXAMPLES - LiveSeatMonitor Component
 * 
 * Copy and adapt these examples to your dashboard pages
 * All examples are production-ready and fully functional
 */

// ============================================================================
// EXAMPLE 1: Add to Existing Operations Page
// ============================================================================

// pages/Operations/SeatMonitoring.jsx
import React from 'react';
import LiveSeatMonitor from '../../components/LiveSeatMonitor';
import { AlertCircle } from 'lucide-react';

export default function SeatMonitoringPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white mb-8">Live Seat Monitor</h1>
      
      <div className="max-w-2xl">
        <LiveSeatMonitor 
          seatId="SEAT-A1"
          apiUrl="http://127.0.0.1:5000/sensor-data"
        />
      </div>

      <div className="mt-8 p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
        <p className="text-slate-300 text-sm">
          💡 <strong>Tip:</strong> Open browser DevTools (F12) and check the Network tab to see API calls every 800ms
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 2: Multi-Seat Monitoring for a Specific Row
// ============================================================================

// pages/Operations/SeatRowMonitor.jsx
import React, { useState } from 'react';
import LiveSeatMonitor from '../../components/LiveSeatMonitor';

export default function SeatRowMonitor() {
  const [rowStatuses, setRowStatuses] = useState({});
  
  const ROW_SEATS = ['A-1', 'A-2', 'A-3', 'A-4', 'A-5', 'A-6'];

  const handleStatusChange = (seatId, newStatus, oldStatus) => {
    setRowStatuses(prev => ({ ...prev, [seatId]: newStatus }));
  };

  const occupiedCount = Object.values(rowStatuses).filter(s => s === 'PASSENGER').length;

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Row A Monitoring</h1>
        <p className="text-slate-400">
          Occupied: {occupiedCount}/{ROW_SEATS.length} seats
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ROW_SEATS.map(seatId => (
          <div key={seatId} className="bg-slate-900/30 rounded-xl p-4 border border-slate-700">
            <LiveSeatMonitor
              seatId={seatId}
              apiUrl={`http://127.0.0.1:5000/sensor-data/${seatId}`}
              onStatusChange={(newStatus, oldStatus) =>
                handleStatusChange(seatId, newStatus, oldStatus)
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 3: Full Bus Grid Dashboard
// ============================================================================

// pages/Operations/BusGridDashboard.jsx
import React, { useState } from 'react';
import SeatGridDashboard from '../../components/SeatGridDashboard';

export default function BusGridDashboardPage() {
  return (
    <div>
      <SeatGridDashboard 
        busId="BUS-001"
        backendUrl="http://127.0.0.1:5000"
        maxAlerts={15}
      />
    </div>
  );
}

// ============================================================================
// EXAMPLE 4: Integrated with Layout (Header, Sidebar, etc)
// ============================================================================

// pages/Operations/index.jsx
import React, { useState } from 'react';
import Layout from '../../components/Layout';
import LiveSeatMonitor from '../../components/LiveSeatMonitor';
import SeatGridDashboard from '../../components/SeatGridDashboard';
import { BarChart3, Grid3x3, Settings } from 'lucide-react';

export default function OperationsPage() {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'detail'
  const [selectedSeat, setSelectedSeat] = useState(null);

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Operations</h1>
            <p className="text-slate-400 mt-2">Real-time seat monitoring and bus status</p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <Grid3x3 size={18} />
              Grid View
            </button>
            <button
              onClick={() => setViewMode('detail')}
              className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${
                viewMode === 'detail'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <BarChart3 size={18} />
              Detail View
            </button>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'grid' ? (
          <SeatGridDashboard busId="BUS-001" />
        ) : (
          <div className="max-w-md">
            <LiveSeatMonitor seatId="SEAT-A1" />
          </div>
        )}
      </div>
    </Layout>
  );
}

// ============================================================================
// EXAMPLE 5: Mobile-First Responsive Layout
// ============================================================================

// pages/Operations/MobileMonitor.jsx
import React, { useState } from 'react';
import LiveSeatMonitor from '../../components/LiveSeatMonitor';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function MobileMonitor() {
  const SEATS = ['A-1', 'A-2', 'A-3', 'A-4', 'B-1', 'B-2', 'B-3', 'B-4', 'C-1', 'C-2', 'C-3', 'C-4'];
  const [currentIdx, setCurrentIdx] = useState(0);

  const nextSeat = () => setCurrentIdx((prev) => (prev + 1) % SEATS.length);
  const prevSeat = () => setCurrentIdx((prev) => (prev - 1 + SEATS.length) % SEATS.length);

  return (
    <div className="min-h-screen bg-slate-950 p-4 flex flex-col">
      {/* Header */}
      <h1 className="text-2xl font-bold text-white mb-2">Seat Monitor</h1>
      <p className="text-slate-400 text-sm mb-6">Monitoring {SEATS.length} seats</p>

      {/* Current Seat - Full screen on mobile */}
      <div className="flex-1 flex items-center justify-center mb-6">
        <LiveSeatMonitor 
          seatId={SEATS[currentIdx]}
          apiUrl={`http://127.0.0.1:5000/sensor-data/${SEATS[currentIdx]}`}
        />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={prevSeat}
          className="p-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="flex-1">
          <p className="text-center text-slate-300 font-semibold mb-2">
            Seat {currentIdx + 1} of {SEATS.length}
          </p>
          <div className="flex gap-1">
            {SEATS.map((_, idx) => (
              <div
                key={idx}
                className={`flex-1 h-1 rounded-full transition-all ${
                  idx === currentIdx ? 'bg-blue-500' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        <button
          onClick={nextSeat}
          className="p-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 6: With Custom Styling & Wrapper
// ============================================================================

// components/SeatCard.jsx
import React from 'react';
import LiveSeatMonitor from './LiveSeatMonitor';
import { motion } from 'framer-motion';

/**
 * Wrapper component for consistent seat card styling
 */
export function SeatCard({ 
  seatId, 
  onStatusChange,
  highlighted = false,
  className = ''
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`rounded-xl overflow-hidden border-2 transition-all ${
        highlighted
          ? 'border-blue-500/80 ring-2 ring-blue-500/30 shadow-lg shadow-blue-500/20'
          : 'border-slate-700/50 hover:border-slate-600'
      } ${className}`}
    >
      <LiveSeatMonitor
        seatId={seatId}
        apiUrl={`http://127.0.0.1:5000/sensor-data/${seatId}`}
        onStatusChange={onStatusChange}
      />
    </motion.div>
  );
}

// Usage:
// <SeatCard seatId="A-1" highlighted={true} />

// ============================================================================
// EXAMPLE 7: With Error Boundary & Fallback
// ============================================================================

// components/SeatMonitorWithBoundary.jsx
import React from 'react';
import LiveSeatMonitor from './LiveSeatMonitor';

export default class SeatMonitorWithBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Seat Monitor Error:', error, errorInfo);
    this.setState({ hasError: true });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500">
          <p className="font-semibold">Failed to load seat monitor</p>
          <p className="text-sm mt-1">Please refresh the page</p>
        </div>
      );
    }

    return (
      <LiveSeatMonitor 
        seatId={this.props.seatId}
        apiUrl={this.props.apiUrl}
        onStatusChange={this.props.onStatusChange}
      />
    );
  }
}

// ============================================================================
// EXAMPLE 8: With Analytics & Tracking
// ============================================================================

// hooks/useSeatAnalytics.js
import { useState, useCallback } from 'react';

export function useSeatAnalytics() {
  const [analytics, setAnalytics] = useState({});

  const trackStatusChange = useCallback((seatId, newStatus, oldStatus) => {
    setAnalytics(prev => {
      const seatAnalytics = prev[seatId] || {
        transitions: [],
        lastChange: null,
      };

      return {
        ...prev,
        [seatId]: {
          transitions: [
            ...seatAnalytics.transitions,
            { from: oldStatus, to: newStatus, timestamp: Date.now() }
          ].slice(-100), // Keep last 100 transitions
          lastChange: new Date(),
        }
      };
    });
  }, []);

  return { analytics, trackStatusChange };
}

// Usage in component:
// const { analytics, trackStatusChange } = useSeatAnalytics();
// <LiveSeatMonitor onStatusChange={(ns, os) => trackStatusChange('A-1', ns, os)} />

// ============================================================================
// EXAMPLE 9: Integration with Redux/State Management
// ============================================================================

// store/seatSlice.js (Redux example)
import { createSlice } from '@reduxjs/toolkit';

const seatSlice = createSlice({
  name: 'seats',
  initialState: {},
  reducers: {
    updateSeatStatus: (state, action) => {
      const { seatId, status } = action.payload;
      state[seatId] = status;
    },
  },
});

export const { updateSeatStatus } = seatSlice.actions;
export default seatSlice.reducer;

// Usage in component:
// const dispatch = useDispatch();
// <LiveSeatMonitor 
//   onStatusChange={(ns, os) => dispatch(updateSeatStatus({ seatId: 'A-1', status: ns }))}
// />

// ============================================================================
// EXAMPLE 10: Standalone Page with All Features
// ============================================================================

// pages/Operations/AdvancedMonitoring.jsx
import React, { useState, useCallback } from 'react';
import LiveSeatMonitor from '../../components/LiveSeatMonitor';
import { AlertCircle, Download, RefreshCw } from 'lucide-react';

export default function AdvancedMonitoring() {
  const [seatData, setSeatData] = useState({});
  const [alerts, setAlerts] = useState([]);

  const handleStatusChange = useCallback((seatId, newStatus, oldStatus) => {
    setSeatData(prev => ({ ...prev, [seatId]: newStatus }));

    // Create alert
    setAlerts(prev => [{
      id: Date.now(),
      seatId,
      message: `${oldStatus} → ${newStatus}`,
      timestamp: new Date(),
    }, ...prev].slice(0, 20));
  }, []);

  const exportData = () => {
    const csv = Object.entries(seatData)
      .map(([id, status]) => `${id},${status}`)
      .join('\n');
    
    const element = document.createElement('a');
    element.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`);
    element.setAttribute('download', `seat-data-${Date.now()}.csv`);
    element.click();
  };

  return (
    <div className="p-6">
      {/* Header with Export */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Advanced Monitoring</h1>
        <button
          onClick={exportData}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Download size={18} />
          Export Data
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Monitor */}
        <div className="col-span-2">
          <div className="max-w-2xl">
            <LiveSeatMonitor 
              seatId="SEAT-A1"
              onStatusChange={(ns, os) => handleStatusChange('SEAT-A1', ns, os)}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick Stats */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
            <h3 className="font-bold text-white mb-3">Statistics</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Monitored:</span>
                <span className="text-white font-semibold">{Object.keys(seatData).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Occupied:</span>
                <span className="text-red-400 font-semibold">
                  {Object.values(seatData).filter(s => s === 'PASSENGER').length}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
            <h3 className="font-bold text-white mb-3 flex items-center gap-2">
              <AlertCircle size={16} />
              Alerts
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {alerts.map(alert => (
                <div key={alert.id} className="text-xs p-2 bg-slate-800 rounded">
                  <p className="font-semibold text-white">{alert.seatId}</p>
                  <p className="text-slate-400">{alert.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COPY & PASTE: Minimal Example
// ============================================================================

// Just need to monitor ONE seat? Use this:

import LiveSeatMonitor from './components/LiveSeatMonitor';

export default function SimplePage() {
  return <LiveSeatMonitor seatId="A-1" />;
}

// That's it! The component handles everything else.
