// Mock Data Service - Centralized data generation and polling logic

// GPS Route: Kochi to Bengaluru (simplified waypoints)
export const busRoute = [
    [9.9312, 76.2673], // Kochi
    [10.1632, 76.6413], // Thrissur
    [10.5276, 76.2144], // Palakkad
    [11.0168, 76.9558], // Coimbatore
    [11.3410, 77.7172], // Salem
    [11.6643, 78.1460], // Dharmapuri
    [12.2958, 78.1594], // Hosur
    [12.9716, 77.5946], // Bengaluru
];

// ── MULTI-BUS FLEET DATA ──────────────────────────────────────────────────
// Three buses at different positions along the route with distinct statuses.
const FLEET_ROUTE_OFFSETS = [0, 3, 6]; // index into busRoute for each bus

export const MULTI_BUS_DATA = [
    {
        busId: 'BUS-001',
        route: 'Kochi Express',
        routeCode: 'R-42',
        status: 'online',           // green
        gpsLocation: { lat: busRoute[0][0], lng: busRoute[0][1] },
        passengers: 28,
        capacity: 40,
        speed: 62,                  // km/h
        heading: 45,
        driver: { name: 'Ravi Kumar', id: 'DRV-01' },
        nextStop: 'Thrissur',
        eta: '10:45 AM',
        lastUpdated: new Date().toISOString(),
        alerts: [],
        routeIndex: 0,
    },
    {
        busId: 'BUS-002',
        route: 'Coimbatore Link',
        routeCode: 'R-17',
        status: 'warning',          // amber
        gpsLocation: { lat: busRoute[3][0], lng: busRoute[3][1] },
        passengers: 36,
        capacity: 40,
        speed: 38,
        heading: 30,
        driver: { name: 'Anitha Devi', id: 'DRV-02' },
        nextStop: 'Salem',
        eta: '11:30 AM',
        lastUpdated: new Date().toISOString(),
        alerts: [{ id: 1, type: 'luggage', severity: 'warning', message: 'Luggage on Seat 12', timestamp: new Date().toLocaleTimeString() }],
        routeIndex: 3,
    },
    {
        busId: 'BUS-003',
        route: 'Bengaluru Fast',
        routeCode: 'R-09',
        status: 'offline',          // red
        gpsLocation: { lat: busRoute[6][0], lng: busRoute[6][1] },
        passengers: 12,
        capacity: 40,
        speed: 0,
        heading: 0,
        driver: { name: 'Suresh Babu', id: 'DRV-03' },
        nextStop: 'Bengaluru',
        eta: '12:15 PM',
        lastUpdated: new Date(Date.now() - 120000).toISOString(), // 2 mins ago
        alerts: [{ id: 2, type: 'critical', severity: 'critical', message: 'Connection Lost', timestamp: new Date().toLocaleTimeString() }],
        routeIndex: 6,
    },
];

// Helper – returns a fresh copy of MULTI_BUS_DATA with slightly randomised
// passengers/speed so live-polling feels alive.
export function getFleetSnapshot() {
    return MULTI_BUS_DATA.map((bus, i) => {
        const jitter = Math.floor((Math.random() - 0.5) * 4);
        const newPax = Math.max(0, Math.min(bus.capacity, bus.passengers + jitter));
        const newSpeed = bus.status === 'offline'
            ? 0
            : Math.max(20, Math.min(90, bus.speed + Math.floor((Math.random() - 0.5) * 10)));
        // Slowly advance position along route
        const nextIndex = (bus.routeIndex + 1) % busRoute.length;
        // Interpolate position between current and next waypoint
        const t = (Date.now() % 30000) / 30000; // 0→1 over 30s
        const lat = busRoute[bus.routeIndex][0] + (busRoute[nextIndex][0] - busRoute[bus.routeIndex][0]) * t;
        const lng = busRoute[bus.routeIndex][1] + (busRoute[nextIndex][1] - busRoute[bus.routeIndex][1]) * t;
        return {
            ...bus,
            passengers: bus.status === 'offline' ? bus.passengers : newPax,
            speed: newSpeed,
            gpsLocation: { lat, lng },
            lastUpdated: bus.status === 'offline' ? bus.lastUpdated : new Date().toISOString(),
        };
    });
}

