import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { clearAuthToken, getAuthToken } from '../utils/authStorage';

export const UserDataContext = createContext();

const UserContext = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = getAuthToken('user');

        if (token) {
            axios.get(`${import.meta.env.VITE_BASE_URL}/users/profile`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then(response => {
                // 👇 DEBUG LOG: Check the EXACT structure
                console.log("📦 RAW API RESPONSE:", response.data);

                // 👇 THE FIX: If response.data IS the user, use it directly.
                // If response.data.user exists, use that.
                const userData = response.data.user || response.data;

                console.log("✅ User Data Set to State:", userData);
                setUser(userData);
            })
            .catch(err => {
                console.error("❌ Failed to restore user:", err);
                clearAuthToken('user');
            })
            .finally(() => {
                setIsLoading(false);
            });
        } else {
            setIsLoading(false);
        }
    }, []);

    return (
        <UserDataContext.Provider value={{ user, setUser, isLoading, error }}>
            {children}
        </UserDataContext.Provider>
    );
};

export default UserContext;