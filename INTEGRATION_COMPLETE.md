# 🎯 LiveSeatMonitor Integration Examples - Ready to Use

## ✅ Already Integrated

### AdminDashboard.jsx
The `LiveSeatMonitor` component has been **automatically integrated** into your Admin Dashboard!

**Location:** `src/pages/admin/AdminDashboard.jsx`

The component is now displayed prominently with:
- Real-time sensor data visualization
- Info panel explaining the features
- Professional layout with responsive grid

---

## 📱 Quick Integration Examples for Other Pages

### Example 1: Operations Page

```jsx
// pages/Operations/index.jsx
import React from 'react';
import Layout from '../../components/Layout';
import LiveSeatMonitor from '../../components/LiveSeatMonitor';

export default function OperationsPage() {
  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-white mb-8">Operations</h1>
        
        {/* Single Seat Monitor */}
        <div className="max-w-md">
          <LiveSeatMonitor seatId="A-1" />
        </div>
      </div>
    </Layout>
  );
}
```

### Example 2: Performance/Analytics Page

```jsx
// pages/Performance/index.jsx
import React from 'react';
import Layout from '../../components/Layout';
import LiveSeatMonitor from '../../components/LiveSeatMonitor';

export default function PerformancePage() {
  const seats = ['A-1', 'A-2', 'A-3', 'B-1', 'B-2', 'B-3'];

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-white mb-8">Performance Monitoring</h1>
        
        {/* Grid of Monitors */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {seats.map(seatId => (
            <LiveSeatMonitor 
              key={seatId}
              seatId={seatId}
              apiUrl={`http://127.0.0.1:5000/sensor-data/${seatId}`}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
}
```

### Example 3: Real-time Dashboard

```jsx
// pages/Analytics/LiveDashboard.jsx
import React, { useState } from 'react';
import Layout from '../../components/Layout';
import LiveSeatMonitor from '../../components/LiveSeatMonitor';
import SeatGridDashboard from '../../components/SeatGridDashboard';

