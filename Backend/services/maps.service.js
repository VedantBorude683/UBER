const axios = require('axios');
const captainModel = require('../models/captain.model');

// Load API Key from environment variables
const apiKey = process.env.TOMTOM_API_KEY;

// 1. Geocoding (Convert Address -> Coordinates)
module.exports.getAddressCoordinate = async (address) => {
    // TomTom Geocoding API: Search for the address
    const url = `https://api.tomtom.com/search/2/geocode/${encodeURIComponent(address)}.json?key=${apiKey}&limit=1`;

    try {
        const response = await axios.get(url);

        if (response.data.results && response.data.results.length > 0) {
            const position = response.data.results[0].position;
            return {
                lat: position.lat,
                lng: position.lon
            };
        } else {
            // Fallback: If strict match fails, try stripping details (Smart Retry logic could go here)
            throw new Error('Unable to fetch coordinates');
        }
    } catch (error) {
        console.error("TomTom Geocode Error:", error.message);
        throw error;
    }
}

// 2. Distance & Time (With LIVE TRAFFIC)
module.exports.getDistanceTime = async (origin, destination) => {
    if (!origin || !destination) {
        throw new Error('Origin and destination are required');
    }

    try {
        // Step 1: Get coordinates for both locations
        const originCoords = await module.exports.getAddressCoordinate(origin);
        const destCoords = await module.exports.getAddressCoordinate(destination);

        // TomTom Routing format: lat,lng:lat,lng
        const routeRequest = `${originCoords.lat},${originCoords.lng}:${destCoords.lat},${destCoords.lng}`;

        // Step 2: Fetch Route with Traffic Data (traffic=true)
        const url = `https://api.tomtom.com/routing/1/calculateRoute/${routeRequest}/json?key=${apiKey}&traffic=true`;

        const response = await axios.get(url);

        if (response.data.routes && response.data.routes.length > 0) {
            const route = response.data.routes[0];
            const summary = route.summary;
            const legs = route.legs[0].points;

            return {
                distance: {
                    text: `${(summary.lengthInMeters / 1000).toFixed(1)} km`,
                    value: summary.lengthInMeters
                },
                duration: {
                    // 'travelTimeInSeconds' includes delays from traffic jams
                    text: `${Math.round(summary.travelTimeInSeconds / 60)} mins`,
                    value: summary.travelTimeInSeconds
                },
                path: legs.map(point => ({ lat: point.latitude, lng: point.longitude }))
            };
        } else {
            throw new Error('No routes found');
        }

    } catch (err) {
        console.error("TomTom Routing Error:", err.message);
        throw err;
    }
}

// 3. AutoComplete Suggestions
module.exports.getAutoCompleteSuggestions = async (input) => {
    if (!input) {
        throw new Error('query is required');
    }

    // TomTom Fuzzy Search for autocomplete
    const url = `https://api.tomtom.com/search/2/search/${encodeURIComponent(input)}.json?key=${apiKey}&limit=5&typeahead=true`;

    try {
        const response = await axios.get(url);

        if (response.data.results) {
            return response.data.results.map(result => ({
                // Format matches what your frontend expects
                description: result.address.freeformAddress, 
                place_id: result.id 
            }));
        } else {
            return [];
        }
    } catch (err) {
        console.error("TomTom Autocomplete Error:", err.message);
        return [];
    }
}

// 4. Captain Search
module.exports.getCaptainsInTheRadius = async (lat, lng, radius) => {
    const captains = await captainModel.find({
        location: {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: [lng, lat]
                },
                $maxDistance: radius * 1000
            }
        }
    });
    return captains;
}
module.exports.getAddressFromCoordinates = async (lat, lng) => {
    const apiKey = process.env.TOMTOM_API_KEY;
    const url = `https://api.tomtom.com/search/2/reverseGeocode/${lat},${lng}.json?key=${apiKey}`;

    try {
        const response = await axios.get(url);
        if (response.data.addresses && response.data.addresses.length > 0) {
            return response.data.addresses[0].address.freeformAddress;
        } else {
            throw new Error('Unable to fetch address');
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
}