// ── SMART ALERTS DATA ENGINE ───────────────────────────────────────────────
// Rolling pool of alert templates; generateSmartAlerts() picks a random
// subset and stamps them with live timestamps so the feed feels live.
const ALERT_TEMPLATES = [
    // errors
    { type: 'error',   category: 'connection', busId: 'BUS-003', message: 'GPS signal lost — no telemetry for 2+ minutes' },
    { type: 'error',   category: 'hardware',   busId: 'BUS-002', message: 'Door sensor malfunction on rear exit' },
    { type: 'error',   category: 'connection', busId: 'BUS-001', message: 'Backend API timeout — retrying connection' },
    { type: 'error',   category: 'safety',     busId: 'BUS-003', message: 'Emergency brake event detected' },
    { type: 'error',   category: 'hardware',   busId: 'BUS-002', message: 'Seat sensor offline — rows 3–4 unresponsive' },
    // warnings
    { type: 'warning', category: 'capacity',   busId: 'BUS-002', message: 'Occupancy at 90% — near full capacity' },
    { type: 'warning', category: 'luggage',    busId: 'BUS-001', message: 'Unattended luggage detected on Seat 12' },
    { type: 'warning', category: 'schedule',   busId: 'BUS-003', message: 'Route deviation — 3.2 km off planned path' },
    { type: 'warning', category: 'driver',     busId: 'BUS-002', message: 'Driver break overdue by 15 minutes' },
    { type: 'warning', category: 'capacity',   busId: 'BUS-001', message: 'Standing passengers detected — safety threshold' },
    { type: 'warning', category: 'schedule',   busId: 'BUS-002', message: 'ETA delayed by 8 min due to traffic' },
    // info
    { type: 'info',    category: 'schedule',   busId: 'BUS-001', message: 'Departed Thrissur — on schedule' },
    { type: 'info',    category: 'passenger',  busId: 'BUS-002', message: '4 passengers boarded at Coimbatore stop' },
    { type: 'info',    category: 'system',     busId: 'all',     message: 'Telemetry sync complete — all buses updated' },
    { type: 'info',    category: 'schedule',   busId: 'BUS-003', message: 'Next scheduled stop: Bengaluru Central' },
    // success
    { type: 'success', category: 'system',     busId: 'BUS-001', message: 'GPS lock re-established — tracking resumed' },
    { type: 'success', category: 'safety',     busId: 'BUS-002', message: 'Driver check-in confirmed — status active' },
    { type: 'success', category: 'schedule',   busId: 'BUS-003', message: 'Arrived at Hosur stop — 2 min early' },
    { type: 'success', category: 'system',     busId: 'all',     message: 'Fleet health check passed — all sensors OK' },
    { type: 'success', category: 'passenger',  busId: 'BUS-001', message: 'Passenger count reconciled — 28 confirmed' },
];

let _alertPool = [];

export function generateSmartAlerts() {
    // Seed the pool once, then prepend a fresh random alert every call
    if (_alertPool.length === 0) {
        // Take the first 8 templates as initial state
        _alertPool = ALERT_TEMPLATES.slice(0, 8).map((t, i) => ({
            ...t,
            id: Date.now() - (8 - i) * 45000,
            timestamp: new Date(Date.now() - (8 - i) * 45000).toISOString(),
        }));
    }

    // 30% chance per poll of a new event appearing
    if (Math.random() < 0.3) {
        const template = ALERT_TEMPLATES[Math.floor(Math.random() * ALERT_TEMPLATES.length)];
        _alertPool = [
            { ...template, id: Date.now(), timestamp: new Date().toISOString() },
            ..._alertPool,
        ].slice(0, 20); // keep max 20
    }

    return [..._alertPool]; // latest first
}

// ── DRIVER ROSTER ─────────────────────────────────────────────────────────────
// Static driver records mapped 1-to-1 with MULTI_BUS_DATA buses.
// getDriverRoster() returns a live snapshot with jittered lastActive timestamps.

export const DRIVER_ROSTER = [
    {
        id:         'DRV-01',
        name:       'Ravi Kumar',
        busId:      'BUS-001',
        route:      'Kochi Express',
        avatarInitials: 'RK',
        avatarColor:    '#6366f1',
        status:     'on_duty',      // on_duty | on_break | offline
        phone:      '+91 98400 11001',
        experience: '7 yrs',
        rating:     4.8,
        lastActive: new Date().toISOString(),
        shifStart:  '06:00 AM',
        shiftEnd:   '02:00 PM',
    },
    {
        id:         'DRV-02',
        name:       'Anitha Devi',
        busId:      'BUS-002',
        route:      'Coimbatore Link',
        avatarInitials: 'AD',
        avatarColor:    '#F59E0B',
        status:     'on_break',
        phone:      '+91 98400 22002',
        experience: '4 yrs',
        rating:     4.5,
        lastActive: new Date(Date.now() - 8 * 60 * 1000).toISOString(), // 8 min ago
        shifStart:  '08:00 AM',
        shiftEnd:   '04:00 PM',
    },
    {
        id:         'DRV-03',
        name:       'Suresh Babu',
        busId:      'BUS-003',
        route:      'Bengaluru Fast',
        avatarInitials: 'SB',
        avatarColor:    '#EF4444',
        status:     'offline',
        phone:      '+91 98400 33003',
        experience: '11 yrs',
        rating:     4.6,
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 h ago
        shifStart:  '10:00 AM',
        shiftEnd:   '06:00 PM',
    },
];

