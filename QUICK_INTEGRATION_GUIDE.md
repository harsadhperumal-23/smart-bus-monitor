# LiveSeatMonitor Component - Quick Integration Guide

## 🎯 TL;DR - Get Started in 5 Minutes

### Step 1: Files Created
- ✅ `src/components/LiveSeatMonitor.jsx` - Single seat monitor
- ✅ `src/components/SeatGridDashboard.jsx` - Multi-seat grid dashboard
- ✅ `LIVE_SEAT_MONITOR_GUIDE.md` - Full documentation

### Step 2: Basic Usage
```jsx
import LiveSeatMonitor from './components/LiveSeatMonitor';

function App() {
  return <LiveSeatMonitor seatId="A-1" />;
}
```

### Step 3: Multi-Seat Usage
```jsx
import SeatGridDashboard from './components/SeatGridDashboard';

function App() {
  return <SeatGridDashboard busId="BUS-001" />;
}
```

---

## 📦 Component Files Overview

### LiveSeatMonitor.jsx
**Single seat real-time monitoring component**

```jsx
<LiveSeatMonitor 
  seatId="A-1"                                    // Seat identifier
  apiUrl="http://127.0.0.1:5000/sensor-data"    // API endpoint
  pollInterval={800}                              // Update frequency (ms)
  onStatusChange={(newStatus, oldStatus) => {    // Status change callback
    console.log(`${oldStatus} → ${newStatus}`);
  }}
/>
```

**Dimensions & Display:**
- Responsive: Mobile (1x), Tablet (2x), Desktop (3x+)
- Min width: 280px, Max width: 400px
- Shows: Emoji, distance (mm/cm), status, history sparkline

**Dependencies:**
- React 16.8+
- framer-motion 10.16+
- TailwindCSS 3+

---

### SeatGridDashboard.jsx
**Complete bus seat monitoring dashboard**

```jsx
<SeatGridDashboard 
  busId="BUS-001"                           // Bus identifier
  backendUrl="http://127.0.0.1:5000"       // Backend base URL
  maxAlerts={10}                            // Maximum alerts to show
/>
```

**Features:**
- 3×4 seat grid (12 seats, customizable)
- Real-time occupancy stats
- Alert feed with timestamps
- Seat selection/details
- Responsive grid layout
- Dark theme with glassmorphism

**Default Layout:**
```
Row A: A-1, A-2, A-3, A-4
Row B: B-1, B-2, B-3, B-4  
Row C: C-1, C-2, C-3, C-4
```

---

## 🚀 Integration Examples

### Example 1: Single Seat Page
```jsx
// pages/SeatDetail.jsx
import React from 'react';
import LiveSeatMonitor from '../components/LiveSeatMonitor';

export default function SeatDetailPage() {
  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Seat Monitoring</h1>
      <div className="max-w-md mx-auto">
        <LiveSeatMonitor seatId="A-1" />
      </div>
    </div>
  );
}
```

### Example 2: Multiple Seats Side-by-Side
```jsx
// pages/QuadSeatMonitor.jsx
import React from 'react';
import LiveSeatMonitor from '../components/LiveSeatMonitor';

export default function QuadSeatMonitor() {
  const seats = ['A-1', 'A-2', 'A-3', 'A-4'];
  
  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Row A Monitoring</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {seats.map(seatId => (
          <LiveSeatMonitor key={seatId} seatId={seatId} />
        ))}
      </div>
    </div>
  );
}
```

### Example 3: Admin Dashboard (Full Grid)
```jsx
// pages/AdminDashboard.jsx
import React from 'react';
import SeatGridDashboard from '../components/SeatGridDashboard';

export default function AdminDashboard() {
  return <SeatGridDashboard busId="BUS-001" />;
}
```

### Example 4: Integration with React Router
```jsx
// App.jsx
import { Routes, Route } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import SeatDetailPage from './pages/SeatDetail';
import QuadSeatMonitor from './pages/QuadSeatMonitor';

export default function App() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/seat/:id" element={<SeatDetailPage />} />
      <Route path="/row/a" element={<QuadSeatMonitor />} />
    </Routes>
  );
}
```

---

## 🔌 API Endpoint Requirements

Your Flask backend must provide this endpoint:

```python
@app.route('/sensor-data/<seat_id>', methods=['GET'])
def get_sensor_data(seat_id):
    """Return current sensor reading for a specific seat"""
    return jsonify({
        "distance": 245,           # Distance in millimeters
        "status": "PASSENGER",     # PASSENGER, LUGGAGE, or EMPTY
        "timestamp": 1746923456    # Optional: Unix timestamp
    })
```

