import React from 'react';

const ConfirmRide = (props) => {
    return (
        <div className='flex max-h-[82vh] flex-col overflow-y-auto bg-white'>
            {/* Header */}
            <div>
                <h5 className='flex cursor-pointer justify-center py-1' onClick={() => {
                    props.setConfirmRidePanelOpen(false);
                }}>
                    <i className="text-2xl text-gray-400 ri-arrow-down-wide-line"></i>
                </h5>
                <h3 className='border-b px-5 pb-3 text-xl font-bold'>Confirm your Ride</h3>
            </div>

            {/* Vehicle & Ride Details */}
            <div className='flex flex-col items-center px-4'>
                
                {/* 1. Dynamic Vehicle Image */}
                <img className='h-24 object-contain py-2' 
                    src={
                        props.vehicleType === 'car' ? "https://www.pngplay.com/wp-content/uploads/8/Uber-PNG-Photos.png" :
                        props.vehicleType === 'moto' ? "https://cn-geo1.uber.com/image-proc/crop/resizecrop/udam/format=auto/width=552/height=368/srcb64=aHR0cHM6Ly90Yi1zdGF0aWMudWJlci5jb20vcHJvZC91ZGFtLWFzc2V0cy8yYzdmYTE5NC1jOTU0LTQ5YjItOWM2ZC1hM2I4NjAxMzcwZjUucG5n" :
                        "https://cn-geo1.uber.com/image-proc/crop/resizecrop/udam/format=auto/width=552/height=368/srcb64=aHR0cHM6Ly90Yi1zdGF0aWMudWJlci5jb20vcHJvZC91ZGFtLWFzc2V0cy8xZGRiOGM1Ni0wMjA0LTRjZTQtODFjZS01NmExMWEwN2ZlOTgucG5n"
                    } 
                    alt="Vehicle" 
                />

                <div className='mt-1 w-full'>
                    
                    {/* 2. Pickup Location */}
                    <div className='flex items-center gap-4 border-b border-gray-100 p-3'>
                        <i className="ri-map-pin-user-fill text-lg text-black"></i>
                        <div className='flex-1'>
                            <h3 className='text-lg font-bold text-gray-800'>Pickup</h3>
                            <p className='text-sm text-gray-500 leading-snug'>{props.pickup}</p>
                        </div>
                    </div>

                    {/* 3. Destination Location */}
                    <div className='flex items-center gap-4 border-b border-gray-100 p-3'>
                        <i className="ri-map-pin-2-fill text-lg text-black"></i>
                        <div className='flex-1'>
                            <h3 className='text-lg font-bold text-gray-800'>Destination</h3>
                            <p className='text-sm text-gray-500 leading-snug'>{props.destination}</p>
                        </div>
                    </div>

                    {/* 4. Fare Price */}
                    <div className='flex items-center gap-4 p-3'>
                        <i className="ri-currency-line text-lg text-black"></i>
                        <div>
                            <h3 className='text-xl font-bold text-gray-800'>₹{props.fare[props.vehicleType]}</h3>
                            <p className='text-sm text-gray-500'>Cash / UPI</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirm Button */}
            <div className='p-4 pb-2'>
                <button onClick={() => {
                    props.createRide();
                    props.setVehicleFound(true);
                    props.setConfirmRidePanelOpen(false);
                }} className='w-full bg-green-600 text-white font-bold text-lg p-3 rounded-xl shadow-lg active:scale-95 transition-transform'>
                    Confirm Ride
                </button>
            </div>
        </div>
    );
}

export default ConfirmRide;