import React, { useEffect, useRef, useState } from 'react';

const apiKey = import.meta.env.VITE_TOMTOM_API_KEY;
const tt = window.tt;

const LiveTracking = ({ pickupPosition, destinationPosition, onCancel, routeOrigin, routeDestination, destinationLabel = 'Destination', onLocationChange }) => {
    const mapElement = useRef(null);
    const mapInstance = useRef(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [mapError, setMapError] = useState(false);
    
    // Store Pickup/Dest markers here to delete them easily later
    const markersRef = useRef([]);
    const driverMarkerRef = useRef(null);
    const currentLocationRef = useRef(null);
    const watchIdRef = useRef(null);
    const onLocationChangeRef = useRef(onLocationChange);

    useEffect(() => {
        onLocationChangeRef.current = onLocationChange;
    }, [onLocationChange]);

    // 1. Initialize Map & User Location (Blue Dot Logic)
    useEffect(() => {
        if (!mapElement.current || mapInstance.current) return;

        if (!apiKey?.trim()) {
            console.error('TomTom map key is missing. Set VITE_TOMTOM_API_KEY in the deployment environment.');
            setMapError(true);
            return;
        }

        const defaultLocation = [73.8567, 18.5204]; // Pune Default

        let map;
        try {
            if (!tt) throw new Error('TomTom Maps SDK did not load.');
            map = tt.map({
                key: apiKey.trim(),
                container: mapElement.current,
                center: defaultLocation,
                zoom: 15
            });
        } catch (error) {
            console.error('TomTom map failed to initialize:', error);
            setMapError(true);
            return;
        }

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
            driverMarkerRef.current = userMarker;

            // 3. Define function to update position
            const updateLocation = (position) => {
                const { latitude, longitude } = position.coords;
                if(!latitude || !longitude) return;

                // Move map center and marker to real location
                map.setCenter([longitude, latitude]);
                userMarker.setLngLat([longitude, latitude]);
                currentLocationRef.current = { lat: latitude, lng: longitude };
                onLocationChangeRef.current?.({ lat: latitude, lng: longitude });
            };

            const handleError = () => {
                console.warn("Location error, staying at default.");
            };

            // 4. Ask browser for real location
            navigator.geolocation.getCurrentPosition(updateLocation, handleError, {
                enableHighAccuracy: false, 
                timeout: 5000, 
                maximumAge: Infinity 
            });
            watchIdRef.current = navigator.geolocation.watchPosition(updateLocation, handleError, {
                enableHighAccuracy: true,
                maximumAge: 5000,
                timeout: 10000
            });
        });

        return () => {
            if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
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
        // `routeOrigin`/`routeDestination` are the driver-navigation API. The
        // legacy props remain supported for the passenger screens.
        const origin = routeOrigin || pickupPosition;
        const destination = routeDestination || destinationPosition;
        const hasValidPickup = origin && origin.lat != null && origin.lng != null;
        const hasValidDest = destination && destination.lat != null && destination.lng != null;

        if (!hasValidPickup || !hasValidDest) {
            return; // Stop here if data is missing
        }

        // --- DRAW NEW MARKERS ---
        const pickupMarker = new tt.Marker({ color: 'black' })
            .setLngLat([origin.lng, origin.lat])
            .setPopup(new tt.Popup({ offset: 35 }).setHTML("<b>Pickup</b>"))
            .addTo(map);
        
        const destMarker = new tt.Marker({ color: '#22c55e' })
            .setLngLat([destination.lng, destination.lat])
            .setPopup(new tt.Popup({ offset: 35 }).setHTML(`<b>${destinationLabel}</b>`))
            .addTo(map);

        // Store in ref for next cleanup
        markersRef.current.push(pickupMarker);
        markersRef.current.push(destMarker);

        // --- FIT MAP BOUNDS ---
        const bounds = new tt.LngLatBounds();
        bounds.extend([origin.lng, origin.lat]);
        bounds.extend([destination.lng, destination.lat]);
        map.fitBounds(bounds, { padding: 100, duration: 1000 });

        // --- CALCULATE ROUTE ---
        const routeUrl = `https://api.tomtom.com/routing/1/calculateRoute/${origin.lat},${origin.lng}:${destination.lat},${destination.lng}/json?key=${encodeURIComponent(apiKey)}&traffic=true`;
        fetch(routeUrl)
        .then((response) => {
            if (!response.ok) throw new Error(`Route request failed: ${response.status}`);
            return response.json();
        })
        .then((response) => {
            const points = response.routes?.[0]?.legs?.[0]?.points || [];
            const geojson = {
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: points.map(point => [point.longitude, point.latitude])
                },
                properties: {}
            };
            map.addLayer({
                id: 'route',
                type: 'line',
                source: { type: 'geojson', data: geojson },
                paint: { 'line-color': '#2563eb', 'line-width': 6, 'line-opacity': 0.8 }
            });
        })
        .catch(err => console.error("Route calculation failed:", err));

    }, [mapLoaded, pickupPosition, destinationPosition, routeOrigin, routeDestination, destinationLabel]);

    return (
        <div className="h-full w-full relative overflow-hidden">
            <div ref={mapElement} className="h-full w-full" />
            {mapError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 px-6 text-center text-sm text-gray-600">
                    Map unavailable. Check the TomTom API key and reload the app.
                </div>
            )}

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
