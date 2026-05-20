# LiveSeatMonitor Component - Complete Integration Guide

## 📋 Overview

The **LiveSeatMonitor** is a production-ready React component for real-time IoT seat monitoring. It displays sensor data with beautiful glassmorphism design, smooth animations, and comprehensive metrics.

### ✨ Key Features

- ✅ **Real-time Polling** - Configurable 800ms polling interval
- ✅ **Glassmorphism Design** - Modern UI with backdrop blur and gradients
- ✅ **Smooth Animations** - Framer Motion transitions for all state changes
- ✅ **Dual Distance Display** - Shows both mm and cm
- ✅ **History Sparkline** - Last 10 readings visualized as bars
- ✅ **Multi-seat Ready** - Reusable with Seat ID support
- ✅ **Signal Strength** - 4-bar signal indicator
- ✅ **Status Callbacks** - Emit events on status changes
- ✅ **Error Handling** - Graceful error states and retry logic
- ✅ **Responsive** - Mobile, tablet, and desktop optimized
- ✅ **Accessible** - ARIA labels and semantic HTML
- ✅ **Dark Theme** - Professional IoT dashboard aesthetic

---

## 🚀 Quick Start

### 1. **Basic Usage**

```jsx
import LiveSeatMonitor from './components/LiveSeatMonitor';

export default function SeatPage() {
  return (
    <div className="p-6 bg-slate-950">
      <LiveSeatMonitor seatId="A-1" />
    </div>
  );
}
```

### 2. **With Custom API Endpoint**

```jsx
<LiveSeatMonitor 
  seatId="SEAT-001"
  apiUrl="http://api.example.com/sensors/seat-1"
/>
```

### 3. **With Status Change Callback**

```jsx
<LiveSeatMonitor
  seatId="B-5"
  onStatusChange={(newStatus, oldStatus) => {
    console.log(`Status changed from ${oldStatus} to ${newStatus}`);
    // Trigger notifications, analytics, etc.
  }}
/>
```

### 4. **Custom Polling Interval**

```jsx
<LiveSeatMonitor
  seatId="SEAT-002"
  pollInterval={500}  // Poll every 500ms instead of 800ms
/>
```

---

## 📌 Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `seatId` | `string` | `'SEAT-001'` | Unique seat identifier |
| `apiUrl` | `string` | `'http://127.0.0.1:5000/sensor-data'` | Backend API endpoint |
| `pollInterval` | `number` | `800` | Polling interval in milliseconds |
| `onStatusChange` | `function` | `null` | Callback when status changes: `(newStatus, oldStatus) => {}` |

---

## 🎨 Expected API Response Format

Your Flask backend should return JSON in this format:

```json
{
  "distance": 245,
  "status": "PASSENGER",
  "timestamp": 1746923456
}
```

**Status Values:** `PASSENGER`, `LUGGAGE`, `EMPTY`, or any custom value  
**Distance:** Integer in millimeters (mm)  
**Timestamp:** Unix timestamp (optional)

---

## 🖼️ Status Colors & Emojis

| Status | Color | Emoji | Use Case |
|--------|-------|-------|----------|
| **PASSENGER** | Red | 🧍 | Occupied by person |
| **LUGGAGE** | Amber/Orange | 🧳 | Luggage/cargo detected |
| **EMPTY** | Emerald/Green | 🪑 | No occupancy |
| **UNKNOWN** | Slate/Gray | ❓ | Invalid/error state |

---

## 📱 Integration Examples

### Example 1: Single Seat Monitoring Page

```jsx
import React from 'react';
import LiveSeatMonitor from './components/LiveSeatMonitor';

export default function SingleSeatPage() {
  const handleStatusChange = (newStatus, oldStatus) => {
    // Send alert to admin if EMPTY to PASSENGER
    if (oldStatus === 'EMPTY' && newStatus === 'PASSENGER') {
      console.log('📢 Seat just became occupied!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-md mx-auto">
        <LiveSeatMonitor
          seatId="A-1"
          onStatusChange={handleStatusChange}
        />
      </div>
    </div>
  );
}
```

### Example 2: Multi-Seat Grid Dashboard