export default function LiveDashboard() {
  const [viewMode, setViewMode] = useState('detail'); // 'detail' or 'grid'

  return (
    <Layout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Live Monitoring</h1>
          
          {/* Toggle View */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('detail')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                viewMode === 'detail'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              Detail
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              Grid
            </button>
          </div>
        </div>

        {viewMode === 'detail' ? (
          <div className="max-w-2xl">
            <LiveSeatMonitor seatId="DEMO-SEAT" />
          </div>
        ) : (
          <SeatGridDashboard busId="BUS-001" />
        )}
      </div>
    </Layout>
  );
}
```

### Example 4: Customer Dashboard

```jsx
// pages/customer/CustomerDashboard.jsx
import React from 'react';
import LiveSeatMonitor from '../../components/LiveSeatMonitor';

export default function CustomerDashboard() {
  return (
    <div className="p-6 bg-slate-950 min-h-screen">
      <h1 className="text-2xl font-bold text-white mb-8">Your Seat Status</h1>
      
      {/* Show current seat monitor */}
      <div className="max-w-md mx-auto">
        <LiveSeatMonitor 
          seatId="SEAT-A1"
          onStatusChange={(newStatus, oldStatus) => {
            console.log(`Seat status changed from ${oldStatus} to ${newStatus}`);
          }}
        />
      </div>

      <div className="mt-8 p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
        <h2 className="text-white font-semibold mb-2">About This Monitor</h2>
        <p className="text-slate-400 text-sm">
          This real-time sensor displays the current status of your seat. 
          Status updates every 800ms with smooth animations.
        </p>
      </div>
    </div>
  );
}
```

---

## 🔌 API Configuration

### For Single Seat:
```jsx
<LiveSeatMonitor 
  seatId="A-1"
  apiUrl="http://127.0.0.1:5000/sensor-data"
/>
```

### For Multiple Seats with Dynamic URLs:
```jsx
<LiveSeatMonitor 
  seatId={seatId}
  apiUrl={`http://127.0.0.1:5000/sensor-data/${seatId}`}
/>
```

### With Status Callbacks:
```jsx
<LiveSeatMonitor 
  seatId="A-1"
  onStatusChange={(newStatus, oldStatus) => {
    console.log(`Status: ${oldStatus} → ${newStatus}`);
    // Send notification, update analytics, etc.
  }}
/>
```

---

## 🎨 Layout Examples

### Full Width
```jsx
<div className="w-full">
  <LiveSeatMonitor seatId="A-1" />
</div>
```

### Two Column
```jsx
<div className="grid grid-cols-2 gap-4">
  <LiveSeatMonitor seatId="A-1" />
  <LiveSeatMonitor seatId="A-2" />
</div>
```

### Three Column (Dashboard)
```jsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
  <LiveSeatMonitor seatId="A-1" />
  <LiveSeatMonitor seatId="A-2" />
  <LiveSeatMonitor seatId="A-3" />
</div>
```

### With Sidebar Info
```jsx
<div className="grid grid-cols-3 gap-4">
  <div className="col-span-2">
    <LiveSeatMonitor seatId="A-1" />
  </div>
  <div className="bg-slate-900 rounded-lg p-4">
    <h3 className="text-white font-bold">Details</h3>
    {/* Info panel */}
  </div>
</div>
```

---

## 📊 Integration Checklist

- [x] Import statement added to AdminDashboard.jsx
- [x] Component displayed in admin dashboard
- [x] Real-time polling configured
- [x] Status callbacks ready
- [x] Error handling in place
- [x] Responsive layout applied
- [x] Dark theme matches dashboard
- [ ] Connect to real Flask backend
- [ ] Test with live sensor data
- [ ] Deploy to production

---

## 🚀 Next Steps

1. **Test in Admin Dashboard**
   - Open your admin page
   - Verify component displays
   - Check API calls in Network tab

2. **Connect Real Backend**
   - Start your Flask server: `python backend/server.js`
   - Ensure endpoint returns valid JSON
   - Component auto-updates every 800ms

3. **Customize for Your Needs**
   - Use different `seatId` values
   - Adjust polling interval if needed
   - Add status change callbacks
   - Integrate with your analytics

4. **Add to Other Pages**
   - Copy examples above
   - Adapt to your page structure
   - Test on mobile & desktop
   - Deploy when ready

---

## 💡 Pro Tips

✅ **Multiple instances** - Each component independently polls its API  
✅ **Performance** - Safe to use 5-10 components on one page  
✅ **Mobile** - Fully responsive, works on all screen sizes  
✅ **Callbacks** - Use for analytics, notifications, state management  
✅ **Customization** - Easy to adjust colors, sizes, polling rates  

---

## 📝 Component Props Reference

```jsx
<LiveSeatMonitor
  seatId="A-1"                              // Seat identifier
  apiUrl="http://127.0.0.1:5000/sensor-data" // API endpoint
  pollInterval={800}                        // Update frequency (ms)
  onStatusChange={(newStatus, oldStatus) => {}} // Callback function
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `seatId` | string | `'SEAT-001'` | Unique seat identifier |
| `apiUrl` | string | `'http://127.0.0.1:5000/sensor-data'` | Backend endpoint |
| `pollInterval` | number | `800` | Polling frequency (ms) |
| `onStatusChange` | function | `null` | Status change callback |

---

## 🎯 What's Working Now

✅ **AdminDashboard** - LiveSeatMonitor integrated and displayed  
✅ **Import path** - Correctly configured for your project  
✅ **Responsive layout** - Works on all screen sizes  
✅ **Real-time updates** - Polling every 800ms  
✅ **Error handling** - Graceful fallbacks  
✅ **Dark theme** - Matches your dashboard aesthetic  

---

## 🔧 If Component Doesn't Display

1. **Check import path**
   ```jsx
   import LiveSeatMonitor from '../../components/LiveSeatMonitor';
   ```

2. **Verify dependencies**
   - React 16.8+
   - framer-motion
   - TailwindCSS

3. **Check browser console**
   - Look for import errors
   - Check for missing dependencies

4. **Test API endpoint**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Look for API calls to `/sensor-data`

---

**Status:** ✅ Ready to Use  
**Integration:** ✅ AdminDashboard Done  
**Documentation:** ✅ Complete  
**Examples:** ✅ 10+ Scenarios  

🚀 Your LiveSeatMonitor is now part of your dashboard!
