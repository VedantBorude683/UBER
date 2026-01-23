import React, { useRef,useState } from 'react';
import { Link , useNavigate } from 'react-router-dom';
import RidePopUp from '../components/RidePopup';
import ConfirmRidePopUp from '../components/ConfirmRidePopUp';
import CaptainDetails from '../components/CaptainDetails';
import axios from 'axios';
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'




const CaptainHome = () => {
    // State to handle the "New Ride" popup
    const [ridePopupPanel, setRidePopupPanel] = useState(true);
    const [confirmRidePopupPanel, setConfirmRidePopupPanel] = useState(false);
    const ridePopupPanelRef = useRef(null)
    const confirmRidePopupPanelRef = useRef(null)
    const navigate = useNavigate();

    const logoutCaptain = async () => {
        const token = localStorage.getItem('token')

        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/captains/logout`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if (response.status === 200) {
                localStorage.removeItem('token')
                navigate('/captain-login')
            }
        } catch (error) {
            console.log("Logout failed", error)
            // Even if API fails, we should force logout on frontend
            localStorage.removeItem('token')
            navigate('/captain-login')
        }
    }
    useGSAP(function () {
        if (ridePopupPanel) {
            gsap.to(ridePopupPanelRef.current, {
                transform: 'translateY(0)'
            })
        } else {
            gsap.to(ridePopupPanelRef.current, {
                transform: 'translateY(100%)'
            })
        }
    }, [ ridePopupPanel ])

    // Animation for "Confirm Ride" Popup
    useGSAP(function () {
        if (confirmRidePopupPanel) {
            gsap.to(confirmRidePopupPanelRef.current, {
                transform: 'translateY(0)'
            })
        } else {
            gsap.to(confirmRidePopupPanelRef.current, {
                transform: 'translateY(100%)'
            })
        }
    }, [ confirmRidePopupPanel ])

    return (
        <div className='h-screen'>
            {/* Header / Logout */}
          <div className='fixed p-6 top-0 flex items-center justify-between w-screen z-10'>
                <img className='w-16' src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="" />
                
                {/* 👇 4. ATTACH LOGOUT FUNCTION HERE */}
                <div 
                    onClick={logoutCaptain}
                    className='h-10 w-10 bg-white flex items-center justify-center rounded-full cursor-pointer'
                >
                    <i className="text-lg font-medium ri-logout-box-r-line"></i>
                </div>
            </div>

            {/* Captain Details Component */}
            <CaptainDetails />

            {/* Ride Popup Panel */}
            <div 
                ref={ridePopupPanelRef}
                className='fixed bottom-0 left-0 w-full bg-white p-6 rounded-t-3xl shadow-lg z-20 transform translate-y-full transition-transform duration-300'
            >
                <RidePopUp setRidePopupPanel={setRidePopupPanel} setConfirmRidePopupPanel={setConfirmRidePopupPanel} />
            </div>

            {/* Confirm Ride Popup Panel */}
            <div 
                ref={confirmRidePopupPanelRef}
                className='fixed bottom-0 left-0 w-full bg-white p-6 rounded-t-3xl shadow-lg z-30 transform translate-y-full transition-transform duration-300'
            >
                <ConfirmRidePopUp setConfirmRidePopupPanel={setConfirmRidePopupPanel} setRidePopupPanel={setRidePopupPanel} />
            </div>

           
         
        </div>
    )
}

export default CaptainHome;