import React from 'react'
//looking for the driver popup to accept or reject the ride
const getPassengerFirstName = (ride) => ride && ride.user && ride.user.fullname && ride.user.fullname.firstname || 'Passenger'
const getPassengerLastName = (ride) => ride && ride.user && ride.user.fullname && ride.user.fullname.lastname || ''
const getPassengerInitial = (ride) => getPassengerFirstName(ride).charAt(0).toUpperCase()

const RidePopUp = (props) => {
    return (
        <div>
            <h3 className='text-2xl font-semibold mb-5'>New Ride Available!</h3>
            <div className='flex items-center justify-between p-3 bg-yellow-400 rounded-lg mt-4'>
                <div className='flex items-center gap-3 '>
                    <div className='flex h-12 w-12 items-center justify-center rounded-full bg-gray-900 text-lg font-bold text-white'>
                        {getPassengerInitial(props.ride)}
                    </div>
                    <h2 className='text-lg font-medium'>
                        {getPassengerFirstName(props.ride)} {getPassengerLastName(props.ride)}
                    </h2>
                </div>
                <h5 className='text-lg font-semibold'>{props.ride?.distance} KM</h5>
            </div>
            <div className='flex gap-2 justify-between flex-col items-center'>
                <div className='w-full mt-5'>
                    <div className='flex items-center gap-5 p-3 border-b-2'>
                        <i className="ri-map-pin-user-fill"></i>
                        <div>
                            <h3 className='text-lg font-medium'>{props.ride?.pickup}</h3>
                            <p className='text-sm -mt-1 text-gray-600'>{props.ride?.pickupAddress}</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-5 p-3 border-b-2'>
                        <i className="text-lg ri-map-pin-2-fill"></i>
                        <div>
                            <h3 className='text-lg font-medium'>{props.ride?.destination}</h3>
                            <p className='text-sm -mt-1 text-gray-600'>{props.ride?.destinationAddress}</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-5 p-3'>
                        <i className="ri-currency-line"></i>
                        <div>
                            <h3 className='text-lg font-medium'>₹{props.ride?.fare}</h3>
                            <p className='text-sm -mt-1 text-gray-600'>Cash</p>
                        </div>
                    </div>
                </div>
                <div className='mt-5 w-full '>
                    <button onClick={() => {
                        props.confirmRide()
                    }} className=' bg-green-600 w-full text-white font-semibold p-2 px-10 rounded-lg'>Accept</button>

                    <button onClick={() => {
                        props.setRidePopupPanel(false)
                    }} className='mt-2 w-full bg-gray-300 text-gray-700 font-semibold p-2 px-10 rounded-lg'>Ignore</button>
                </div>
            </div>
        </div>
    )
}

export default RidePopUp
