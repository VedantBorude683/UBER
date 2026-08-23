import React, { useState, useEffect, useContext } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { SocketContext } from '../context/SocketContext'
import LiveTracking from '../components/LiveTracking'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const Riding = () => {
    const location = useLocation()
    const { ride } = location.state || {}
    const { socket } = useContext(SocketContext)
    const navigate = useNavigate()

    const [paymentMethod, setPaymentMethod] = useState('cash')
    const [paymentDone, setPaymentDone] = useState(false)
    const [showTripSummary, setShowTripSummary] = useState(false)
    const [rating, setRating] = useState(0)
    const [captainLocation, setCaptainLocation] = useState(null)
    const [pickupPosition, setPickupPosition] = useState(null)
    const [destinationPosition, setDestinationPosition] = useState(null)

    useEffect(() => {
        if (!ride?.pickup || !ride?.destination) return

        const getCoordinates = async (address) => {
            const response = await axios.get(
                `https://api.tomtom.com/search/2/geocode/${encodeURIComponent(address)}.json`,
                { params: { key: import.meta.env.VITE_TOMTOM_API_KEY, limit: 1 } }
            )
            const position = response.data.results?.[0]?.position
            return position ? { lat: position.lat, lng: position.lon } : null
        }

        Promise.all([getCoordinates(ride.pickup), getCoordinates(ride.destination)])
            .then(([pickup, destination]) => {
                setPickupPosition(pickup)
                setDestinationPosition(destination)
            })
            .catch((error) => console.error('Could not load trip route:', error))
    }, [ride?.pickup, ride?.destination])

    useEffect(() => {
        if (!socket) return;

        socket.on('ride-ended', (rideData) => {
            setShowTripSummary(true)
        })

        socket.on('live-tracking-data', (loc) => {
            if (loc && loc.ltd != null && loc.lng != null) {
                setCaptainLocation({ lat: loc.ltd, lng: loc.lng })
            }
        })

        return () => {
            socket.off('ride-ended')
            socket.off('live-tracking-data')
        }
    }, [socket, navigate])

    const handlePayment = () => {
        if (!socket || !ride?._id) return
        socket.emit('payment-made', { rideId: ride._id, method: paymentMethod })
        setPaymentDone(true)
    }

    const handleGoHome = () => {
        navigate('/home')
    }

    // Trip Summary Screen
    if (showTripSummary) {
        return (
            <div className='min-h-[100dvh] bg-white flex flex-col'>
                {/* Green Header */}
                <div className='bg-green-500 p-8 flex flex-col items-center text-white'>
                    <div className='w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3'>
                        <i className="ri-checkbox-circle-fill text-green-500 text-4xl"></i>
                    </div>
                    <h2 className='text-2xl font-bold'>Ride Complete!</h2>
                    <p className='text-green-100 text-sm mt-1'>You've arrived at your destination</p>
                </div>

                <div className='flex-1 p-6 overflow-y-auto'>
                    {/* Fare Summary */}
                    <div className='bg-gray-50 rounded-2xl p-5 mb-5'>
                        <h3 className='text-lg font-bold mb-4 text-gray-800'>Trip Summary</h3>
                        <div className='flex justify-between items-center mb-3'>
                            <div className='flex items-center gap-2'>
                                <i className="ri-map-pin-user-fill text-gray-500"></i>
                                <span className='text-sm text-gray-600 max-w-[180px] truncate'>{ride?.pickup}</span>
                            </div>
                        </div>
                        <div className='flex justify-between items-center mb-4'>
                            <div className='flex items-center gap-2'>
                                <i className="ri-map-pin-2-fill text-green-600"></i>
                                <span className='text-sm text-gray-600 max-w-[180px] truncate'>{ride?.destination}</span>
                            </div>
                        </div>
                        <div className='border-t pt-3 flex justify-between items-center'>
                            <span className='font-semibold text-gray-700'>Total Paid</span>
                            <span className='text-2xl font-bold text-green-600'>₹{ride?.fare}</span>
                        </div>
                        <div className='flex justify-between items-center mt-1'>
                            <span className='text-sm text-gray-500'>Via</span>
                            <span className='text-sm font-medium capitalize text-gray-700'>
                                {paymentDone ? paymentMethod : 'Cash'}
                            </span>
                        </div>
                    </div>

                    {/* Rate your captain */}
                    <div className='bg-gray-50 rounded-2xl p-5 mb-5'>
                        <h3 className='text-base font-bold mb-1 text-gray-800'>Rate your Captain</h3>
                        <p className='text-sm text-gray-500 mb-3 capitalize'>
                            {ride?.captain?.fullname?.firstname} {ride?.captain?.fullname?.lastname}
                        </p>
                        <div className='flex gap-2'>
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    className='text-3xl transition-transform active:scale-110'
                                >
                                    <i className={`ri-star-fill ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}></i>
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleGoHome}
                        className='w-full bg-black text-white font-bold p-4 rounded-xl text-lg'
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className='min-h-[100dvh] flex flex-col'>
            {/* Home button */}
            <Link
                to='/home'
                className='fixed right-4 top-4 h-10 w-10 bg-white flex items-center justify-center rounded-full shadow-md z-30'
            >
                <i className="text-lg font-medium ri-home-5-line"></i>
            </Link>

            {/* Map */}
            <div className='h-1/2'>
                <LiveTracking
                    pickupPosition={captainLocation || pickupPosition}
                    destinationPosition={destinationPosition}
                />
            </div>

            {/* Bottom Panel */}
            <div className='h-1/2 p-5 bg-white overflow-y-auto'>

                {/* Captain Info */}
                <div className='flex items-center justify-between mb-4'>
                    <img
                        className='h-12 rounded-lg'
                        src="https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg"
                        alt="Vehicle"
                    />
                    <div className='text-right'>
                        <h2 className='text-base font-medium capitalize'>{ride?.captain?.fullname?.firstname}</h2>
                        <h4 className='text-lg font-semibold -mt-1'>{ride?.captain?.vehicle?.plate}</h4>
                        <p className='text-xs text-gray-500 capitalize'>{ride?.captain?.vehicle?.vehicleType}</p>
                    </div>
                </div>

                {/* Ride Info */}
                <div className='border rounded-xl overflow-hidden mb-4'>
                    <div className='flex items-center gap-4 p-3 border-b bg-gray-50'>
                        <i className="ri-map-pin-2-fill text-green-600 text-lg"></i>
                        <div>
                            <p className='text-xs text-gray-500'>Destination</p>
                            <p className='text-sm font-medium'>{ride?.destination}</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-4 p-3'>
                        <i className="ri-money-rupee-circle-fill text-yellow-500 text-lg"></i>
                        <div>
                            <p className='text-xs text-gray-500'>Fare</p>
                            <p className='text-lg font-bold'>₹{ride?.fare}</p>
                        </div>
                    </div>
                </div>

                {/* Payment Section */}
                {!paymentDone ? (
                    <div>
                        <h4 className='text-sm font-semibold text-gray-700 mb-2'>Choose Payment Method</h4>
                        <div className='flex gap-3 mb-4'>
                            <button
                                onClick={() => setPaymentMethod('cash')}
                                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 font-medium text-sm transition-all ${
                                    paymentMethod === 'cash'
                                        ? 'border-black bg-black text-white'
                                        : 'border-gray-200 text-gray-700 hover:border-gray-400'
                                }`}
                            >
                                <i className="ri-money-rupee-circle-line"></i>
                                Cash
                            </button>
                            <button
                                onClick={() => setPaymentMethod('upi')}
                                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 font-medium text-sm transition-all ${
                                    paymentMethod === 'upi'
                                        ? 'border-purple-600 bg-purple-600 text-white'
                                        : 'border-gray-200 text-gray-700 hover:border-gray-400'
                                }`}
                            >
                                <i className="ri-smartphone-line"></i>
                                UPI
                            </button>
                        </div>

                        <button
                            onClick={handlePayment}
                            className='w-full bg-green-600 hover:bg-green-700 active:scale-95 transition-all text-white font-bold p-4 rounded-xl text-base shadow-md'
                        >
                            {paymentMethod === 'cash' ? (
                                <>Pay ₹{ride?.fare} in Cash</>
                            ) : (
                                <>Pay ₹{ride?.fare} via UPI</>
                            )}
                        </button>
                    </div>
                ) : (
                    <div className='flex flex-col items-center justify-center py-3 bg-green-50 rounded-xl border border-green-200'>
                        <div className='w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2'>
                            <i className="ri-checkbox-circle-fill text-green-600 text-2xl"></i>
                        </div>
                        <p className='font-semibold text-green-700 text-sm'>
                            Payment of ₹{ride?.fare} {paymentMethod === 'upi' ? 'via UPI' : 'in Cash'} confirmed!
                        </p>
                        <p className='text-xs text-gray-500 mt-1'>Waiting for ride to end...</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Riding