```jsx
import React, { useState } from 'react';
import LiveSeatMonitor from './components/LiveSeatMonitor';

export default function SeatGridDashboard() {
  const [seatStatuses, setSeatStatuses] = useState({});

  const SEAT_LAYOUT = [
    ['A-1', 'A-2', 'A-3', 'A-4'],
    ['B-1', 'B-2', 'B-3', 'B-4'],
    ['C-1', 'C-2', 'C-3', 'C-4'],
  ];

  const handleSeatStatusChange = (seatId, newStatus, oldStatus) => {
    setSeatStatuses(prev => ({
      ...prev,
      [seatId]: newStatus
    }));

    // Emit analytics event
    console.log(`Seat ${seatId}: ${oldStatus} → ${newStatus}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <h1 className="text-4xl font-bold text-white mb-12">Bus Seat Monitoring</h1>

      <div className="space-y-8">
        {SEAT_LAYOUT.map((row, rowIdx) => (
          <div key={rowIdx} className="grid grid-cols-4 gap-4">
            {row.map(seatId => (
              <div key={seatId} className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                <LiveSeatMonitor
                  seatId={seatId}
                  apiUrl={`http://127.0.0.1:5000/sensor-data/${seatId}`}
                  onStatusChange={(newStatus, oldStatus) =>
                    handleSeatStatusChange(seatId, newStatus, oldStatus)
                  }
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-12 grid grid-cols-3 gap-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-500 font-bold text-2xl">
            {Object.values(seatStatuses).filter(s => s === 'PASSENGER').length}
          </p>
          <p className="text-red-400 text-sm">Occupied</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
          <p className="text-amber-500 font-bold text-2xl">
            {Object.values(seatStatuses).filter(s => s === 'LUGGAGE').length}
          </p>
          <p className="text-amber-400 text-sm">Luggage</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
          <p className="text-emerald-500 font-bold text-2xl">
            {Object.values(seatStatuses).filter(s => s === 'EMPTY').length}
          </p>
          <p className="text-emerald-400 text-sm">Empty</p>
        </div>
      </div>
    </div>
  );
}
```

### Example 3: Admin Dashboard Integration

```jsx
import React, { useState, useCallback } from 'react';
import LiveSeatMonitor from './components/LiveSeatMonitor';
import { AlertCircle, TrendingUp } from 'lucide-react';

export default function AdminSeatMonitoring() {
  const [alerts, setAlerts] = useState([]);
  const [seatMetrics, setSeatMetrics] = useState({});

  const SEATS = Array.from({ length: 12 }, (_, i) => {
    const row = String.fromCharCode(65 + Math.floor(i / 4)); // A, B, C
    const col = (i % 4) + 1;
    return `${row}-${col}`;
  });

  const handleStatusChange = useCallback((seatId, newStatus, oldStatus) => {
    // Create alert for important state changes
    if (oldStatus !== 'EMPTY' && newStatus === 'EMPTY') {
      setAlerts(prev => [{
        id: Date.now(),
        seatId,
        message: `Seat ${seatId} is now empty`,
        timestamp: new Date(),
      }, ...prev].slice(0, 5));
    }

    // Track metrics
    setSeatMetrics(prev => ({
      ...prev,
      [seatId]: { status: newStatus, lastChange: new Date() }
    }));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Bus Seat Monitoring</h1>
        <p className="text-slate-400">Real-time occupancy tracking for all seats</p>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Main Grid */}
        <div className="col-span-2">
          <div className="grid grid-cols-4 gap-3 bg-slate-900/30 p-6 rounded-xl border border-slate-700">
            {SEATS.map(seatId => (
              <div key={seatId} className="aspect-square">
                <LiveSeatMonitor
                  seatId={seatId}
                  apiUrl={`http://127.0.0.1:5000/sensor-data/${seatId}`}
                  pollInterval={800}
                  onStatusChange={(newStatus, oldStatus) =>
                    handleStatusChange(seatId, newStatus, oldStatus)
                  }
                />
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar - Recent Alerts */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <AlertCircle size={20} />
              Recent Events
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {alerts.length === 0 ? (
                <p className="text-slate-500 text-sm">No recent events</p>
              ) : (
                alerts.map(alert => (
                  <div
                    key={alert.id}
                    className="bg-slate-800/50 border-l-2 border-yellow-500 p-3 rounded text-sm"
                  >
                    <p className="font-semibold text-white">{alert.seatId}</p>
                    <p className="text-slate-400">{alert.message}</p>
                    <p className="text-xs text-slate-500">
                      {alert.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp size={20} />
              Summary
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Seats:</span>
                <span className="text-white font-semibold">{SEATS.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Monitored:</span>
                <span className="text-white font-semibold">
                  {Object.keys(seatMetrics).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Occupied:</span>
                <span className="text-red-500 font-semibold">
                  {Object.values(seatMetrics).filter(s => s.status === 'PASSENGER').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 🔧 Component Architecture

### State Management
- `currentData` - Latest sensor reading
- `history` - Last 10 distance readings for sparkline
- `loading` - Initial loading state
- `error` - Error messages
- `isLive` - Pulse animation trigger
- `signalStrength` - 0-100 signal quality

### Key Functions
- `fetchSensorData()` - API call with validation
- `formatDistance()` - Converts mm to mm/cm display
- `formatTime()` - Formats timestamp

### Animation Triggers
- Status emoji spins on change
- Distance scales in/out
- Live indicator pulses
- Bars animate into sparkline
- Cards fade in smoothly

---

## 🎯 Tips for Best Results

### 1. **API Endpoint Design**
Keep responses minimal for best performance:
```json
{
  "distance": 245,
  "status": "PASSENGER"
}
```

### 2. **Polling Interval**
- **800ms (default)** - Good balance for most sensors
- **500ms** - More responsive, higher server load
- **1000ms+** - Reduced load, less responsive

### 3. **Multi-Seat Deployments**
Pass different API endpoints per seat:
```jsx
<LiveSeatMonitor
  seatId={`${row}-${col}`}
  apiUrl={`/api/sensors/${busId}/seats/${seatId}`}
/>
```

### 4. **Error Handling**
Component handles errors gracefully, but ensure:
- Backend returns proper HTTP status codes
- CORS headers are set if cross-origin
- API timeouts are reasonable (< 500ms)

### 5. **Performance**
- Sparkline updates smoothly with max 10 readings
- Animations are GPU-accelerated
- History doesn't cause memory leaks
- Re-renders optimized with `useCallback`

---

## 📊 Expected Behavior

### Status Change Sequence
```
EMPTY → 🪑 (Green)
  ↓ (person sits)
PASSENGER → 🧍 (Red)
  ↓ (person puts bag)
LUGGAGE → 🧳 (Orange)
  ↓ (person leaves)
EMPTY → 🪑 (Green)
```

### Visual Feedback
- 🟢 Live indicator pulses when data updates
- 📊 Sparkline bars animate as new readings arrive
- 📈 Signal strength drops if API fails
- ⚠️ Error card appears with helpful message

---

## 🐛 Troubleshooting

### Component shows "Connecting to sensor..."
- **Check:** Flask backend is running
- **Check:** API URL is correct
- **Check:** CORS is configured (if different origin)
- **Check:** Network connectivity

### "Connection Error" displays
- Check backend logs for errors
- Verify API response format matches schema
- Ensure `distance` and `status` fields exist
- Check response is valid JSON

### Signal strength decreasing
- Indicates API calls are failing
- Recovers when connection restored
- Each failed call reduces by 10%

### Animations feel janky
- Ensure TailwindCSS is properly configured
- Check browser hardware acceleration enabled
- Reduce poll interval if too aggressive
- Profile in browser DevTools

---

## 🚀 Production Checklist

- [ ] Backend API is containerized and scalable
- [ ] Error handling includes retry logic
- [ ] Rate limiting is configured on backend
- [ ] CORS headers are properly set
- [ ] API response time < 500ms
- [ ] Multiple seats tested simultaneously
- [ ] Mobile responsiveness verified
- [ ] Accessibility tested (keyboard, screen reader)
- [ ] Performance monitored (FPS, memory)
- [ ] Analytics integrated for metrics
- [ ] Fallback UI for offline mode
- [ ] Documentation updated for team

---

## 📚 Related Components

- **SeatGrid** - Display multiple seats in grid layout
- **AdminDashboard** - Centralized monitoring
- **AlertSystem** - Notification management
- **Analytics** - Historical data and trends

---

## 📝 Notes

- Component is fully functional standalone
- Can be used in dev/test/prod environments
- Does not rely on external state management
- All styles use TailwindCSS (no CSS files needed)
- Animations powered by Framer Motion
- TypeScript definitions can be added if needed

---

**Version:** 1.0.0  
**Last Updated:** May 2026  
**License:** MIT
