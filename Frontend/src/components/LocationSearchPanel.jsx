import React from 'react';

const LocationSearchPanel = ({ suggestions, setVehiclePanelOpen, setPanelOpen, setPickup, setDestination, activeField, handleSelectedLocation }) => {

    const handleSuggestionClick = (suggestion) => {
        // Use the new handler from props
        if (handleSelectedLocation) {
            handleSelectedLocation(suggestion, activeField);
        }
    }

    return (
        <div>
            {suggestions.map((elem, idx) => (
                <div key={idx} onClick={() => handleSuggestionClick(elem.description || elem)} className='flex gap-4 border-2 p-3 border-gray-50 active:border-black rounded-xl items-center my-2 justify-start'>
                    <h2 className='bg-[#eee] h-8 flex items-center justify-center w-12 rounded-full'><i className="ri-map-pin-fill"></i></h2>
                    <h4 className='font-medium'>{elem.description || elem}</h4>
                </div>
            ))}
        </div>
    );
};

export default LocationSearchPanel;