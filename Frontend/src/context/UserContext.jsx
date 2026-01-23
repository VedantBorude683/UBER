import React, { createContext, useState } from 'react';

// Create the "Data Store"
export const UserDataContext = createContext();

const UserContext = ({ children }) => {
    // This is the global state for the user
    const [user, setUser] = useState({
        email: '',
        fullName: {
            firstName: '',
            lastName: ''
        }
    });

    return (
        <UserDataContext.Provider value={{ user, setUser }}>
            {children}
        </UserDataContext.Provider>
    );
};

export default UserContext;