import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Start = () => {
  // State to toggle between User (Rider) and Captain (Driver)
  // false = User Mode (Default)
  // true = Captain Mode
  const [isCaptain, setIsCaptain] = useState(false);

  // Configuration for the two modes
  const config = {
    user: {
      image: "https://images.unsplash.com/photo-1619059558110-c45be64b73ae?q=80&w=2574&auto=format&fit=crop", // Traffic light / City
      title: "Get started with Ryber",
      link: "/login",
      btnText: "Continue",
      toggleText: "Drive with Ryber"
    },
    captain: {
      image: "https://images.unsplash.com/photo-1554672408-730436b60dde?q=80&w=2526&auto=format&fit=crop", // Driver / Steering Wheel
      title: "Earn with Ryber",
      link: "/captain-login",
      btnText: "Start Earning",
      toggleText: "Ride with Ryber"
    }
  };

  // Select current data based on state
  const currentView = isCaptain ? config.captain : config.user;

  return (
    <div className="h-[100dvh] w-full bg-black overflow-hidden relative">
      
      {/* BACKGROUND IMAGE LAYER - AnimatePresence handles the crossfade */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
            <motion.img 
                key={isCaptain ? "captain-img" : "user-img"} // Key change triggers animation
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 0.8, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                src={currentView.image} 
                className="w-full h-full object-cover absolute inset-0"
                alt="Background"
            />
        </AnimatePresence>
      </div>

      {/* TOP LOGO */}
      <div className="absolute top-8 left-8 z-10">
        <img className="w-20" src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Ryber_logo_2018.png" alt="Ryber Logo" />
      </div>

      {/* TOP RIGHT - MODE SWITCHER BUTTON */}
      <div className="absolute top-6 right-6 z-20">
        <button 
            onClick={() => setIsCaptain(!isCaptain)}
            className="bg-white/20 backdrop-blur-md border border-white/50 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-white hover:text-black transition-all"
        >
            {currentView.toggleText} <i className="ri-arrow-right-line ml-1"></i>
        </button>
      </div>

      {/* BOTTOM PANEL */}
      <div className="absolute bottom-0 w-full z-10 flex flex-col justify-end">
        <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="bg-white p-8 pb-10 rounded-t-[30px] shadow-[0_-10px_40px_rgba(0,0,0,0.3)] relative"
        >
          {/* Animated Title */}
          <AnimatePresence mode='wait'>
            <motion.h2 
                key={isCaptain ? "captain-title" : "user-title"}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-3xl font-bold mb-8 text-gray-900 leading-tight"
            >
                {currentView.title}
            </motion.h2>
          </AnimatePresence>

          {/* Main Action Button */}
          <Link 
            to={currentView.link} 
            className={`w-full text-white py-4 rounded-xl text-lg font-semibold flex justify-center items-center shadow-lg active:scale-95 transition-all ${isCaptain ? 'bg-black' : 'bg-black'}`}
          >
            {currentView.btnText}
            <i className="ri-arrow-right-line ml-3"></i>
          </Link>

        </motion.div>
      </div>

    </div>
  )
}

export default Start;