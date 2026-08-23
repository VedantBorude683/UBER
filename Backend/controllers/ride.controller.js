const rideService = require('../services/ride.service');
const { validationResult } = require('express-validator');
const { sendMessageToSocketId } = require('../socket');
const mapService = require('../services/maps.service');
const rideModel = require('../models/ride.model');

const CAPTAIN_SEARCH_RADIUS_KM = 10;

const vehicleTypesMatch = (captainType, rideType) => {
    const normalizedCaptainType = captainType?.toLowerCase();
    const normalizedRideType = rideType?.toLowerCase() === 'motorcycle' ? 'moto' : rideType?.toLowerCase();
    return normalizedCaptainType === normalizedRideType ||
        (normalizedCaptainType === 'motorcycle' && normalizedRideType === 'moto') ||
        (normalizedCaptainType === 'moto' && normalizedRideType === 'motorcycle');
};

module.exports.createRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { pickup, destination, vehicleType } = req.body;

    try {
        const ride = await rideService.createRide({ user: req.user._id, pickup, destination, vehicleType });
        // A ride is successfully created even if notifying a nearby captain
        // fails (for example, a map-provider timeout). Send the response once
        // and never try to send a second error response from this handler.
        res.status(201).json(ride);

        try {
        // 1. Get Coordinates
        const pickupCoordinates = await mapService.getAddressCoordinate(pickup);
        console.log("📍 Pickup Coordinates:", pickupCoordinates);

        // 2. Find Captains
        let captainsInRadius = await mapService.getCaptainsInTheRadius(
            pickupCoordinates.lat,
            pickupCoordinates.lng,
            CAPTAIN_SEARCH_RADIUS_KM
        );
        const hasEligibleCaptain = captainsInRadius.some((captain) =>
            captain.status === 'active' && captain.socketId && vehicleTypesMatch(captain.vehicle?.vehicleType, vehicleType)
        );
        // Keep a connected captain eligible when mobile GPS is stale or the
        // geospatial record has not updated yet. Vehicle type still matches.
        if (!hasEligibleCaptain) {
            captainsInRadius = await require('../models/captain.model').find({
                status: 'active',
                socketId: { $exists: true, $ne: '' }
            });
            console.log('No eligible nearby captain found; checking active connected captains.');
        }
        console.log(`🚕 Captains found within ${CAPTAIN_SEARCH_RADIUS_KM} km:`, captainsInRadius.length);

        // 3. Clear sensitive data
        const rideWithUser = await rideModel.findOne({ _id: ride._id }).populate('user');

        // 4. Send Notifications
        captainsInRadius.forEach((captain) => {
            console.log(`🔎 Checking Captain ${captain.fullname.firstname}: Status=${captain.status}, Type=${captain.vehicle.vehicleType}`);

            // Normalize: ride uses 'moto', captain model uses 'motorcycle'
            const typeMatches = vehicleTypesMatch(captain.vehicle?.vehicleType, vehicleType);

            if (captain.status === 'active' && captain.socketId && typeMatches) {
                console.log(`🔔 Sending Ride Request to Captain: ${captain.socketId}`);
                sendMessageToSocketId(captain.socketId, {
                    event: 'new-ride',
                    data: rideWithUser
                });
            } else {
                console.log(`❌ Captain skipped (status=${captain.status}, socket=${captain.socketId ? 'connected' : 'missing'}, captainType=${captain.vehicle?.vehicleType}, rideType=${vehicleType})`);
            }
            
        });

        } catch (notificationError) {
            console.error('Ride created but captain notification failed:', notificationError.message);
        }
    } catch (err) {
        console.error(err);
        if (!res.headersSent) return res.status(500).json({ message: err.message });
    }
};

module.exports.getFare = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { pickup, destination } = req.query;

    try {
        const fare = await rideService.getFare(pickup, destination);
        return res.status(200).json(fare);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports.confirmRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;
    try {
        const ride = await rideService.confirmRide({ rideId, captain: req.captain });

        // 👇 ADD THESE DEBUG LOGS
        console.log("🚀 DEBUG: Captain accepted ride:", ride._id);
        console.log("🚀 DEBUG: User ID:", ride.user._id);
        console.log("🚀 DEBUG: User Socket ID from DB:", ride.user.socketId);

        if (!ride.user.socketId) {
            console.error("❌ ERROR: User has NO Socket ID. Message will fail.");
        }

        sendMessageToSocketId(ride.user.socketId, {
            event: 'ride-confirmed',
            data: ride
        });

        return res.status(200).json(ride);
    } catch (err) {
        console.log(err);
        return res.status(409).json({ message: err.message });
    }
}

module.exports.getActiveRide = async (req, res) => {
    try {
        const ride = await rideService.getActiveRide({ captain: req.captain });
        return res.status(200).json({ ride });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports.cancelRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const ride = await rideService.cancelRide({ rideId: req.body.rideId, captain: req.captain });
        sendMessageToSocketId(ride.user.socketId, { event: 'ride-cancelled', data: ride });
        return res.status(200).json(ride);
    } catch (err) {
        return res.status(409).json({ message: err.message });
    }
};



module.exports.startRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId, otp } = req.query;

    try {
        const ride = await rideService.startRide({ rideId, otp, captain: req.captain });

        // Tell the user the ride has started
        sendMessageToSocketId(ride.user.socketId, {
            event: 'ride-started',
            data: ride
        });

        return res.status(200).json(ride);
    } catch (err) {
        console.log("❌ START RIDE ERROR:", err);
        return res.status(409).json({ message: err.message });
    }
}

module.exports.endRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;

    try {
        const ride = await rideService.endRide({ rideId, captain: req.captain });

        sendMessageToSocketId(ride.user.socketId, {
            event: 'ride-ended',
            data: ride
        });

        return res.status(200).json(ride);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}