export function getDriverRoster() {
    return DRIVER_ROSTER.map(driver => {
        // on_duty drivers show a recently-updated lastActive
        if (driver.status === 'on_duty') {
            return {
                ...driver,
                lastActive: new Date(Date.now() - Math.floor(Math.random() * 60) * 1000).toISOString(),
            };
        }
        return { ...driver };
    });
}


// Initial bus state
let currentBusData = {
    totalPassengers: 18,
    occupiedSeats: 18,
    luggageAlerts: 2,
    driverStatus: 'Active',
    currentRouteIndex: 0,
    latency: 24,
    seats: generateInitialSeats(),
    alerts: [],
};

// Generate initial seat configuration (40 seats)
function generateInitialSeats() {
    const seats = [];
    for (let i = 1; i <= 40; i++) {
        const random = Math.random();
        const occupied = random > 0.5;
        const hasLuggage = random > 0.85;

        seats.push({
            number: i,
            occupied: occupied,
            passengerCount: occupied ? (Math.random() > 0.7 ? 2 : 1) : 0,
            hasLuggage: hasLuggage && occupied,
            lastUpdated: new Date().toISOString(),
            row: Math.ceil(i / 4),
            col: ((i - 1) % 4) + 1,
        });
    }
    return seats;
}

// Generate random bus metrics
export function generateBusMetrics() {
    const passengers = Math.floor(Math.random() * 8) + 15; // 15-22
    const luggage = Math.floor(Math.random() * 5); // 0-4
    const latency = Math.floor(Math.random() * 30) + 15; // 15-45ms

    currentBusData = {
        ...currentBusData,
        totalPassengers: passengers,
        occupiedSeats: passengers,
        luggageAlerts: luggage,
        driverStatus: Math.random() > 0.1 ? 'Active' : 'On Break',
        latency,
    };

    return currentBusData;
}

// Update bus position along route
export function updateBusPosition() {
    currentBusData.currentRouteIndex =
        (currentBusData.currentRouteIndex + 1) % busRoute.length;
    return busRoute[currentBusData.currentRouteIndex];
}

// Get current bus position
export function getCurrentBusPosition() {
    return busRoute[currentBusData.currentRouteIndex];
}

// Update random seats
export function updateSeats() {
    const newSeats = [...currentBusData.seats];
    const numChanges = Math.floor(Math.random() * 3) + 1; // 1-3 changes

    const newAlerts = [];

    for (let i = 0; i < numChanges; i++) {
        const randomIndex = Math.floor(Math.random() * 40);
        const random = Math.random();
        const oldSeat = newSeats[randomIndex];

        const occupied = random > 0.5;
        const hasLuggage = random > 0.85;

        newSeats[randomIndex] = {
            ...oldSeat,
            occupied: occupied,
            passengerCount: occupied ? (Math.random() > 0.7 ? 2 : 1) : 0,
            hasLuggage: hasLuggage && occupied,
            lastUpdated: new Date().toISOString(),
        };

        // Generate alert if luggage detected
        if (hasLuggage && occupied && !oldSeat.hasLuggage) {
            newAlerts.push({
                id: Date.now() + i,
                type: 'luggage',
                severity: 'warning',
                message: `Seat ${oldSeat.number}: Luggage Detected`,
                timestamp: new Date().toLocaleTimeString(),
            });
        } else if (occupied && !oldSeat.occupied) {
            newAlerts.push({
                id: Date.now() + i,
                type: 'passenger',
                severity: 'info',
                message: `Seat ${oldSeat.number}: Passenger Seated`,
                timestamp: new Date().toLocaleTimeString(),
            });
        }
    }

    currentBusData.seats = newSeats;

    // Add new alerts to the beginning
    if (newAlerts.length > 0) {
        currentBusData.alerts = [...newAlerts, ...currentBusData.alerts].slice(0, 20);
    }

    return { seats: newSeats, alerts: newAlerts };
}

// Get current seats (legacy)
export function getCurrentSeats() {
    return currentBusData.seats;
}

// Get seat data for SeatGrid component
export function getSeatData() {
    // Update seats periodically
    if (Math.random() > 0.7) {
        updateSeats();
    }
    return currentBusData.seats;
}

// Get recent alerts
export function getRecentAlerts() {
    // Occasionally add random critical alerts
    if (Math.random() > 0.95 && currentBusData.alerts.length < 20) {
        const criticalAlerts = [
            'Emergency: Driver assistance required',
            'Critical: Unauthorized access detected',
            'Emergency: Medical assistance needed',
        ];

        currentBusData.alerts.unshift({
            id: Date.now(),
            type: 'critical',
            severity: 'critical',
            message: criticalAlerts[Math.floor(Math.random() * criticalAlerts.length)],
            timestamp: new Date().toLocaleTimeString(),
        });
    }

    return currentBusData.alerts;
}

