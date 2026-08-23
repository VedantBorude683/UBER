import React, { useRef, useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import FinishRide from '../components/FinishRide'
import LiveTracking from '../components/LiveTracking'
import DriverBottomSheet from '../components/DriverBottomSheet'
import axios from 'axios'

const CaptainRiding = () => {
    const [finishRidePanel, setFinishRidePanel] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()
    const [rideData, setRideData] = useState(location.state?.ride || null)

    // Map coords
    const [mapDestination, setMapDestination] = useState(null)
    const [driverPosition, setDriverPosition] = useState(null)
    const [distanceToDestination, setDistanceToDestination] = useState(null)
    const lastDistanceRequest = useRef(0)

    const getCoordinates = async (address) => {
        try {
            const apiKey = import.meta.env.VITE_TOMTOM_API_KEY
            const response = await axios.get(
                `https://api.tomtom.com/search/2/geocode/${encodeURIComponent(address)}.json?key=${apiKey}`
            )
            if (response.data.results && response.data.results.length > 0) {
                const { lat, lon } = response.data.results[0].position
                return { lat, lng: lon }
            }
        } catch (error) {
            console.error('Geocoding failed:', error)
        }
        return null
    }

    // Route state passed through React Router disappears on refresh. Recover it
    // from the current server-side ride before rendering the driving UI.
    useEffect(() => {
        if (rideData) return
        let cancelled = false

        const restoreOngoingRide = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/active`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                })
                const activeRide = response.data.ride
                if (cancelled) return
                if (activeRide?.status === 'ongoing') {
                    localStorage.setItem('captain-active-ride', JSON.stringify(activeRide))
                    setRideData(activeRide)
                } else {
                    navigate('/captain-home', { replace: true })
                }
            } catch (error) {
                const cachedRide = JSON.parse(localStorage.getItem('captain-active-ride') || 'null')
                if (!cancelled && cachedRide?.status === 'ongoing') setRideData(cachedRide)
                else if (!cancelled) navigate('/captain-home', { replace: true })
                console.warn('Could not restore ongoing ride.', error)
            }
        }

        restoreOngoingRide()
        return () => { cancelled = true }
    }, [rideData, navigate])

    useEffect(() => {
        if (!rideData) return

        const loadRoute = async () => {
            const destCoords = await getCoordinates(rideData.destination)
            setMapDestination(destCoords)
        }

        loadRoute()
    }, [rideData])

    // The map supplies live GPS updates; rate-limit the summary request so we
    // do not ask the routing API for every browser location event.
    const handleDriverLocation = async (position) => {
        setDriverPosition(position)
        if (!mapDestination || Date.now() - lastDistanceRequest.current < 15000) return
        lastDistanceRequest.current = Date.now()
            try {
                const apiKey = import.meta.env.VITE_TOMTOM_API_KEY
                const routeUrl = `https://api.tomtom.com/routing/1/calculateRoute/${position.lat},${position.lng}:${mapDestination.lat},${mapDestination.lng}/json?key=${apiKey}&traffic=true`
                const res = await axios.get(routeUrl)
                if (res.data.routes && res.data.routes.length > 0) {
                    const summary = res.data.routes[0].summary
                    setDistanceToDestination({
                        km: (summary.lengthInMeters / 1000).toFixed(1),
                        min: Math.ceil(summary.travelTimeInSeconds / 60)
                    })
                }
            } catch (e) {
                console.error('Distance calc failed:', e)
            }
    }

    return (
        <div className='h-[100dvh] relative overflow-hidden'>

            {/* Header */}
            <div className='fixed p-4 sm:p-6 top-0 flex items-center justify-between w-full z-10'>
                <img
                    className='w-16'
                    src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png"
                    alt="Uber"
                />
                <Link
                    to='/captain-home'
                    className='h-10 w-10 bg-white flex items-center justify-center rounded-full shadow-md'
                >
                    <i className="text-lg font-medium ri-logout-box-r-line"></i>
                </Link>
            </div>

            {/* Map Area */}
            <div className='h-full'>
                <LiveTracking
                    routeOrigin={driverPosition}
                    routeDestination={mapDestination}
                    destinationLabel='Drop-off'
                    onLocationChange={handleDriverLocation}
                />
            </div>

            {!finishRidePanel && <DriverBottomSheet initialSnap='peek'>
                <div className='flex items-center justify-between pb-2'>
                    <div>{distanceToDestination ? <><p className='text-lg font-bold'>{distanceToDestination.km} km · {distanceToDestination.min} min</p><p className='text-sm text-gray-500'>to drop-off</p></> : <p className='font-semibold'>Finding the best route…</p>}</div>
                    <button className='rounded-xl bg-green-600 px-4 py-3 font-semibold text-white' onClick={() => setFinishRidePanel(true)}>Complete ride</button>
                </div>
            </DriverBottomSheet>}

            {/* Finish Ride Panel */}
            {finishRidePanel && <DriverBottomSheet initialSnap='expanded'>
                <FinishRide
                    ride={rideData}
                    setFinishRidePanel={setFinishRidePanel}
                />
            </DriverBottomSheet>}
        </div>
    )
}

export default CaptainRiding
