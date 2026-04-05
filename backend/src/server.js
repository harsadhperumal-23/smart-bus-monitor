require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const morgan = require('morgan');
const connectDB = require('./config/db');
const logAccess = require('./middleware/logAccess');
const { seedBuses, startGlobalSimulation } = require('./simulator');

// Import routes
const authRoutes = require('./routes/auth.routes');
const busRoutes = require('./routes/bus.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const accessLogsRoutes = require('./routes/accessLogs.routes');
const customerRoutes = require('./routes/customer.routes');
const seedRoutes = require('./routes/seed.routes');

// Initialize Express app
const app = express();

// Connect to MongoDB and start simulator
connectDB().then(async () => {
    console.log('🔧 Initializing multi-bus simulation...');
    try {
        await seedBuses();
        startGlobalSimulation();
    } catch (error) {
        console.error('⚠️  Simulator initialization failed:', error.message);
    }
});

// Middleware
app.use(cors({
    origin: [
        'http://localhost:3000',
        process.env.CLIENT_URL
    ].filter(Boolean),
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP request logger
app.use(morgan('dev'));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'supersecretkey',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Access logging middleware (logs to MongoDB)
app.use(logAccess);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date()
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/bus', busRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/access-logs', accessLogsRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/seed', seedRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Smart Bus Monitor API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            bus: '/api/bus',
            analytics: '/api/analytics',
            accessLogs: '/api/access-logs',
            customer: '/api/customer',
            seed: '/api/seed'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('\n🚀 ========================================');
    console.log(`   Smart Bus Monitor Backend Server`);
    console.log('   ========================================');
    console.log(`   🌐 Server running on port ${PORT}`);
    console.log(`   🔗 API: http://localhost:${PORT}`);
    console.log(`   🏥 Health: http://localhost:${PORT}/health`);
    console.log(`   📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('   ========================================\n');
});

module.exports = app;
