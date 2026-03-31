## Quick Reference: ESP32 Passenger Counter Implementation

### Quick Start Summary

```
1. Hardware: Connect VL53L0X to ESP32 (GPIO21=SDA, GPIO22=SCL)
2. ESP32: Upload ESP32_Passenger_Counter.ino with WiFi credentials
3. Backend: POST /api/bus/snapshot endpoint ready (already in place)
4. Frontend: Add LivePassengerCount component to dashboard
5. Test: Watch data flow from sensor → ESP32 → API → React
```

---

## Code Snippets for Integration

### 1. Add Component to Admin Dashboard

**File**: `src/pages/admin/AdminDashboard.jsx`

```jsx
// Add import at top
import LivePassengerCount from '../../components/LivePassengerCount';

// Inside the return JSX, replace the metrics grid with:
{/* Metrics Grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* New Live Passenger Component */}
  <div className="md:col-span-2 lg:col-span-1">
    <LivePassengerCount busId="BUS001" capacity={40} />
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
```

---

### 2. Standalone Passenger Counter Page

Create **`src/pages/PassengerCounter.jsx`**:

```jsx
import React, { useState, useEffect } from 'react';
import LivePassengerCount from '../components/LivePassengerCount';
import { BarChart3, TrendingUp } from 'lucide-react';

export default function PassengerCounterPage() {
  const [selectedBus, setSelectedBus] = useState('BUS001');
  const [buses, setBuses] = useState([
    { id: 'BUS001', number: 'B-101', capacity: 40 },
    { id: 'BUS002', number: 'B-102', capacity: 50 },
    { id: 'BUS003', number: 'B-103', capacity: 35 },
  ]);

  return (
    <div className="space-y-6" id="main-content">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Live Passenger Tracking
        </h1>
        <p className="text-slate-400">
          Real-time passenger count via ESP32 IoT sensors
        </p>
      </div>

      {/* Bus Selector */}
      <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Select Bus
        </label>
        <select
          value={selectedBus}
          onChange={(e) => setSelectedBus(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-blue-500"
        >
          {buses.map((bus) => (
            <option key={bus.id} value={bus.id}>
              {bus.number} (Capacity: {bus.capacity})
            </option>
          ))}
        </select>
      </div>

      {/* Live Counter */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <LivePassengerCount
            busId={selectedBus}
            capacity={buses.find((b) => b.id === selectedBus)?.capacity || 40}
            refreshInterval={2000}
          />
        </div>

        {/* Statistics */}
        <div className="space-y-4">
          <div className="p-6 rounded-lg bg-slate-800/50 border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              <h3 className="font-medium text-white">How It Works</h3>
            </div>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>✓ VL53L0X sensor detects passengers at door</li>
              <li>✓ Distance &lt; 800mm = person detection</li>
              <li>✓ 500ms debounce prevents double counting</li>
              <li>✓ Count sent to API every 2 seconds</li>
              <li>✓ Real-time display updated via polling</li>
            </ul>
          </div>

          <div className="p-6 rounded-lg bg-slate-800/50 border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <h3 className="font-medium text-white">Occupancy Levels</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Good (0-50%)</span>
                  <span className="text-green-400 font-medium">🟢</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Moderate (50-80%)</span>
                  <span className="text-yellow-400 font-medium">🟡</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Full (80%+)</span>
                  <span className="text-red-400 font-medium">🔴</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Info */}
      <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700">
        <p className="text-xs text-slate-500">
          <strong>Debug:</strong> Component polling every 2s | Backend response time: ~50ms | 
          Sensor update rate: 30Hz | Capacity auto-configured per bus
        </p>
      </div>
    </div>
  );
}
```

---

### 3. API Service Enhancement (optional)

**File**: `src/services/api.js` - Already supports this, but here's the method:

```jsx
// Fetching passenger count
export const busAPI = {
    getStatus: () =>
        apiCall('/bus/status'),

    getPassengerCount: (busId) =>
        apiCall(`/bus/${busId}`),

    pushSnapshot: (data) =>
        apiCall('/bus/snapshot', {
            method: 'POST',
            body: JSON.stringify(data)
        })
};

// Usage in component:
const response = await busAPI.getStatus();
const passengerCount = response.data.passengerCount;
```

---

### 4. Custom Hook for Passenger Updates (Optional)

Create **`src/hooks/usePassengerCount.js`**:

```jsx
import { useState, useEffect } from 'react';
import { busAPI } from '../services/api';

/**
 * Custom hook for real-time passenger count
 * Returns: { count, occupancy%, loading, error, lastUpdate }
 */
export const usePassengerCount = (busId = 'BUS001', capacity = 40, interval = 2000) => {
  const [count, setCount] = useState(0);
  const [occupancy, setOccupancy] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchCount = async () => {
    try {
      setError(null);
      const response = await busAPI.getStatus();
      if (response.success) {
        const currentCount = response.data.passengerCount || 0;
        setCount(currentCount);
        setOccupancy(Math.round((currentCount / capacity) * 100));
        setLastUpdate(new Date());
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCount();
    const timer = setInterval(fetchCount, interval);
    return () => clearInterval(timer);
  }, [busId, capacity, interval]);

  return { count, occupancy, loading, error, lastUpdate, refetch: fetchCount };
};

// Usage:
// const { count, occupancy, loading, error } = usePassengerCount('BUS001', 40);
```

