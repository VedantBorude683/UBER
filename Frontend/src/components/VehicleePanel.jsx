import React from 'react';
import { vehicleImages } from '../assets/vehicleImages';

const VehiclePanel = (props) => {
    return (
        <div className='h-full flex flex-col justify-between'>
            {/* --- Drag Handle & Header --- */}
            <div>
                <div 
                    onClick={() => props.setVehiclePanelOpen(false)} 
                    className='w-full flex justify-center py-2 cursor-pointer'
                >
                    <div className='w-12 h-1.5 bg-gray-300 rounded-full'></div>
                </div>
                
                <h3 className='text-2xl font-bold mb-5 px-3'>Choose a Ride</h3>
            </div>

            {/* --- Vehicle Options List --- */}
            <div className='flex-1 overflow-y-auto px-3 pb-6 space-y-3 no-scrollbar'>
                
                {/* 🚗 OPTION 1: UberGo */}
                <div 
                    onClick={() => {
                        props.setConfirmRidePanelOpen(true);
                        props.selectVehicle('car');
                    }} 
                    className='flex items-center justify-between w-full p-3 border-2 border-transparent active:border-black hover:border-black bg-gray-50 hover:bg-white rounded-xl cursor-pointer transition-all duration-200 active:scale-[0.98]'
                >
                    {/* Image */}
                    <img className='h-12 w-20 object-contain' src={vehicleImages.car} alt="UberGo" />
                    
                    {/* Details */}
                    <div className='flex-1 px-4'>
                        <h4 className='font-bold text-lg flex items-center gap-2'>
                            UberGo 
                            <span className='flex items-center text-xs font-normal text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full'>
                                <i className="ri-user-3-fill text-xs mr-1"></i>4
                            </span>
                        </h4>
                        <h5 className='text-sm font-medium text-black'>2 mins away</h5>
                        <p className='text-xs text-gray-500 leading-tight'>Affordable, compact rides</p>
                    </div>
                    
                    {/* Price */}
                    <h2 className='text-xl font-bold text-black'>₹{props.fare.car}</h2>
                </div>

                {/* 🏍️ OPTION 2: Moto */}
                <div 
                    onClick={() => {
                        props.setConfirmRidePanelOpen(true);
                        props.selectVehicle('moto');
                    }} 
                    className='flex items-center justify-between w-full p-3 border-2 border-transparent active:border-black hover:border-black bg-gray-50 hover:bg-white rounded-xl cursor-pointer transition-all duration-200 active:scale-[0.98]'
                >
                    <img className='h-12 w-20 object-contain' src={vehicleImages.moto} alt="Moto" />
                    
                    <div className='flex-1 px-4'>
                        <h4 className='font-bold text-lg flex items-center gap-2'>
                            Moto 
                            <span className='flex items-center text-xs font-normal text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full'>
                                <i className="ri-user-3-fill text-xs mr-1"></i>1
                            </span>
                        </h4>
                        <h5 className='text-sm font-medium text-black'>3 mins away</h5>
                        <p className='text-xs text-gray-500 leading-tight'>Affordable motorcycle rides</p>
                    </div>
                    
                    <h2 className='text-xl font-bold text-black'>₹{props.fare.moto}</h2>
                </div>

                {/* 🛺 OPTION 3: Auto */}
                <div 
                    onClick={() => {
                        props.setConfirmRidePanelOpen(true);
                        props.selectVehicle('auto');
                    }} 
                    className='flex items-center justify-between w-full p-3 border-2 border-transparent active:border-black hover:border-black bg-gray-50 hover:bg-white rounded-xl cursor-pointer transition-all duration-200 active:scale-[0.98]'
                >
                    <img className='h-12 w-20 object-contain' src={vehicleImages.auto} alt="Auto" />
                    
                    <div className='flex-1 px-4'>
                        <h4 className='font-bold text-lg flex items-center gap-2'>
                            UberAuto 
                            <span className='flex items-center text-xs font-normal text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full'>
                                <i className="ri-user-3-fill text-xs mr-1"></i>3
                            </span>
                        </h4>
                        <h5 className='text-sm font-medium text-black'>3 mins away</h5>
                        <p className='text-xs text-gray-500 leading-tight'>No bargaining, doorstep pick</p>
                    </div>
                    
                    <h2 className='text-xl font-bold text-black'>₹{props.fare.auto}</h2>
                </div>
            </div>
        </div>
    );
}

export default VehiclePanel;