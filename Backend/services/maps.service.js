const axios = require('axios');
const captainModel = require('../models/captain.model');

// 👇 HELPER: Keeps the API call logic clean and reusable
async function fetchCoordinates(address) {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'UberCloneApp/1.0'
            }
        });
        if (response.data && response.data.length > 0) {
            const location = response.data[0];
            return {
                lat: parseFloat(location.lat),
                lng: parseFloat(location.lon)
            };
        }
        return null;
    } catch (error) {
        return null;
    }
}

// 👇 UPDATED: Smart Geocoding with Retry Logic
module.exports.getAddressCoordinate = async (address) => {
    try {
        // Attempt 1: Try the exact full address
        let coordinates = await fetchCoordinates(address);
        
        // Attempt 2: If strict match fails, try "Place Name + City"
        // Example: "Shop 5, Phoenix Mall, Viman Nagar, Pune" -> "Phoenix Mall, Pune"
        if (!coordinates) {
            const parts = address.split(',');
            if (parts.length >= 3) {
                const placeName = parts[0].trim();
                const city = parts[parts.length - 2].trim(); // Usually city/district is 2nd to last
                const simpleAddress = `${placeName}, ${city}`;
                
                console.log(`📍 Retrying with simple address: "${simpleAddress}"`);
                coordinates = await fetchCoordinates(simpleAddress);
            }
        }

        // Attempt 3: If that fails, remove the first part (Shop/Flat no) and try the Area
        if (!coordinates) {
             const parts = address.split(',');
             const shortAddress = parts.slice(1).join(',').trim(); 
             if (shortAddress.length > 5) {
                 console.log(`📍 Retrying with short address: "${shortAddress}"`);
                 coordinates = await fetchCoordinates(shortAddress);
             }
        }

        if (coordinates) {
            return coordinates;
        } else {
            // Only throw error if ALL 3 attempts fail
            throw new Error('Unable to fetch coordinates'); 
        }

    } catch (error) {
        console.error("Coordinate Error:", error.message);
        throw error;
    }
}

// 👇 STANDARD: Distance & Time Calculation
module.exports.getDistanceTime = async (origin, destination) => {
    if (!origin || !destination) {
        throw new Error('Origin and destination are required');
    }

    try {
        // These calls now use the smart retry logic above
        const originCoords = await module.exports.getAddressCoordinate(origin);
        const destCoords = await module.exports.getAddressCoordinate(destination);

        const originStr = `${originCoords.lng},${originCoords.lat}`;
        const destStr = `${destCoords.lng},${destCoords.lat}`;

        const url = `http://router.project-osrm.org/route/v1/driving/${originStr};${destStr}?overview=false`;

        const response = await axios.get(url);

        if (response.data.routes && response.data.routes.length > 0) {
            const route = response.data.routes[0];
            return {
                distance: {
                    text: `${(route.distance / 1000).toFixed(1)} km`,
                    value: route.distance
                },
                duration: {
                    text: `${Math.round(route.duration / 60)} mins`,
                    value: route.duration
                }
            };
        } else {
            throw new Error('No route found');
        }

    } catch (err) {
        console.error("Distance Error:", err.message);
        throw err;
    }
}

// 👇 STANDARD: AutoComplete Suggestions
module.exports.getAutoCompleteSuggestions = async (input) => {
    if (!input) {
        throw new Error('query is required');
    }

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(input)}&format=json&limit=5`;

    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'UberCloneApp/1.0'
            }
        });

        if (response.data) {
            return response.data.map(item => ({
                description: item.display_name,
                place_id: item.place_id
            }));
        } else {
            throw new Error('Unable to fetch suggestions');
        }
    } catch (err) {
        console.error(err);
        throw err;
    }
}

module.exports.getCaptainsInTheRadius = async (ltd, lng, radius) => {
    const captains = await captainModel.find({
        location: {
            $geoWithin: {
                $centerSphere: [ [ ltd, lng ], radius / 6371 ]
            }
        }
    });
    return captains;
}