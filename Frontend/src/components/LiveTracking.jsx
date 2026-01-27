import React, { useEffect, useRef, useState } from 'react';
import tt from '@tomtom-international/web-sdk-maps';
import { services } from '@tomtom-international/web-sdk-services';

const apiKey = import.meta.env.VITE_TOMTOM_API_KEY;

const LiveTracking = ({ pickupPosition, destinationPosition, onCancel }) => {
    const mapElement = useRef(null);
    const mapInstance = useRef(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    
    // Store Pickup/Dest markers here to delete them easily later
    const markersRef = useRef([]);

    // 1. Initialize Map & User Location (Blue Dot Logic)
    useEffect(() => {
        if (!mapElement.current || mapInstance.current) return;

        const defaultLocation = [73.8567, 18.5204]; // Pune Default

        const map = tt.map({
            key: apiKey,
            container: mapElement.current,
            center: defaultLocation, 
            zoom: 15,
            theme: {
                style: 'main',
                layer: 'basic',
                source: 'vector',
            }
        });

        mapInstance.current = map;

        map.on('load', () => {
            setMapLoaded(true);
            map.addControl(new tt.NavigationControl());

            // --- BLUE DOT LOGIC ---
            
            // 1. Create the Marker Element
            const markerDiv = document.createElement('div');
            markerDiv.id = 'user-marker';
            markerDiv.style.width = '20px';
            markerDiv.style.height = '20px';
            markerDiv.style.backgroundColor = '#2563eb'; 
            markerDiv.style.borderRadius = '50%';
            markerDiv.style.border = '3px solid white';
            markerDiv.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';

            // 2. Add it to map IMMEDIATELY (at default location)
            const userMarker = new tt.Marker({ element: markerDiv })
                .setLngLat(defaultLocation)
                .addTo(map);

            // 3. Define function to update position
            const updateLocation = (position) => {
                const { latitude, longitude } = position.coords;
                if(!latitude || !longitude) return;

                // Move map center and marker to real location
                map.setCenter([longitude, latitude]);
                userMarker.setLngLat([longitude, latitude]);
            };

            const handleError = (error) => {
                console.warn("Location error, staying at default.");
            };

            // 4. Ask browser for real location
            navigator.geolocation.getCurrentPosition(updateLocation, handleError, {
                enableHighAccuracy: false, 
                timeout: 5000, 
                maximumAge: Infinity 
            });
        });

        return () => {
            map.remove();
            setMapLoaded(false);
            mapInstance.current = null;
        };
    }, []);

    // 2. Handle Routing (Pickup -> Destination)
    useEffect(() => {
        if (!mapLoaded || !mapInstance.current) return;
        const map = mapInstance.current;

        // --- CLEANUP ---
        // 1. Remove Route Line
        if (map.getLayer('route')) {
            map.removeLayer('route');
            map.removeSource('route');
        }

        // 2. Remove Old Pickup/Dest Markers (using Ref)
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = []; // Reset array

        // --- VALIDATION ---
        const hasValidPickup = pickupPosition && pickupPosition.lat && pickupPosition.lng;
        const hasValidDest = destinationPosition && destinationPosition.lat && destinationPosition.lng;

        if (!hasValidPickup || !hasValidDest) {
            return; // Stop here if data is missing
        }

        // --- DRAW NEW MARKERS ---
        const pickupMarker = new tt.Marker({ color: 'black' })
            .setLngLat([pickupPosition.lng, pickupPosition.lat])
            .setPopup(new tt.Popup({ offset: 35 }).setHTML("<b>Pickup</b>"))
            .addTo(map);
        
        const destMarker = new tt.Marker({ color: '#22c55e' })
            .setLngLat([destinationPosition.lng, destinationPosition.lat])
            .setPopup(new tt.Popup({ offset: 35 }).setHTML("<b>Dropoff</b>"))
            .addTo(map);

        // Store in ref for next cleanup
        markersRef.current.push(pickupMarker);
        markersRef.current.push(destMarker);

        // --- FIT MAP BOUNDS ---
        const bounds = new tt.LngLatBounds();
        bounds.extend([pickupPosition.lng, pickupPosition.lat]);
        bounds.extend([destinationPosition.lng, destinationPosition.lat]);
        map.fitBounds(bounds, { padding: 100, duration: 1000 });

        // --- CALCULATE ROUTE ---
        services.calculateRoute({
            key: apiKey,
            locations: [
                [pickupPosition.lng, pickupPosition.lat],
                [destinationPosition.lng, destinationPosition.lat]
            ],
            traffic: true
        })
        .then((response) => {
            const geojson = response.toGeoJson();
            map.addLayer({
                id: 'route',
                type: 'line',
                source: { type: 'geojson', data: geojson },
                paint: { 'line-color': '#2563eb', 'line-width': 6, 'line-opacity': 0.8 }
            });
        })
        .catch(err => console.error("Route calculation failed:", err));

    }, [mapLoaded, pickupPosition, destinationPosition]);

    return (
        <div className="h-full w-full relative overflow-hidden">
            <div ref={mapElement} className="h-full w-full" />

            {/* Cancel Button */}
            {pickupPosition && destinationPosition && (
                 <button 
                    onClick={() => {
                        if (onCancel) onCancel();
                    }}
                    className="absolute top-10 right-4 bg-white p-3 rounded-full shadow-lg hover:bg-red-50 transition-colors z-50 flex items-center justify-center border border-gray-200"
                 >
                    <i className="ri-close-line text-xl font-bold text-red-600"></i>
                 </button>
            )}
        </div>
    );
};

export default LiveTracking;