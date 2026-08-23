const socketIo = require('socket.io');
const userModel = require('./models/user.model');
const captainModel = require('./models/captain.model');
const rideModel = require('./models/ride.model');
const axios = require('axios');

let io;

// Calculate distance from captain's current location to ride pickup
async function getCaptainDistanceToPickup(captainLtd, captainLng, pickupAddress) {
    try {
        const apiKey = process.env.TOMTOM_API_KEY;

        const geoUrl = `https://api.tomtom.com/search/2/geocode/${encodeURIComponent(pickupAddress)}.json?key=${apiKey}&limit=1`;
        const geoResponse = await axios.get(geoUrl, { timeout: 8000 });

        if (!geoResponse.data.results || geoResponse.data.results.length === 0) return null;

        const { lat, lon } = geoResponse.data.results[0].position;

        const routeUrl = `https://api.tomtom.com/routing/1/calculateRoute/${captainLtd},${captainLng}:${lat},${lon}/json?key=${apiKey}&traffic=true`;
        const routeResponse = await axios.get(routeUrl, { timeout: 8000 });

        if (!routeResponse.data.routes || routeResponse.data.routes.length === 0) return null;

        const summary = routeResponse.data.routes[0].summary;
        const distanceKm = (summary.lengthInMeters / 1000).toFixed(1);
        const durationMin = Math.ceil(summary.travelTimeInSeconds / 60);

        return {
            distanceText: `${distanceKm} km`,
            durationText: `${durationMin} min`,
            distanceKm: parseFloat(distanceKm),
            durationMin
        };
    } catch (err) {
        // Silently fail — distance is optional, don't crash the server
        return null;
    }
}

function initializeSocket(server) {
    io = socketIo(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        console.log(`Client connected: ${socket.id}`);

        // ─────────────────── JOIN ───────────────────
        socket.on('join', async (data) => {
            try {
                const { userId, userType } = data;
                if (!userId || !userType) return;

                console.log(`🔔 JOIN EVENT RECEIVED: User=${userId}, Type=${userType}`);

                if (userType === 'user') {
                    const res = await userModel.findByIdAndUpdate(
                        userId,
                        { socketId: socket.id },
                        { new: true, strict: false }
                    );
                    console.log(`💾 DB UPDATE: ${res ? 'SUCCESS ' + res.socketId : 'FAILED'}`);
                } else if (userType === 'captain') {
                    // ✅ KEY FIX: Set captain to ACTIVE when they open the app
                    const res = await captainModel.findByIdAndUpdate(
                        userId,
                        { socketId: socket.id, status: 'active' },
                        { new: true }
                    );
                    console.log(`🚕 Captain ${res?.fullname?.firstname} is now ACTIVE`);
                }
            } catch (err) {
                console.error('Join error:', err.message);
            }
        });

        // ─────────────────── LOCATION UPDATE ───────────────────
        socket.on('update-location-captain', async (data) => {
            try {
                const { userId, location } = data;

                if (!userId || !location || location.ltd == null || location.lng == null) {
                    return;
                }

                await captainModel.findByIdAndUpdate(userId, {
                    location: {
                        type: 'Point',
                        coordinates: [location.lng, location.ltd]
                    }
                });

                // Find if this captain has an active ride
                const ride = await rideModel.findOne({
                    captain: userId,
                    status: { $in: ['accepted', 'ongoing'] }
                }).populate('user');

                if (!ride || !ride.user || !ride.user.socketId) return;

                // Share the captain's live position both while travelling to
                // pickup and while the ride is in progress. The passenger UI
                // uses it to draw the appropriate route for each stage.
                if (ride.status === 'accepted' || ride.status === 'ongoing') {
                    sendMessageToSocketId(ride.user.socketId, {
                        event: 'live-tracking-data',
                        data: location
                    });
                }

                if (ride.status === 'accepted') {
                    // Captain on way to pickup: calculate and send distance
                    const distInfo = await getCaptainDistanceToPickup(
                        location.ltd,
                        location.lng,
                        ride.pickup
                    );
                    if (distInfo) {
                        sendMessageToSocketId(ride.user.socketId, {
                            event: 'captain-distance-update',
                            data: distInfo
                        });
                    }
                }
            } catch (err) {
                console.error('update-location-captain error:', err.message);
            }
        });

        // ─────────────────── PAYMENT ───────────────────
        socket.on('payment-made', async (data) => {
            try {
                const { rideId, method } = data;
                if (!rideId) return;

                const ride = await rideModel.findById(rideId).populate('captain');
                if (ride && ride.captain && ride.captain.socketId) {
                    sendMessageToSocketId(ride.captain.socketId, {
                        event: 'payment-confirmed',
                        data: { rideId, method, amount: ride.fare }
                    });
                    console.log(`💰 Payment ₹${ride.fare} via ${method} confirmed to captain`);
                }
            } catch (err) {
                console.error('payment-made error:', err.message);
            }
        });

        // ─────────────────── DISCONNECT ───────────────────
        socket.on('disconnect', async () => {
            console.log(`Client disconnected: ${socket.id}`);
            try {
                // Set captain to inactive when they disconnect
                await captainModel.findOneAndUpdate(
                    { socketId: socket.id },
                    { status: 'inactive' }
                );
            } catch (err) {
                // Silent — non-critical
            }
        });
    });
}

const sendMessageToSocketId = (socketId, messageObject) => {
    if (io) {
        io.to(socketId).emit(messageObject.event, messageObject.data);
    } else {
        console.log('Socket.io not initialized.');
    }
};

const broadcastMessage = (messageObject) => {
    if (io) {
        io.emit(messageObject.event, messageObject.data);
    }
};

module.exports = { initializeSocket, sendMessageToSocketId, broadcastMessage };
