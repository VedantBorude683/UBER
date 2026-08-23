import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { getAuthToken } from '../utils/authStorage'

const getPassengerFirstName = (ride) => ride && ride.user && ride.user.fullname && ride.user.fullname.firstname || 'Passenger'
const getPassengerInitial = (ride) => getPassengerFirstName(ride).charAt(0).toUpperCase()

const ConfirmRidePopUp = (props) => {
    const [ otp, setOtp ] = useState('')
    const navigate = useNavigate()

    const submitHandler = async (e) => {
        e.preventDefault()

        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/start-ride`, {
                params: {
                    rideId: props.ride._id,
                    otp: otp
                },
                headers: {
                    Authorization: `Bearer ${getAuthToken('captain')}`
                }
            })

            if (response.status === 200) {
                localStorage.setItem('captain-active-ride', JSON.stringify(response.data))
                props.setConfirmRidePopupPanel(false)
                props.setRidePopupPanel(false)
                navigate('/captain-riding', { replace: true, state: { ride: response.data } })
            }
        } catch (error) {
            console.error("Error starting ride:", error)
            alert("Invalid OTP or System Error") // Simple alert for feedback
        }
    }

    return (
        <div>
            <h3 className='text-2xl font-semibold mb-5'>Confirm this ride to Start</h3>

            {/* User Details */}
            <div className='flex items-center justify-between p-3 border-2 border-yellow-400 rounded-lg mt-4'>
                <div className='flex items-center gap-3 '>
                    <div className='flex h-12 w-12 items-center justify-center rounded-full bg-gray-900 text-lg font-bold text-white'>
                        {getPassengerInitial(props.ride)}
                    </div>
                    <h2 className='text-lg font-medium capitalize'>
                        {getPassengerFirstName(props.ride)}
                    </h2>
                </div>
                <h5 className='text-lg font-semibold'>{props.ride?.distance} KM</h5>
            </div>

            {/* Ride Details */}
            <div className='flex gap-2 justify-between flex-col items-center'>
                <div className='w-full mt-5'>
                    
                    {/* Pickup */}
                    <div className='flex items-center gap-5 p-3 border-b-2'>
                        <i className="ri-map-pin-user-fill"></i>
                        <div>
                            <h3 className='text-lg font-medium'>Pickup</h3>
                            <p className='text-sm -mt-1 text-gray-600'>{props.ride?.pickup}</p>
                        </div>
                    </div>
                    
                    {/* Destination */}
                    <div className='flex items-center gap-5 p-3 border-b-2'>
                        <i className="text-lg ri-map-pin-2-fill"></i>
                        <div>
                            <h3 className='text-lg font-medium'>Destination</h3>
                            <p className='text-sm -mt-1 text-gray-600'>{props.ride?.destination}</p>
                        </div>
                    </div>
                    
                    {/* Fare */}
                    <div className='flex items-center gap-5 p-3'>
                        <i className="ri-currency-line"></i>
                        <div>
                            <h3 className='text-lg font-medium'>₹{props.ride?.fare}</h3>
                            <p className='text-sm -mt-1 text-gray-600'>Cash</p>
                        </div>
                    </div>
                </div>

                {/* OTP Form */}
                <div className='mt-6 w-full'>
                    <form onSubmit={submitHandler}>
                        <input 
                            value={otp} 
                            onChange={(e) => setOtp(e.target.value)} 
                            type="text" 
                            className='bg-[#eee] px-6 py-4 font-mono text-lg rounded-lg w-full mt-3' 
                            placeholder='Enter OTP' 
                        />

                        <button className='w-full mt-5 text-lg flex justify-center bg-green-600 text-white font-semibold p-3 rounded-lg'>
                            Confirm
                        </button>
                        
                        <button onClick={(e) => {
                            e.preventDefault()
                            props.setConfirmRidePopupPanel(false)
                            props.setRidePopupPanel(false)
                        }} className='w-full mt-2 bg-gray-200 text-gray-800 font-semibold p-3 rounded-lg'>
                            Back to navigation
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ConfirmRidePopUp