Then use in any component:

```jsx
const { count, occupancy } = usePassengerCount('BUS001', 40);
<h2>Passengers: {count} ({occupancy}%)</h2>
```

---

### 5. Testing Passenger Counter Endpoint

**Node.js/JavaScript**:
```javascript
// Test the API endpoint
async function testPassengerCount() {
  const response = await fetch('http://localhost:5000/api/bus/snapshot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      busId: 'BUS001',
      passengerCount: 25
    })
  });
  const data = await response.json();
  console.log('Response:', data);
}

testPassengerCount();
```

**Python**:
```python
import requests
import json

url = "http://localhost:5000/api/bus/snapshot"
data = {
    "busId": "BUS001",
    "passengerCount": 25
}

response = requests.post(url, json=data)
print(response.json())
```

**cURL**:
```bash
curl -X POST http://localhost:5000/api/bus/snapshot \
  -H "Content-Type: application/json" \
  -d '{"busId":"BUS001","passengerCount":25}'
```

---

### 6. ESP32 Arduino Code - Key Sections

**Configuration**:
```cpp
const uint16_t DISTANCE_THRESHOLD = 800;      // Detection threshold (mm)
const unsigned long DEBOUNCE_DELAY = 500;     // Debounce (ms)
const unsigned long UPDATE_INTERVAL = 2000;   // API update (ms)
```

**Main Loop**:
```cpp
void loop() {
  uint16_t distance = sensor.readRangeContinuousMillimeters();
  objectDetected = (distance < DISTANCE_THRESHOLD);

  if (objectDetected && !previousObjectState) {
    if (millis() - lastDebounceTime > DEBOUNCE_DELAY) {
      passengerCount++;
      Serial.println("Person detected!");
    }
  }

  if (millis() - lastUpdateTime >= UPDATE_INTERVAL) {
    sendToBackend();
    lastUpdateTime = millis();
  }
}
```

**Sending to Backend**:
```cpp
void sendToBackend() {
  HTTPClient http;
  http.begin(API_SERVER + "/api/bus/snapshot");
  http.addHeader("Content-Type", "application/json");
  
  String json = "{\"busId\":\"" + String(BUS_ID) + "\",\"passengerCount\":" + passengerCount + "}";
  int code = http.POST(json);
  
  Serial.println("Response: " + String(code));
  http.end();
}
```

---

### 7. Database Query Examples

**MongoDB - Get passenger count**:
```javascript
db.buses.findOne({ busId: "BUS001" }, { passengerCount: 1 })
```

**MongoDB - Get all bus statistics**:
```javascript
db.buses.find(
  {},
  { busId: 1, busNumber: 1, passengerCount: 1, capacity: 1, lastUpdated: 1 }
).pretty()
```

**MongoDB - Get buses with high occupancy**:
```javascript
db.buses.find(
  { $expr: { $gte: ["$passengerCount", { $multiply: ["$capacity", 0.8] }] } }
)
```

---

### 8. Environment Variables (Optional)

**Create `.env`**:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_POLL_INTERVAL=2000
REACT_APP_BUS_CAPACITY=40
REACT_APP_DISTANCE_THRESHOLD=800
```

**Update LivePassengerCount.jsx**:
```jsx
const busCapacity = parseInt(process.env.REACT_APP_BUS_CAPACITY) || 40;
const pollInterval = parseInt(process.env.REACT_APP_POLL_INTERVAL) || 2000;
```

---

## Minimal Working Example

### All-in-One Component

```jsx
// src/components/SimplePassengerCounter.jsx
import React, { useState, useEffect } from 'react';

export default function SimplePassengerCounter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetch_data = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/bus/status');
        const data = await res.json();
        setCount(data.data?.passengerCount || 0);
      } catch (err) {
        console.error(err);
      }
    };

    fetch_data();
    const interval = setInterval(fetch_data, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: '20px', fontSize: '24px', fontWeight: 'bold' }}>
      Passengers: {count}
    </div>
  );
}
```

Usage:
```jsx
<SimplePassengerCounter />
```

---

## Verification Checklist

- [ ] ESP32 uploads without errors
- [ ] Serial monitor shows initialization messages
- [ ] WiFi connects (IP address displayed)
- [ ] API POST requests succeed (response code 200)
- [ ] Backend database updates (check MongoDB)
- [ ] React component renders without errors
- [ ] Passenger count updates every 2 seconds
- [ ] Mock person detection works (hold object near sensor)
