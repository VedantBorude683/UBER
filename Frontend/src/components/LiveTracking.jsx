import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import L from 'leaflet';
import 'leaflet-routing-machine';

// Fix for default Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// 👇 Helper component to move the map
const MapUpdater = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.flyTo([position.lat, position.lng], 16);
        }
    }, [position, map]);
    return null;
};

// 👇 UPDATED: Routing Control that calculates Time & Distance
const RoutingControl = ({ pickup, destination, setTripDetails }) => {
    const map = useMap();
    const routingControlRef = useRef(null);

    useEffect(() => {
        if (!map || !pickup || !destination) return;

        // Create the routing control
        const routingControl = L.Routing.control({
            waypoints: [
                L.latLng(pickup.lat, pickup.lng),
                L.latLng(destination.lat, destination.lng)
            ],
            routeWhileDragging: false,
            show: false, // Hide the default text directions box
            addWaypoints: false,
            fitSelectedRoutes: true, // Auto-zoom to fit the path
            lineOptions: {
                styles: [{ color: 'blue', weight: 4, opacity: 0.7 }]
            }
        });

        // 👇 LISTENER: When route is found, update the badge state
        routingControl.on('routesfound', function(e) {
            const routes = e.routes;
            const summary = routes[0].summary;
            
            // Convert to readable format
            const distanceKm = (summary.totalDistance / 1000).toFixed(1);
            const timeMin = Math.round(summary.totalTime / 60);

            // Update parent state to show the badge
            setTripDetails({
                distance: `${distanceKm} km`,
                time: `${timeMin} min`
            });
        });

        routingControl.addTo(map);
        routingControlRef.current = routingControl;

        return () => {
            // Safe cleanup to prevent crashes
            try {
                if (map && routingControlRef.current) {
                    map.removeControl(routingControlRef.current);
                }
            } catch (error) {
                // Ignore cleanup errors
            }
        };
    }, [map, pickup, destination, setTripDetails]);

    return null;
};

const LiveTracking = ({ pickupPosition, destinationPosition }) => {
    const [currentPosition, setCurrentPosition] = useState({
        lat: 18.5204,
        lng: 73.8567
    });

    // 👇 State to store the calculated trip info (Duration & Dist)
    const [tripDetails, setTripDetails] = useState(null);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            setCurrentPosition({
                lat: latitude,
                lng: longitude
            });
        });
    }, []);

    // Reset details if the route is cleared (e.g., user cancels)
    useEffect(() => {
        if (!pickupPosition || !destinationPosition) {
            setTripDetails(null);
        }
    }, [pickupPosition, destinationPosition]);

    const activePosition = pickupPosition || destinationPosition || currentPosition;

    return (
        <div className="relative h-full w-full">
            
            {/* 👇 FLOATING BADGE: Appears only when a route is found */}
            {tripDetails && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[999] bg-white px-6 py-2 rounded-full shadow-lg flex items-center gap-4 min-w-[200px] justify-center border border-gray-200">
                    <div className='flex items-center gap-2'>
                        <i className="ri-time-line text-lg font-bold text-black"></i>
                        <span className="font-bold text-xl text-black">{tripDetails.time}</span>
                    </div>
                    <div className='h-6 w-[1px] bg-gray-300'></div>
                    <div className='flex items-center gap-2'>
                        <i className="ri-map-pin-distance-fill text-lg font-bold text-black"></i>
                        <span className="font-bold text-xl text-black">{tripDetails.distance}</span>
                    </div>
                </div>
            )}

            <MapContainer 
                center={currentPosition} 
                zoom={15} 
                scrollWheelZoom={true}
                touchZoom={true}
                dragging={true}
                zoomControl={false}
                className="h-full w-full"
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                />
                
                {/* Markers */}
                <Marker position={currentPosition}>
                    <Popup>You are here</Popup>
                </Marker>

                {pickupPosition && (
                    <Marker position={pickupPosition}>
                        <Popup>Pickup Location</Popup>
                    </Marker>
                )}

                {destinationPosition && (
                    <Marker position={destinationPosition}>
                        <Popup>Destination</Popup>
                    </Marker>
                )}

                {/* Map Helpers */}
                <MapUpdater position={activePosition} />
                
                {/* Route Logic */}
                {pickupPosition && destinationPosition && (
                    <RoutingControl 
                        pickup={pickupPosition} 
                        destination={destinationPosition} 
                        setTripDetails={setTripDetails} // Pass setter to routing control
                    />
                )}
            </MapContainer>
        </div>
    );
};

export default LiveTracking;