// Generate 24-hour on-time performance data
export function getOnTimePerformanceData() {
    const data = [];
    for (let hour = 0; hour < 24; hour++) {
        data.push({
            hour: `${hour}:00`,
            performance: Math.floor(Math.random() * 20) + 75, // 75-95%
        });
    }
    return data;
}

// Generate route efficiency data
export function getRouteData() {
    return [
        { route: 'Route 101', efficiency: 92, revenue: 4500 },
        { route: 'Route 102', efficiency: 88, revenue: 4200 },
        { route: 'Route 103', efficiency: 95, revenue: 5100 },
        { route: 'Route 104', efficiency: 85, revenue: 3800 },
        { route: 'Route 105', efficiency: 90, revenue: 4700 },
    ];
}

// ── AI INSIGHTS ENGINE ────────────────────────────────────────────────────────
// Returns 3–5 structured insight objects driven by live fleet data.
// Each object: { id, category, icon, message, metric, trend }
// trend: 'up' | 'down' | 'neutral'
// icon:  lucide icon name string (resolved in AIInsightsPanel)

const INSIGHT_POOL = [
    {
        id: 'route-101-occ',
        category: 'Occupancy',
        icon: 'Users',
        message: 'Route 101 has 85% occupancy during peak hours (08:00–10:00)',
        metric: '85%',
        trend: 'up',
    },
    {
        id: 'route-103-eff',
        category: 'Efficiency',
        icon: 'TrendingUp',
        message: 'Route 103 leads fleet efficiency at 95% — best performing route today',
        metric: '95%',
        trend: 'up',
    },
    {
        id: 'avg-occ',
        category: 'Fleet',
        icon: 'BarChart2',
        message: 'Fleet average occupancy is 72% — within healthy operating range',
        metric: '72%',
        trend: 'neutral',
    },
    {
        id: 'driver-perf',
        category: 'Driver',
        icon: 'UserCheck',
        message: 'Driver performance peaks between 06:00–09:00 — 98% on-time rate',
        metric: '98%',
        trend: 'up',
    },
    {
        id: 'route-104-warn',
        category: 'Alert',
        icon: 'AlertTriangle',
        message: 'Route 104 shows 12% delay rate — recommend schedule review',
        metric: '12%',
        trend: 'down',
    },
    {
        id: 'luggage-peak',
        category: 'Safety',
        icon: 'Package',
        message: 'Peak luggage activity detected between 14:00–16:00 — 6 incidents today',
        metric: '6',
        trend: 'down',
    },
    {
        id: 'bus-002-cap',
        category: 'Capacity',
        icon: 'Bus',
        message: 'BUS-002 running at 90% capacity — consider deploying overflow service',
        metric: '90%',
        trend: 'down',
    },
    {
        id: 'sensor-health',
        category: 'System',
        icon: 'Activity',
        message: 'All seat sensors operational — last full health check 3 minutes ago',
        metric: '100%',
        trend: 'up',
    },
];

export function generateAIInsights() {
    const luggageCount  = currentBusData.seats.filter(s => s.hasLuggage).length;
    const occupiedCount = currentBusData.seats.filter(s => s.occupied).length;
    const occupancyPct  = Math.round((occupiedCount / currentBusData.seats.length) * 100);

    // Dynamic insights derived from live seat state
    const dynamic = [];

    if (luggageCount > 3) {
        dynamic.push({
            id:       `dyn-luggage-${luggageCount}`,
            category: 'Safety',
            icon:     'Package',
            message:  `${luggageCount} seats with unattended luggage — immediate inspection advised`,
            metric:   `${luggageCount}`,
            trend:    'down',
        });
    }

    if (occupiedCount > 30) {
        dynamic.push({
            id:       'dyn-capacity',
            category: 'Capacity',
            icon:     'Users',
            message:  `Bus near full capacity at ${occupancyPct}% — standing passengers detected`,
            metric:   `${occupancyPct}%`,
            trend:    'down',
        });
    }

    if (occupancyPct < 40) {
        dynamic.push({
            id:       'dyn-low-occ',
            category: 'Occupancy',
            icon:     'TrendingDown',
            message:  `Low occupancy at ${occupancyPct}% — consider consolidating with another service`,
            metric:   `${occupancyPct}%`,
            trend:    'neutral',
        });
    }

    // Pick 3–5 from static pool (shuffle so it varies each call)
    const shuffled = [...INSIGHT_POOL].sort(() => Math.random() - 0.5);
    const staticPick = shuffled.slice(0, Math.max(0, 5 - dynamic.length));

    return [...dynamic, ...staticPick].slice(0, 5);
}

// Export current bus data
export function getCurrentBusData() {
    return currentBusData;
}
