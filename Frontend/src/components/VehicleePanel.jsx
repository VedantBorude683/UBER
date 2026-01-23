import React from 'react'

const VehiclePanel = (props) => {
    return (
        <div>
            <h3 className='text-2xl font-semibold mb-5'>Choose a Vehicle</h3>
            
            {/* Ride Option 1: UberGo */}
            <div onClick={() => {
                props.setConfirmRidePanelOpen(true)
                props.setVehiclePanelOpen(false) // Close this panel
            }} className='flex border-2 active:border-black mb-2 rounded-xl w-full p-3  items-center justify-between'>
                <img className='h-10' src="https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg" alt="" />
                <div className='ml-2 w-1/2'>
                    <h4 className='font-medium text-base'>UberGo <span><i className="ri-user-3-fill"></i>4</span></h4>
                    <h5 className='font-medium text-sm'>2 mins away </h5>
                    <p className='font-normal text-xs text-gray-600'>Affordable, compact rides</p>
                </div>
                <h2 className='text-lg font-semibold'>₹193.20</h2>
            </div>

            {/* Ride Option 2: Moto */}
            <div onClick={() => {
                props.setConfirmRidePanelOpen(true)
                props.setVehiclePanelOpen(false)
            }} className='flex border-2 active:border-black mb-2 rounded-xl w-full p-3  items-center justify-between'>
                <img className='h-10' src="https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_368,w_552/v1648431773/assets/1d/96d826-c481-4397-82c5-fa2821247223/original/Uber_Moto.png" alt="" />
                <div className='-ml-2 w-1/2'>
                    <h4 className='font-medium text-base'>Moto <span><i className="ri-user-3-fill"></i>1</span></h4>
                    <h5 className='font-medium text-sm'>3 mins away </h5>
                    <p className='font-normal text-xs text-gray-600'>Affordable motorcycle rides</p>
                </div>
                <h2 className='text-lg font-semibold'>₹65</h2>
            </div>

            {/* Ride Option 3: Auto */}
            <div onClick={() => {
                props.setConfirmRidePanelOpen(true)
                props.setVehiclePanelOpen(false)
            }} className='flex border-2 active:border-black mb-2 rounded-xl w-full p-3  items-center justify-between'>
                <img className='h-10' src="https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_368,w_552/v1648177797/assets/fc/4e78a6-13e7-49ee-8ef5-158e5d263f29/original/Uber_Auto.png" alt="" />
                <div className='ml-2 w-1/2'>
                    <h4 className='font-medium text-base'>UberAuto <span><i className="ri-user-3-fill"></i>3</span></h4>
                    <h5 className='font-medium text-sm'>3 mins away </h5>
                    <p className='font-normal text-xs text-gray-600'>Affordable Auto rides</p>
                </div>
                <h2 className='text-lg font-semibold'>₹118.21</h2>
            </div>
        </div>
    )
}

export default VehiclePanel