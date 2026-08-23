import React, { useState, useEffect, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CaptainDetails from '../components/CaptainDetails'
import RidePopUp from '../components/RidePopUp'
import ConfirmRidePopUp from '../components/ConfirmRidePopUp'
import { SocketContext } from '../context/SocketContext'
import { CaptainDataContext } from '../context/CaptainContext'
import LiveTracking from '../components/LiveTracking'
import DriverBottomSheet from '../components/DriverBottomSheet'
import axios from 'axios'

const ACTIVE_RIDE_KEY = 'captain-active-ride'

const CaptainHome = () => {
    const [ridePopupPanel, setRidePopupPanel] = useState(false)
    const [confirmRidePopupPanel, setConfirmRidePopupPanel] = useState(false)
    const [ride, setRide] = useState(null)

    // Map coords: captain → user pickup
    const [mapPickup, setMapPickup] = useState(null)
    const [mapDestination, setMapDestination] = useState(null)

    const { socket } = useContext(SocketContext)
    const { captain } = useContext(CaptainDataContext)
    const navigate = useNavigate()

    const distanceToPickupMeters = (() => {
        if (!mapPickup || !mapDestination) return null
        const radians = (value) => value * Math.PI / 180
        const latDelta = radians(mapDestination.lat - mapPickup.lat)
        const lngDelta = radians(mapDestination.lng - mapPickup.lng)
        const a = Math.sin(latDelta / 2) ** 2 + Math.cos(radians(mapPickup.lat)) * Math.cos(radians(mapDestination.lat)) * Math.sin(lngDelta / 2) ** 2
        return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    })()
    const isAtPickup = distanceToPickupMeters !== null && distanceToPickupMeters <= 100

    // Join socket + emit location every 10s
    useEffect(() => {
        if (!captain?._id) return

        socket.emit('join', {
            userId: captain._id,
            userType: 'captain'
        })

        const updateLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(position => {
                    socket.emit('update-location-captain', {
                        userId: captain._id,
                        location: {
                            ltd: position.coords.latitude,
                            lng: position.coords.longitude
                        }
                    })
                })
            }
        }

        const locationInterval = setInterval(updateLocation, 10000)
        updateLocation()

        return () => clearInterval(locationInterval)
    }, [captain?._id])

    // Listen for new ride — MUST be in useEffect to avoid duplicate listeners
    useEffect(() => {
        if (!socket) return

        const handleNewRide = (data) => {
            setRide(data)
            setRidePopupPanel(true)
        }

        socket.on('new-ride', handleNewRide)

        return () => {
            socket.off('new-ride', handleNewRide)
        }
    }, [socket])

    // Helper: convert address → lat/lng
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

    const showPickupNavigation = async (activeRide) => {
        setRide(activeRide)
        setRidePopupPanel(false)
        setConfirmRidePopupPanel(false)
        const pickupCoords = await getCoordinates(activeRide.pickup)
        setMapDestination(pickupCoords)
    }

    // Refresh recovery: the API is authoritative. Stored data only keeps the
    // screen usable if the device briefly loses connectivity during reload.
    useEffect(() => {
        if (!captain?._id) return
        let cancelled = false

        const restoreActiveRide = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/active`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                })
                const activeRide = response.data.ride
                if (cancelled) return

                if (!activeRide) {
                    localStorage.removeItem(ACTIVE_RIDE_KEY)
                    return
                }

                localStorage.setItem(ACTIVE_RIDE_KEY, JSON.stringify(activeRide))
                if (activeRide.status === 'ongoing') {
                    navigate('/captain-riding', { replace: true, state: { ride: activeRide } })
                } else if (activeRide.status === 'accepted') {
                    await showPickupNavigation(activeRide)
                }
            } catch (error) {
                const cachedRide = JSON.parse(localStorage.getItem(ACTIVE_RIDE_KEY) || 'null')
                if (!cancelled && cachedRide?.status === 'accepted') await showPickupNavigation(cachedRide)
                console.warn('Could not verify active ride; using cached state if available.', error)
            }
        }

        restoreActiveRide()
        return () => { cancelled = true }
    }, [captain?._id])

    async function confirmRide() {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BASE_URL}/rides/confirm`,
                {
                    rideId: ride._id,
                    captainId: captain._id,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            )

            if (response.status === 200) {
                const confirmedRide = response.data
                localStorage.setItem(ACTIVE_RIDE_KEY, JSON.stringify(confirmedRide))
                await showPickupNavigation(confirmedRide)
            }
        } catch (error) {
            console.error('Confirm error', error)
        }
    }

    const cancelAcceptedRide = async () => {
        if (!ride || !window.confirm('Cancel this accepted ride?')) return
        try {
            await axios.post(`${import.meta.env.VITE_BASE_URL}/rides/cancel`, { rideId: ride._id }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            })
            localStorage.removeItem(ACTIVE_RIDE_KEY)
            setRide(null)
            setMapDestination(null)
            setMapPickup(null)
            setConfirmRidePopupPanel(false)
        } catch (error) {
            console.error('Cancel ride failed:', error)
            alert(error.response?.data?.message || 'Unable to cancel this ride')
        }
    }

    return (
        <div className='h-[100dvh] overflow-hidden bg-gray-100'>
            <div className='fixed p-4 sm:p-6 top-0 flex items-center justify-between w-full z-10'>
                <img
                    className='w-16'
                    src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png"
                    alt="Uber Logo"
                />
                <Link
                    to='/captain-home'
                    className='h-10 w-10 bg-white flex items-center justify-center rounded-full shadow-md'
                >
                    <i className="text-lg font-medium ri-logout-box-r-line"></i>
                </Link>
            </div>

            {/* While accepted, route from the captain's GPS position to pickup. */}
            <div className='h-full'>
                <LiveTracking
                    routeOrigin={mapPickup}
                    routeDestination={mapDestination}
                    destinationLabel='Pickup'
                    onLocationChange={mapDestination ? setMapPickup : undefined}
                />
            </div>

            {!ridePopupPanel && !confirmRidePopupPanel && !mapDestination && (
                <DriverBottomSheet initialSnap='peek'>
                    <CaptainDetails />
                </DriverBottomSheet>
            )}

            {!ridePopupPanel && !confirmRidePopupPanel && mapDestination && (
                <DriverBottomSheet initialSnap='peek'>
                    <div className='flex items-center justify-between gap-4 pb-2'>
                        <div>
                            <p className='text-lg font-bold'>Navigate to pickup</p>
                            <p className='text-sm text-gray-500'>{distanceToPickupMeters === null ? 'Locating you…' : `${Math.max(0, Math.round(distanceToPickupMeters))} m away`}</p>
                        </div>
                        <button
                            type='button'
                            disabled={!isAtPickup}
                            onClick={() => setConfirmRidePopupPanel(true)}
                            className='rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300'
                        >
                            {isAtPickup ? 'Enter OTP' : 'Arrive to unlock'}
                        </button>
                    </div>
                    <button type='button' onClick={cancelAcceptedRide} className='mt-3 text-sm font-medium text-red-600'>Cancel ride</button>
                </DriverBottomSheet>
            )}

            {/* Ride Request Popup */}
            {ridePopupPanel && (
            <DriverBottomSheet initialSnap='expanded'>
                <RidePopUp
                    ride={ride}
                    setRidePopupPanel={setRidePopupPanel}
                    setConfirmRidePopupPanel={setConfirmRidePopupPanel}
                    confirmRide={confirmRide}
                />
            </DriverBottomSheet>
            )}

            {/* Confirm Ride Popup (OTP entry) */}
            {confirmRidePopupPanel && (
            <DriverBottomSheet initialSnap='expanded'>
                <ConfirmRidePopUp
                    ride={ride}
                    setConfirmRidePopupPanel={setConfirmRidePopupPanel}
                    setRidePopupPanel={setRidePopupPanel}
                />
            </DriverBottomSheet>
            )}
        </div>
    )
}

export default CaptainHome
