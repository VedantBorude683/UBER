const rideModel = require('../models/ride.model');
const mapService = require('./maps.service');
const crypto = require('crypto');

 async function getFare(pickup, destination) {
    if (!pickup || !destination) {
        throw new Error('Pickup and destination are required');
    }

    const distanceTime = await mapService.getDistanceTime(pickup, destination);

    const baseFare = {
        auto: 30,
        car: 50,
        moto: 20
    };

    const perKmRate = {
        auto: 10,
        car: 15,
        moto: 8
    };

    const perMinuteRate = {
        auto: 2,
        car: 3,
        moto: 1.5
    };

    // --- 🌟 SMART SURGE PRICING LOGIC ---
    let surgeMultiplier = 1;
    const currentHour = new Date().getHours();

    // Rush Hour (8 AM - 10 AM) OR (5 PM - 7 PM)
    if ((currentHour >= 8 && currentHour <= 10) || (currentHour >= 17 && currentHour <= 19)) {
        surgeMultiplier = 1.5; // 50% extra
    }
    // Late Night (11 PM - 5 AM)
    else if (currentHour >= 23 || currentHour <= 5) {
        surgeMultiplier = 1.25; // 25% extra
    }

    const fare = {
        auto: Math.round(baseFare.auto + ((distanceTime.distance.value / 1000) * perKmRate.auto) + ((distanceTime.duration.value / 60) * perMinuteRate.auto) * surgeMultiplier),
        car: Math.round(baseFare.car + ((distanceTime.distance.value / 1000) * perKmRate.car) + ((distanceTime.duration.value / 60) * perMinuteRate.car) * surgeMultiplier),
        moto: Math.round(baseFare.moto + ((distanceTime.distance.value / 1000) * perKmRate.moto) + ((distanceTime.duration.value / 60) * perMinuteRate.moto) * surgeMultiplier)
    };

    return fare;
};



// Helper Function: Generate 6-digit OTP
function getOtp(num) {
    function generateOtp(num) {
        const otp = crypto.randomInt(Math.pow(10, num - 1), Math.pow(10, num)).toString();
        return otp;
    }
    return generateOtp(num);
}

module.exports.createRide = async ({ user, pickup, destination, vehicleType }) => {
    if (!user || !pickup || !destination || !vehicleType) {
        throw new Error('All fields are required');
    }

    const fare = await getFare(pickup, destination);

    const ride = await rideModel.create({
        user,
        pickup,
        destination,
        otp: getOtp(6),
        fare: fare[ vehicleType ]
    })
    

    return ride;
}
module.exports.confirmRide = async ({ rideId, captain }) => {
    if (!rideId) {
        throw new Error('Ride id is required');
    }
    console.log("🛠️ CONFIRM RIDE SERVICE CALLED");
    console.log("Ride ID:", rideId);
    console.log("Captain ID:", captain._id);

    const existingActiveRide = await rideModel.exists({
        captain: captain._id,
        status: { $in: ['accepted', 'ongoing'] }
    });
    if (existingActiveRide) throw new Error('You already have an active ride');

    // Claim only a still-pending ride. This prevents two captains from
    // accepting the same request after a reconnect or delayed socket event.
    const claimedRide = await rideModel.findOneAndUpdate({
        _id: rideId,
        status: 'pending'
    }, {
        status: 'accepted',
        captain: captain._id
    }, { new: true });

    if (!claimedRide) {
        throw new Error('This ride is no longer available');
    }

    // 2. Return the updated ride (populated with user details)
    const ride = await rideModel.findOne({
        _id: rideId
    }).populate('user').populate('captain').select('+otp');

    if (!ride) {
        throw new Error('Ride not found');
    }
    console.log("✅ Ride Status Updated to:", ride.status);

    return ride;
};

module.exports.getActiveRide = async ({ captain }) => {
    return rideModel.findOne({
        captain: captain._id,
        status: { $in: ['accepted', 'ongoing'] }
    })
        .sort({ _id: -1 })
        .populate('user')
        .populate('captain');
};

module.exports.cancelRide = async ({ rideId, captain }) => {
    const ride = await rideModel.findOneAndUpdate({
        _id: rideId,
        captain: captain._id,
        status: 'accepted'
    }, {
        status: 'cancelled'
    }, { new: true })
        .populate('user')
        .populate('captain');

    if (!ride) throw new Error('Only an accepted ride can be cancelled');
    return ride;
};




module.exports.startRide = async ({ rideId, otp, captain }) => {
    if (!rideId || !otp) {
        throw new Error('Ride id and OTP are required');
    }

    const ride = await rideModel.findOne({
        _id: rideId,
        captain: captain._id
    }).populate('user').populate('captain').select('+otp');

    if (!ride) {
        throw new Error('Ride not found');
    }

    console.log(`📢 Emitting 'ride-started' to User: ${ride.user.fullname.firstname} at Socket: ${ride.user.socketId}`);

    if (ride.status !== 'accepted') {
        throw new Error('Ride not accepted');
    }

    
    const dbOtp = ride.otp.toString().trim();
    const inputOtp = otp.toString().trim();

    if (dbOtp !== inputOtp) {
        // Helpful error for debugging (remove specific values in real production)
        throw new Error(`Invalid OTP. DB: ${dbOtp}, Input: ${inputOtp}`);
    }

    const updatedRide = await rideModel.findOneAndUpdate({
        _id: rideId,
        captain: captain._id,
        status: 'accepted'
    }, {
        status: 'ongoing'
    }, {
        new: true // 👈 This ensures we return the UPDATED document
    }).populate('user').populate('captain');

    if (!updatedRide) throw new Error('Ride could not be started');
    return updatedRide

    
};
module.exports.endRide = async ({ rideId, captain }) => {
    if (!rideId) {
        throw new Error('Ride id is required');
    }

    const ride = await rideModel.findOne({
        _id: rideId,
        captain: captain._id
    }).populate('user').populate('captain').select('+otp');

    if (!ride) {
        throw new Error('Ride not found');
    }

    if (ride.status !== 'ongoing') {
        throw new Error('Ride not ongoing');
    }

    await rideModel.findOneAndUpdate({
        _id: rideId
    }, {
        status: 'completed'
    })

    return ride;
}
module.exports.getFare = getFare;
