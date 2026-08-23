import React, { useState, useRef, useContext ,useEffect} from 'react';
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
    const [captainLocation, setCaptainLocation] = useState(null);

    // --- Map State ---
    const [pickupPosition, setPickupPosition] = useState(null);
    const [destinationPosition, setDestinationPosition] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

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
    // --- 🔌 FAIL-SAFE SOCKET CONNECTION ---
    
    useEffect(() => {
        
        console.log("🔍 USER OBJECT DEBUG:", user);

        const userId = user?._id || user?.user?._id; 

        if (!userId) {
            console.log("❌ User ID not found in context yet. Waiting...");
            return;
        }

        // 2. Define the Join Function so we can use it in 'connect' listener
        const sendJoinMessage = () => {
            console.log(`🔌 Joining as User: ${userId}`);
            socket.emit("join", { 
                userType: "user", 
                userId: userId 
            });
        };

        // 3. Connect and Emit
        if (!socket.connected) {
            socket.connect();
        } 
        
        // If already connected, join immediately
        if (socket.connected) {
            sendJoinMessage();
        }

        // 4. Listen for connection (in case it connects later)
        socket.on('connect', sendJoinMessage);
        // 6. Listen for Ride Updates
        const handleRideConfirmed = (ride) => {
            console.log("✅ RIDE CONFIRMED:", ride);
            setVehicleFound(false);
            setWaitingForDriver(true);
            setRide(ride);

            // A pickup typed manually may not yet have map coordinates.
            // Resolve it now so the captain-to-passenger route can be drawn.
            axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-coordinates`, {
                params: { address: ride.pickup },
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            })
                .then((response) => setPickupPosition(response.data))
                .catch((error) => console.error('Could not load pickup location:', error));
        };

        const handleRideStarted = (ride) => {
            console.log("🚀 RIDE STARTED");
            setWaitingForDriver(false);
            navigate('/riding', { state: { ride } }); 
        };

        const handleCaptainLocation = (location) => {
            if (location?.ltd != null && location?.lng != null) {
                setCaptainLocation({ lat: location.ltd, lng: location.lng });
            }
        };

        socket.on('ride-confirmed', handleRideConfirmed);
        socket.on('ride-started', handleRideStarted);
        socket.on('live-tracking-data', handleCaptainLocation);

        // Cleanup
        return () => {
            socket.off('connect', sendJoinMessage);
            socket.off('ride-confirmed', handleRideConfirmed);
            socket.off('ride-started', handleRideStarted);
            socket.off('live-tracking-data', handleCaptainLocation);
        };

    }, [user, socket]);

    // --- Handlers ---
    const handlePickupChange = async (e) => {
        const value = e.target.value;
        setPickup(value);
        if (value.trim().length < 3) {
            setPickupSuggestions([]);
            return;
        }
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`, {
                params: { input: value.trim() },
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
        const value = e.target.value;
        setDestination(value);
        if (value.trim().length < 3) {
            setDestinationSuggestions([]);
            return;
        }
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`, {
                params: { input: value.trim() },
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
        if (pickup.trim().length < 3 || destination.trim().length < 3) {
            alert('Please enter valid pickup and destination locations.');
            return;
        }

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
            setVehiclePanelOpen(false);
            alert(err.response?.data?.message || 'Unable to calculate fare for these locations.');
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
            alert(err.response?.data?.message || 'Unable to create the ride. Please try again.');
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
    const handleClearRoute = () => {
    setPickup('');
    setDestination('');
    setPickupPosition(null);
    setDestinationPosition(null);
    setVehiclePanelOpen(false);
    setPanelOpen(false);
    setConfirmRidePanelOpen(false);

    // Add any other state resets here
};

const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser');
        return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;

        // 1. Set the visual marker immediately (optional, but good for UX)
        setPickupPosition({ lat: latitude, lng: longitude });

        try {
            // 2. Ask Backend for the address
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-address-from-coordinates`, {
                params: { lat: latitude, lng: longitude },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            // 3. Auto-fill the input field
            setPickup(response.data.address);

        } catch (error) {
            console.error("Error fetching address:", error);
        }
    });
};



    return (
        <div className='h-[100dvh] w-full relative overflow-hidden bg-gray-100'>
            {/* Header */}
            <div className='fixed p-4 sm:p-6 top-0 flex items-center justify-between w-full z-10'>
                <img onClick={() => setIsSidebarOpen(true)} className='w-16 cursor-pointer pointer-events-auto' src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="Uber Logo" />
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
                    pickupPosition={waitingForDriver ? captainLocation : pickupPosition} 
                    destinationPosition={waitingForDriver ? pickupPosition : destinationPosition} 
                    onCancel={handleClearRoute}
                />
            </div>
            {/* Search Form Wrapper */}
            <div className={`flex flex-col justify-end h-screen absolute top-0 w-full z-20 pointer-events-none ${vehiclePanelOpen || confirmRidePanelOpen || vehicleFound || waitingForDriver ? 'hidden' : 'flex'}`}>
                
                {/* MOBILE FIX: 
                   1. Changed h-[30%] to h-auto (Let it grow if needed)
                   2. Added min-h-[35%] to ensure enough touch space
                */}
                <div className='h-auto min-h-[35%] p-5 bg-white relative pointer-events-auto shadow-lg rounded-t-3xl'>
                    
                    {/* Close Arrow */}
                    <h5 ref={panelCloseRef} onClick={() => setPanelOpen(false)} className='absolute opacity-0 right-6 top-6 text-2xl cursor-pointer w-10 h-10 flex items-center justify-center'>
                        <i className="ri-arrow-down-wide-line text-gray-800 font-bold"></i>
                    </h5>

                    <h4 className='text-2xl font-bold mb-4'>Find a trip</h4>
                    
                    <form className='relative py-3' onSubmit={submitHandler}>
                        {/* Connecting Line */}
                        <div className="line absolute h-12 w-1 top-[45%] -translate-y-1/2 left-4 bg-gray-900 rounded-full"></div>
                        
                        {/* Pickup Input */}
                        <div className='relative w-full mb-3'>
                            {/* Mobile Fix: text-base prevents iOS zoom on focus */}
                            <input 
                                onClick={() => {
                                    setPanelOpen(true);
                                    setActiveField('pickup');
                                }}
                                value={pickup}
                                onChange={handlePickupChange}
                                className='bg-[#eee] px-10 py-3 text-base font-medium rounded-lg w-full pr-10 focus:outline-none focus:ring-2 focus:ring-black' 
                                type="text" 
                                placeholder='Add a pick-up location' 
                            />
                            <i 
                                onClick={handleUseCurrentLocation}
                                className="ri-map-pin-user-fill absolute right-3 top-1/2 -translate-y-1/2 text-lg text-gray-500 hover:text-black cursor-pointer z-10 p-2"
                            ></i>
                            <i className="ri-circle-fill absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-800"></i>
                        </div>
                        
                        {/* Destination Input */}
                        <div className='relative w-full'>
                            <input 
                                onClick={() => {
                                    setPanelOpen(true);
                                    setActiveField('destination');
                                }}
                                value={destination}
                                onChange={handleDestinationChange}
                                className='bg-[#eee] px-10 py-3 text-base font-medium rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-black' 
                                type="text" 
                                placeholder='Enter your destination' 
                            />
                            <i className="ri-map-pin-fill absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-800"></i>
                        </div>
                    </form>
                    
                    <button 
                        onClick={findTrip} 
                        disabled={isLoading}
                        className={`bg-black text-white px-4 py-3 text-lg rounded-lg mt-4 w-full font-bold shadow-md flex items-center justify-center transition-all active:scale-95 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : "Find Trip"}
                    </button>
                </div>
                
                {/* Suggestions Panel */}
                <div ref={panelRef} className='bg-white h-0 pointer-events-auto overflow-y-auto'>
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

            <div ref={confirmRidePanelRef} className='fixed bottom-0 z-30 w-full translate-y-full rounded-t-3xl bg-white px-3 py-3 shadow-2xl'>
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
                    socket={socket}
                    setVehicleFound={setVehicleFound}
                    setWaitingForDriver={setWaitingForDriver}
                    waitingForDriver={waitingForDriver}
                />
            </div>
        </div>
    );
};

export default UserHome;
