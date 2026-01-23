import React from 'react'

const CaptainDetails = () => {
  return (
    <div className='flex items-center justify-between'>
      <div className='flex items-center justify-start gap-3'>
        <img className='h-10 w-10 rounded-full object-cover' src="https://i.pinimg.com/236x/af/26/28/af26280b0ca305be47df0b799ed1b12b.jpg" alt="" />
        <h4 className='text-lg font-medium'>Harsh Patel</h4>
      </div>
      <div>
        <h4 className='text-xl font-semibold'>₹295.20</h4>
        <p className='text-sm text-gray-600'>Earned</p>
      </div>
    </div>
  )
}

export default CaptainDetails