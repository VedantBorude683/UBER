import React, { useContext } from 'react';
import { CaptainDataContext } from '../context/CaptainContext';

const CaptainDetails = () => {
    const { captain } = useContext(CaptainDataContext);
    const captainName = captain?.fullname
        ? `${captain.fullname.firstname || ''} ${captain.fullname.lastname || ''}`.trim()
        : 'Captain';

    return (
        <div className='bg-white rounded-2xl p-2'>
            {/* --- Profile Header --- */}
            <div className='flex items-center justify-between mb-6'>
                <div className='flex items-center justify-start gap-4'>
                    {/* Avatar with Online Status */}
                    <div className='relative'>
                        <img 
                            className='h-14 w-14 rounded-full object-cover border-2 border-white shadow-md' 
                            src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" 
                            alt="Profile" 
                        />
                        <div className='absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full'></div>
                    </div>
                    
                    <div>
                        <h4 className='text-xl font-bold capitalize text-gray-800 leading-tight'>
                            {captainName}
                        </h4>
                        <div className='flex items-center gap-1 mt-1'>
                            <span className='bg-gray-100 text-xs px-2 py-0.5 rounded-full text-gray-600 font-medium'>
                                Basic Level
                            </span>
                        </div>
                    </div>
                </div>

                <div className='text-right'>
                    <h4 className='text-2xl font-bold text-gray-900'>₹0.00</h4>
                    <p className='text-xs font-medium text-gray-400 uppercase tracking-wide'>Earned</p>
                </div>
            </div>

            {/* --- Stats Grid --- */}
            <div className='flex p-5 bg-gray-50 rounded-2xl justify-between items-center shadow-inner gap-4'>
                
                {/* 1. Hours */}
                <div className='text-center w-1/3 flex flex-col items-center'>
                    <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2'>
                        <i className="text-xl text-blue-600 ri-timer-2-line"></i>
                    </div>
                    <h5 className='text-lg font-bold text-gray-800'>0</h5>
                    <p className='text-xs text-gray-500 font-medium'>Hours Online</p>
                </div>

                {/* Divider Line */}
                <div className='w-[1px] h-12 bg-gray-200'></div>

                {/* 2. Distance */}
                <div className='text-center w-1/3 flex flex-col items-center'>
                    <div className='w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2'>
                        <i className="text-xl text-green-600 ri-speed-up-line"></i>
                    </div>
                    <h5 className='text-lg font-bold text-gray-800'>0 KM</h5>
                    <p className='text-xs text-gray-500 font-medium'>Total Distance</p>
                </div>

                {/* Divider Line */}
                <div className='w-[1px] h-12 bg-gray-200'></div>

                {/* 3. Jobs */}
                <div className='text-center w-1/3 flex flex-col items-center'>
                    <div className='w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mb-2'>
                        <i className="text-xl text-yellow-600 ri-booklet-line"></i>
                    </div>
                    <h5 className='text-lg font-bold text-gray-800'>0</h5>
                    <p className='text-xs text-gray-500 font-medium'>Total Jobs</p>
                </div>
            </div>
        </div>
    );
};

export default CaptainDetails;