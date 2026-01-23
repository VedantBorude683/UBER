import React, { useState, useRef, useContext } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import axios from 'axios';
import 'remixicon/fonts/remixicon.css';
import { Link, useNavigate } from 'react-router-dom';
import LocationSearchPanel from '../components/LocationSearchPanel';
import VehiclePanel from '../components/VehicleePanel';
import ConfirmRide from '../components/ConfirmRide';
import LookingForDriver from '../components/LookingForDriver';
import WaitingForDriver from '../components/WaitingForDriver';
import LiveTracking from '../components/LiveTracking';
import { SocketContext } from '../context/SocketContext';
import { UserDataContext } from '../context/UserContext';

const UserHome = () => {
    // --- State Variables ---
    const [pickup, setPickup] = useState('');
    const [destination, setDestination] = useState('');
    const [panelOpen, setPanelOpen] = useState(false);
    const [vehiclePanelOpen, setVehiclePanelOpen] = useState(false);
    const [confirmRidePanelOpen, setConfirmRidePanelOpen] = useState(false);
    const [vehicleFound, setVehicleFound] = useState(false);
    const [waitingForDriver, setWaitingForDriver] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // --- API & Data State ---
    const [pickupSuggestions, setPickupSuggestions] = useState([]);
    const [destinationSuggestions, setDestinationSuggestions] = useState([]);
    const [activeField, setActiveField] = useState(null);
    const [fare, setFare] = useState({});
    const [vehicleType, setVehicleType] = useState(null);
    const [ride, setRide] = useState(null);

    // --- Map State ---
    const [pickupPosition, setPickupPosition] = useState(null);
    const [destinationPosition, setDestinationPosition] = useState(null);

    const navigate = useNavigate();
    const { socket } = useContext(SocketContext);
    const { user } = useContext(UserDataContext);

    // --- Refs ---
    const panelRef = useRef(null);
    const panelCloseRef = useRef(null);
    const vehiclePanelRef = useRef(null);
    const confirmRidePanelRef = useRef(null);
    const vehicleFoundRef = useRef(null);
    const waitingForDriverRef = useRef(null);
    const sidebarRef = useRef(null);

    // --- Handlers ---
    const handlePickupChange = async (e) => {
        setPickup(e.target.value);
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`, {
                params: { input: e.target.value },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setPickupSuggestions(response.data);
        } catch {
            // handle error silently
        }
    };

    const handleDestinationChange = async (e) => {
        setDestination(e.target.value);
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`, {
                params: { input: e.target.value },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setDestinationSuggestions(response.data);
        } catch {
            // handle error silently
        }
    };

    const handleSelectedLocation = async (location, type) => {
        if (type === 'pickup') {
            setPickup(location);
        } else {
            setDestination(location);
        }
        
        setPanelOpen(false);

        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-coordinates`, {
                params: { address: location },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (type === 'pickup') {
                setPickupPosition(response.data);
            } else {
                setDestinationPosition(response.data);
            }
        } catch (error) {
            console.error("Error getting coordinates:", error);
        }
    }

    const submitHandler = (e) => {
        e.preventDefault();
    };

    async function findTrip() {
        setVehiclePanelOpen(true);
        setPanelOpen(false);

        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/get-fare`, {
                params: { pickup, destination },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setFare(response.data);
        } catch (err) {
            console.error(err);
        }
    }

    async function createRide() {
        try {
            const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/rides/create`, {
                pickup,
                destination,
                vehicleType
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            console.log(response.data);
            setVehicleFound(true);
            setConfirmRidePanelOpen(false);
        } catch (err) {
            console.error(err);
        }
    }

    // --- GSAP Animations ---
    useGSAP(function () {
        if (panelOpen) {
            gsap.to(panelRef.current, { height: '70%', padding: 24 });
            gsap.to(panelCloseRef.current, { opacity: 1 });
        } else {
            gsap.to(panelRef.current, { height: '0%', padding: 0 });
            gsap.to(panelCloseRef.current, { opacity: 0 });
        }
    }, [panelOpen]);

    useGSAP(function () {
        if (vehiclePanelOpen) {
            gsap.to(vehiclePanelRef.current, { transform: 'translateY(0)' });
        } else {
            gsap.to(vehiclePanelRef.current, { transform: 'translateY(100%)' });
        }
    }, [vehiclePanelOpen]);

    useGSAP(function () {
        if (confirmRidePanelOpen) {
            gsap.to(confirmRidePanelRef.current, { transform: 'translateY(0)' });
        } else {
            gsap.to(confirmRidePanelRef.current, { transform: 'translateY(100%)' });
        }
    }, [confirmRidePanelOpen]);

    useGSAP(function () {
        if (vehicleFound) {
            gsap.to(vehicleFoundRef.current, { transform: 'translateY(0)' });
        } else {
            gsap.to(vehicleFoundRef.current, { transform: 'translateY(100%)' });
        }
    }, [vehicleFound]);

    useGSAP(function () {
        if (waitingForDriver) {
            gsap.to(waitingForDriverRef.current, { transform: 'translateY(0)' });
        } else {
            gsap.to(waitingForDriverRef.current, { transform: 'translateY(100%)' });
        }
    }, [waitingForDriver]);

    useGSAP(function () {
        if (isSidebarOpen) {
            gsap.to(sidebarRef.current, { transform: 'translateX(0%)' });
        } else {
            gsap.to(sidebarRef.current, { transform: 'translateX(-100%)' });
        }
    }, [isSidebarOpen]);

    return (
        <div className='h-screen w-screen relative overflow-hidden bg-gray-100'>
            {/* Header */}
            <div className='fixed p-6 top-0 flex items-center justify-between w-screen z-10'>
                <img onClick={() => setIsSidebarOpen(true)} className='w-16 cursor-pointer' src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="Uber Logo" />
            </div>

            {/* Sidebar Menu */}
            <div ref={sidebarRef} className='fixed h-screen w-3/4 bg-white z-50 top-0 left-0 -translate-x-full shadow-2xl p-5'>
                <div className='flex justify-between items-center mb-10'>
                    <h2 className='text-2xl font-bold'>Menu</h2>
                    <i onClick={() => setIsSidebarOpen(false)} className="ri-close-line text-3xl cursor-pointer"></i>
                </div>
                <div className='flex flex-col gap-4'>
                    <div className='flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg cursor-pointer'>
                        <i className="ri-user-line text-xl"></i>
                        <h4 className='text-lg font-medium'>Profile</h4>
                    </div>
                    <div className='flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg cursor-pointer'>
                        <i className="ri-history-line text-xl"></i>
                        <h4 className='text-lg font-medium'>My Rides</h4>
                    </div>
                    <Link to='/user/logout' className='flex items-center gap-3 p-3 hover:bg-red-50 text-red-600 rounded-lg cursor-pointer mt-5'>
                        <i className="ri-logout-box-r-line text-xl"></i>
                        <h4 className='text-lg font-medium'>Logout</h4>
                    </Link>
                </div>
            </div>

            {/* Map Background */}
            <div className='fixed h-screen w-screen top-0 left-0 z-0'>
                <LiveTracking 
                    pickupPosition={pickupPosition} 
                    destinationPosition={destinationPosition} 
                />
            </div>

            {/* Search Form - FIX APPLIED HERE */}
            <div className='flex flex-col justify-end h-screen absolute top-0 w-full z-20 pointer-events-none'>
                {/* Added pointer-events-auto to the child div */}
                <div className='h-[30%] p-6 bg-white relative pointer-events-auto'>
                    <h5 ref={panelCloseRef} onClick={() => setPanelOpen(false)} className='absolute opacity-0 right-6 top-6 text-2xl cursor-pointer'>
                        <i className="ri-arrow-down-wide-line"></i>
                    </h5>
                    <h4 className='text-2xl font-semibold'>Find a trip</h4>
                    
                    <form className='relative py-3' onSubmit={submitHandler}>
                        <div className="line absolute h-16 w-1 top-[50%] -translate-y-1/2 left-5 bg-gray-700 rounded-full"></div>
                        
                        <input 
                            onClick={() => {
                                setPanelOpen(true);
                                setActiveField('pickup');
                            }}
                            value={pickup}
                            onChange={handlePickupChange}
                            className='bg-[#eee] px-12 py-2 text-lg rounded-lg w-full mt-5' 
                            type="text" 
                            placeholder='Add a pick-up location' 
                        />
                        
                        <input 
                            onClick={() => {
                                setPanelOpen(true);
                                setActiveField('destination');
                            }}
                            value={destination}
                            onChange={handleDestinationChange}
                            className='bg-[#eee] px-12 py-2 text-lg rounded-lg w-full mt-3' 
                            type="text" 
                            placeholder='Enter your destination' 
                        />
                    </form>
                    
                    <button onClick={findTrip} className='bg-black text-white px-4 py-2 rounded-lg mt-3 w-full'>
                        Find Trip
                    </button>
                </div>
                
                <div ref={panelRef} className='bg-white h-0 pointer-events-auto'>
                    <LocationSearchPanel
                        suggestions={activeField === 'pickup' ? pickupSuggestions : destinationSuggestions}
                        setPanelOpen={setPanelOpen}
                        setVehiclePanelOpen={setVehiclePanelOpen}
                        setPickup={setPickup}
                        setDestination={setDestination}
                        activeField={activeField}
                        handleSelectedLocation={handleSelectedLocation} 
                    />
                </div>
            </div>

            {/* Panels */}
            <div ref={vehiclePanelRef} className='fixed w-full z-10 bottom-0 translate-y-full bg-white px-3 py-10 pt-12'>
                <VehiclePanel 
                    selectVehicle={setVehicleType} 
                    fare={fare} 
                    setConfirmRidePanelOpen={setConfirmRidePanelOpen} 
                    setVehiclePanelOpen={setVehiclePanelOpen} 
                />
            </div>

            <div ref={confirmRidePanelRef} className='fixed w-full z-10 bottom-0 translate-y-full bg-white px-3 py-6 pt-12'>
                <ConfirmRide 
                    createRide={createRide}
                    pickup={pickup}
                    destination={destination}
                    fare={fare}
                    vehicleType={vehicleType}
                    setConfirmRidePanelOpen={setConfirmRidePanelOpen} 
                    setVehicleFound={setVehicleFound} 
                />
            </div>

            <div ref={vehicleFoundRef} className='fixed w-full z-10 bottom-0 translate-y-full bg-white px-3 py-6 pt-12'>
                <LookingForDriver 
                    createRide={createRide}
                    pickup={pickup}
                    destination={destination}
                    fare={fare}
                    vehicleType={vehicleType}
                    setVehicleFound={setVehicleFound} 
                />
            </div>

            <div ref={waitingForDriverRef} className='fixed w-full z-10 bottom-0 translate-y-full bg-white px-3 py-6 pt-12'>
                <WaitingForDriver 
                    ride={ride}
                    setVehicleFound={setVehicleFound}
                    setWaitingForDriver={setWaitingForDriver}
                    waitingForDriver={waitingForDriver}
                />
            </div>
        </div>
    );
};

export default UserHome;