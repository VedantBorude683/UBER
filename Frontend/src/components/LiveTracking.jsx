import React, { useState, useEffect } from 'react';
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
const RoutingControl = ({ pickup, destination }) => {
    const map = useMap();

    useEffect(() => {
        if (!map || !pickup || !destination) return;

        const routingControl = L.Routing.control({
            waypoints: [
                L.latLng(pickup.lat, pickup.lng),
                L.latLng(destination.lat, destination.lng)
            ],
            routeWhileDragging: false,
            show: false, // Hide the text instructions
            addWaypoints: false, // Disable adding stops
            fitSelectedRoutes: true, // Auto-zoom to fit the path
            lineOptions: {
                styles: [{ color: 'blue', weight: 4, opacity: 0.7 }] // 👈 BLUE PATH
            }
        }).addTo(map);

        return () => map.removeControl(routingControl);
    }, [map, pickup, destination]);

    return null;
};

const LiveTracking = ({ pickupPosition, destinationPosition }) => {
    const [ currentPosition, setCurrentPosition ] = useState({
        lat: 18.5204,
        lng: 73.8567
    });

    useEffect(() => {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            setCurrentPosition({
                lat: latitude,
                lng: longitude
            });
        });
    }, []);

    // Prioritize showing pickup, then destination, then current location
    const activePosition = pickupPosition || destinationPosition || currentPosition;

    return (
        <MapContainer 
            center={currentPosition} 
    zoom={15} 
    // 👇 THESE ARE CRITICAL
    scrollWheelZoom={true} // Allows mouse wheel to zoom map
    touchZoom={true}       // Allows pinch to zoom map
    dragging={true}
    zoomControl={false}    // We usually hide the +/- buttons for a cleaner look
    className="h-full w-full"
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* Show Current Location */}
            <Marker position={currentPosition}>
                <Popup>You are here</Popup>
            </Marker>

            {/* Show Pickup Location */}
            {pickupPosition && (
                <Marker position={pickupPosition}>
                    <Popup>Pickup Location</Popup>
                </Marker>
            )}

            {/* Show Destination Location */}
            {destinationPosition && (
                <Marker position={destinationPosition}>
                    <Popup>Destination</Popup>
                </Marker>
            )}

            {/* Component to trigger map movement */}
            <MapUpdater position={activePosition} />
            {pickupPosition && destinationPosition && (
                <RoutingControl pickup={pickupPosition} destination={destinationPosition} />
            )}
        </MapContainer>
    );
};

export default LiveTracking;