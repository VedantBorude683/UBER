import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { SocketContext } from '../context/SocketContext'

const FinishRide = (props) => {
    const navigate = useNavigate()
    const { socket } = useContext(SocketContext)
    const [paymentReceived, setPaymentReceived] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState(null)
    const [paymentAmount, setPaymentAmount] = useState(null)
    const [isEnding, setIsEnding] = useState(false)

    useEffect(() => {
        if (!socket) return

        const handler = (data) => {
            setPaymentReceived(true)
            setPaymentMethod(data.method)
            setPaymentAmount(data.amount)
        }

        socket.on('payment-confirmed', handler)

        return () => {
            socket.off('payment-confirmed', handler)
        }
    }, [socket])

    async function endRide() {
        if (isEnding) return
        setIsEnding(true)
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BASE_URL}/rides/end-ride`,
                { rideId: props.ride._id },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            )

            if (response.status === 200) {
                localStorage.removeItem('captain-active-ride')
                navigate('/captain-home', { replace: true })
            }
        } catch (error) {
            console.error('End ride error:', error)
            setIsEnding(false)
        }
    }

    return (
        <div>
            <h3 className='text-2xl font-semibold mb-4'>Finish this Ride</h3>

            {/* User Info */}
            <div className='flex items-center justify-between p-4 border-2 border-yellow-400 rounded-xl mb-4'>
                <div className='flex items-center gap-3'>
                    <img
                        className='h-12 w-12 rounded-full object-cover border-2 border-yellow-400'
                        src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                        alt="User"
                    />
                    <div>
                        <h2 className='text-lg font-semibold capitalize'>
                            {props.ride?.user?.fullname?.firstname} {props.ride?.user?.fullname?.lastname}
                        </h2>
                        <p className='text-sm text-gray-500'>Passenger</p>
                    </div>
                </div>
                <div className='text-right'>
                    <p className='text-xl font-bold text-green-600'>₹{props.ride?.fare}</p>
                    <p className='text-xs text-gray-500'>Fare</p>
                </div>
            </div>

            {/* Ride Details */}
            <div className='border rounded-xl overflow-hidden mb-4'>
                <div className='flex items-center gap-4 p-3 border-b bg-gray-50'>
                    <i className="ri-map-pin-user-fill text-gray-600"></i>
                    <div>
                        <p className='text-xs text-gray-500'>Pickup</p>
                        <p className='text-sm font-medium'>{props.ride?.pickup}</p>
                    </div>
                </div>
                <div className='flex items-center gap-4 p-3 border-b bg-gray-50'>
                    <i className="ri-map-pin-2-fill text-green-600"></i>
                    <div>
                        <p className='text-xs text-gray-500'>Destination</p>
                        <p className='text-sm font-medium'>{props.ride?.destination}</p>
                    </div>
                </div>
                <div className='flex items-center gap-4 p-3 bg-gray-50'>
                    <i className="ri-money-rupee-circle-fill text-yellow-500"></i>
                    <div>
                        <p className='text-xs text-gray-500'>Total Fare</p>
                        <p className='text-lg font-bold'>₹{props.ride?.fare}</p>
                    </div>
                </div>
            </div>

            {/* Payment Status */}
            {paymentReceived ? (
                <div className='flex items-center gap-3 p-4 bg-green-50 border border-green-300 rounded-xl mb-4'>
                    <div className='w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0'>
                        <i className="ri-checkbox-circle-fill text-green-600 text-2xl"></i>
                    </div>
                    <div>
                        <p className='font-bold text-green-700'>Payment Received! ✅</p>
                        <p className='text-sm text-green-600 capitalize'>
                            ₹{paymentAmount} via {paymentMethod}
                        </p>
                    </div>
                </div>
            ) : (
                <div className='flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-300 rounded-xl mb-4'>
                    <div className='w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin flex-shrink-0'></div>
                    <p className='text-sm text-yellow-700 font-medium'>
                        Waiting for passenger to pay...
                    </p>
                </div>
            )}

            {/* Finish Button */}
            <button
                onClick={endRide}
                disabled={isEnding}
                className={`w-full flex justify-center items-center gap-2 font-bold p-4 text-lg rounded-xl transition-all ${
                    isEnding
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'bg-green-600 hover:bg-green-700 active:scale-95 text-white shadow-md'
                }`}
            >
                {isEnding ? (
                    <>
                        <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                        Finishing...
                    </>
                ) : (
                    <>
                        <i className="ri-flag-2-fill"></i>
                        Finish Ride
                    </>
                )}
            </button>
        </div>
    )
}

export default FinishRide
