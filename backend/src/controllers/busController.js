const Bus = require('../models/Bus');

/**
 * Get all buses
 */
exports.getAllBuses = async (req, res) => {
    try {
        const buses = await Bus.find().select('busId busNumber route status passengerCount capacity lastUpdated');

        res.json({
            success: true,
            count: buses.length,
            data: buses
        });
    } catch (error) {
        console.error('Error fetching buses:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch buses'
        });
    }
};

/**
 * Get single bus status
 */
exports.getBusStatus = async (req, res) => {
    try {
        const bus = await Bus.findOne({ busId: req.params.id });

        if (!bus) {
            return res.status(404).json({
                success: false,
                message: 'Bus not found'
            });
        }

        res.json({
            success: true,
            data: bus
        });
    } catch (error) {
        console.error('Error fetching bus status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch bus status'
        });
    }
};

/**
 * Get driver status for a bus
 */
exports.getDriverStatus = async (req, res) => {
    try {
        const bus = await Bus.findOne({ busId: req.params.id }).select('driverStatus');

        if (!bus) {
            return res.status(404).json({
                success: false,
                message: 'Bus not found'
            });
        }

        res.json({
            success: true,
            data: bus.driverStatus
        });
    } catch (error) {
        console.error('Error fetching driver status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch driver status'
        });
    }
};

/**
 * Get attender status for a bus
 */
exports.getAttenderStatus = async (req, res) => {
    try {
        const bus = await Bus.findOne({ busId: req.params.id }).select('attenderStatus');

        if (!bus) {
            return res.status(404).json({
                success: false,
                message: 'Bus not found'
            });
        }

        res.json({
            success: true,
            data: bus.attenderStatus
        });
    } catch (error) {
        console.error('Error fetching attender status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch attender status'
        });
    }
};

/**
 * Get seat map for a bus
 */
exports.getSeatMap = async (req, res) => {
    try {
        const bus = await Bus.findOne({ busId: req.params.id }).select('busId capacity seatStates');

        if (!bus) {
            return res.status(404).json({
                success: false,
                message: 'Bus not found'
            });
        }

        res.json({
            success: true,
            data: {
                busId: bus.busId,
                totalSeats: bus.capacity,
                layout: '2-2',
                seats: bus.seatStates || []
            }
        });
    } catch (error) {
        console.error('Error fetching seat map:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch seat map'
        });
    }
};

/**
 * Get seats for a specific bus (seatStates only)
 */
exports.getSeatsForBus = async (req, res) => {
    try {
        const bus = await Bus.findOne({ busId: req.params.id }).select('seatStates capacity');

        if (!bus) {
            return res.status(404).json({
                success: false,
                message: 'Bus not found'
            });
        }

        res.json({
            success: true,
            data: {
                seats: bus.seatStates || [],
                capacity: bus.capacity
            }
        });
    } catch (error) {
        console.error('Error fetching seats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch seats'
        });
    }
};

/**
 * Update bus snapshot (for IoT devices or simulator)
 * Accepts: busId (required), passengerCount, seatStates, gpsLocation
 */
exports.updateSnapshot = async (req, res) => {
    try {
        const { busId, seatStates, gpsLocation, passengerCount } = req.body;

        if (!busId) {
            return res.status(400).json({
                success: false,
                message: 'busId is required'
            });
        }

        let bus = await Bus.findOne({ busId });

        // Create bus if it doesn't exist (for new IoT devices)
        if (!bus) {
            console.log(`[SNAPSHOT] Creating new bus with ID: ${busId}`);
            bus = new Bus({
                busId: busId,
                busNumber: busId,
                route: 'Unknown',
                capacity: 40,
                passengerCount: passengerCount || 0
            });
            await bus.save();
        }

        // Update fields
        const updateData = { lastUpdated: new Date() };

        if (seatStates) {
            updateData.seatStates = seatStates;
        }
        
        if (gpsLocation) {
            updateData.gpsLocation = gpsLocation;
            updateData.currentLocation = gpsLocation;
        }
        
        if (passengerCount !== undefined) {
            // Validate passenger count
            const count = Math.max(0, Math.min(passengerCount, 100));
            updateData.passengerCount = count;
            console.log(`[SNAPSHOT] Bus ${busId} passenger count: ${count}`);
        }

        const updatedBus = await Bus.findOneAndUpdate({ busId }, updateData, { new: true });

        res.json({
            success: true,
            message: 'Bus snapshot updated successfully',
            data: {
                busId: updatedBus.busId,
                passengerCount: updatedBus.passengerCount,
                lastUpdated: updatedBus.lastUpdated
            }
        });
    } catch (error) {
        console.error('Error updating snapshot:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update snapshot',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