**Response Requirements:**
- HTTP 200 status code on success
- Valid JSON with `distance` and `status` fields
- `distance` must be integer (mm)
- `status` must be one of: `PASSENGER`, `LUGGAGE`, `EMPTY`

**Error Handling:**
- If API fails, component shows error message
- Retries automatically on next poll cycle
- Signal strength indicator shows connection quality

---

## 🎨 Customization Guide

### Change Seat Layout
Edit `SeatGridDashboard.jsx`:
```jsx
const SEAT_LAYOUT = [
  ['A-1', 'A-2', 'A-3', 'A-4', 'A-5', 'A-6'],  // 6 seats per row
  ['B-1', 'B-2', 'B-3', 'B-4', 'B-5', 'B-6'],
  ['C-1', 'C-2', 'C-3', 'C-4', 'C-5', 'C-6'],
];
```

### Add Custom Status Types
Edit `LiveSeatMonitor.jsx` `statusConfig`:
```jsx
const statusConfig = {
  PASSENGER: { /* ... existing ... */ },
  LUGGAGE: { /* ... existing ... */ },
  EMPTY: { /* ... existing ... */ },
  WHEELCHAIR: {  // NEW!
    color: 'from-purple-600 to-purple-800',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/50',
    emoji: '♿',
    label: 'Wheelchair',
    textColor: 'text-purple-500',
    accentColor: 'bg-purple-500',
    lightAccent: 'bg-purple-500/20',
  },
};
```

### Change Color Scheme
Modify TailwindCSS colors in component files:
```jsx
// Change red to blue for PASSENGER
PASSENGER: {
  color: 'from-blue-600 to-blue-800',
  bgColor: 'bg-blue-500/10',
  borderColor: 'border-blue-500/50',
  // ... etc
}
```

### Adjust Polling Interval
```jsx
// Default 800ms
<LiveSeatMonitor pollInterval={500} />  // Faster updates

// Or via SeatGridDashboard (applies to all seats)
<SeatGridDashboard /* gets 800ms by default */ />
```

---

## 📊 Status Flow Diagram

```
                    ┌─────────────────────────┐
                    │   EMPTY (🪑 Green)      │
                    └────────────┬────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │ Person sits             │
                    ▼                         │
         ┌──────────────────────┐  Luggage   │
         │ PASSENGER (🧍 Red)   │  replaces  │
         │                      │  person    │
         │                      ├─────────►  │
         └──────────┬───────────┘            │
                    │                        │
                    │ Puts luggage          │
                    ▼                        │
         ┌──────────────────────┐            │
         │ LUGGAGE (🧳 Orange)  │            │
         └──────────┬───────────┘            │
                    │                        │
                    │ Removes luggage        │
                    │ or person leaves       │
                    ▼                        │
         ┌──────────────────────┐            │
         │ EMPTY (🪑 Green)     │◄──────────┘
         └──────────────────────┘
```

---

## 🔧 Advanced Configuration

### Adding Authentication
```jsx
<LiveSeatMonitor
  seatId="A-1"
  apiUrl="http://api.example.com/sensor-data/A-1"
  pollInterval={800}
  onStatusChange={async (newStatus, oldStatus) => {
    // Emit event to server
    await fetch('http://api.example.com/events', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        seatId: 'A-1',
        oldStatus,
        newStatus,
        timestamp: Date.now()
      })
    });
  }}
/>
```

### Adding Analytics
```jsx
const handleStatusChange = (seatId, newStatus, oldStatus) => {
  // Track occupancy event
  analytics.track('seat_status_change', {
    seatId,
    newStatus,
    oldStatus,
    timestamp: Date.now(),
  });
};

<LiveSeatMonitor 
  seatId="A-1"
  onStatusChange={(ns, os) => handleStatusChange('A-1', ns, os)}
/>
```

### Adding Notifications
```jsx
const handleStatusChange = (seatId, newStatus, oldStatus) => {
  // Notify if seat becomes occupied
  if (oldStatus === 'EMPTY' && newStatus === 'PASSENGER') {
    new Notification(`Seat ${seatId} is now occupied!`);
  }
};

<LiveSeatMonitor 
  seatId="A-1"
  onStatusChange={(ns, os) => handleStatusChange('A-1', ns, os)}
/>
```

---

## 🚨 Common Issues & Solutions

### Issue: "Connection Error" appears
**Solution:**
1. Check Flask backend is running: `python backend/server.js`
2. Verify API URL is correct
3. Check CORS headers are set if cross-origin
4. Ensure backend returns valid JSON

### Issue: Component shows loading forever
**Solution:**
1. Check network tab in browser DevTools
2. Verify API endpoint exists and responds
3. Check response format (must have `distance` and `status`)
4. Look at backend logs for errors

### Issue: Animations are choppy
**Solution:**
1. Check TailwindCSS is configured with JIT
2. Enable GPU acceleration in browser
3. Reduce number of seats if on low-end device
4. Increase polling interval (800ms → 1000ms)

### Issue: API timeout errors
**Solution:**
1. Increase client timeout settings
2. Optimize backend response time
3. Add connection pooling on backend
4. Use CDN/cache for static data

---

## 📈 Performance Tips

### 1. For Single Seat
- Use 800ms polling (default)
- Component is lightweight
- < 50KB bundle size

### 2. For Multi-Seat (4+ seats)
- Keep polling at 800ms
- Use virtualization if > 20 seats
- Memoize callbacks

### 3. For Full Dashboard (12+ seats)
- Consider server-side aggregation
- Use WebSocket instead of polling
- Implement data compression
- Add request deduplication

### 4. Production Deployment
```jsx
// Use environment variables
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const POLL_INTERVAL = process.env.REACT_APP_POLL_INTERVAL || 800;

<LiveSeatMonitor 
  apiUrl={API_URL}
  pollInterval={POLL_INTERVAL}
/>
```

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] Single seat loads without errors
- [ ] Status changes animate smoothly
- [ ] Distance updates in real-time
- [ ] Sparkline bars fill/update
- [ ] Signal strength decreases on error
- [ ] Error message appears if API down
- [ ] Mobile view is responsive
- [ ] Dark theme looks good
- [ ] Callbacks fire on status change
- [ ] History tracks last 10 readings

### Simulating Different Statuses
Update your Flask endpoint to return different statuses:
```python
@app.route('/sensor-data/<seat_id>', methods=['GET'])
def get_sensor_data(seat_id):
    # Simulate different statuses
    import random
    return jsonify({
        "distance": random.randint(100, 500),
        "status": random.choice(['PASSENGER', 'LUGGAGE', 'EMPTY'])
    })
```

---

## 📝 Component Props Reference

### LiveSeatMonitor Props
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `seatId` | string | `'SEAT-001'` | Unique identifier for seat |
| `apiUrl` | string | `'http://127.0.0.1:5000/sensor-data'` | Backend API endpoint |
| `pollInterval` | number | `800` | Polling frequency in ms |
| `onStatusChange` | function | `null` | Callback: `(newStatus, oldStatus) => {}` |

### SeatGridDashboard Props
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `busId` | string | `'BUS-001'` | Bus identifier for display |
| `backendUrl` | string | `'http://127.0.0.1:5000'` | Base backend URL |
| `maxAlerts` | number | `10` | Max alerts in feed |

---

## 🎓 Next Steps

1. **Test Single Component**
   ```jsx
   import LiveSeatMonitor from './components/LiveSeatMonitor';
   export default () => <LiveSeatMonitor seatId="A-1" />;
   ```

2. **Deploy to Dashboard**
   - Add to your admin page
   - Integrate with existing layout
   - Test with real sensor data

3. **Monitor Analytics**
   - Track seat occupancy patterns
   - Generate reports
   - Set up alerts

4. **Scale to Fleet**
   - Deploy on multiple buses
   - Aggregate data across fleet
   - Build comparative dashboards

---

## 📚 Files Reference

| File | Purpose | Size |
|------|---------|------|
| `LiveSeatMonitor.jsx` | Core component | ~8 KB |
| `SeatGridDashboard.jsx` | Grid/dashboard | ~7 KB |
| `LIVE_SEAT_MONITOR_GUIDE.md` | Full docs | Reference |
| `QUICK_INTEGRATION_GUIDE.md` | This file | Quick ref |

---

## 💡 Pro Tips

✅ **Use consistent seat IDs** across your system (A-1, A-2, etc.)
✅ **Keep API responses fast** (< 100ms for smooth UX)
✅ **Monitor signal strength** to detect connection issues early
✅ **Store history** server-side for trend analysis
✅ **Use callbacks** for real-time notifications
✅ **Test mobile** - components are fully responsive
✅ **Cache results** to reduce server load
✅ **Handle offline** gracefully with fallback UI

---

## 🤝 Support

For issues or questions:
1. Check the full guide: [LIVE_SEAT_MONITOR_GUIDE.md](./LIVE_SEAT_MONITOR_GUIDE.md)
2. Review component props above
3. Check browser console for errors
4. Verify API endpoint format
5. Check backend logs

---

**Last Updated:** May 2026  
**Version:** 1.0.0  
**Status:** Production Ready ✅
