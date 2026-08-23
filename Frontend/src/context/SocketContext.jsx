import React, { createContext, useEffect } from 'react';
import { io } from 'socket.io-client';

export const SocketContext = createContext();

// 👇 Check if the URL exists before creating the socket
const url = import.meta.env.VITE_BASE_URL?.replace(/\/$/, '');
console.log("🔌 Socket initializing with URL:", url);

if (!url) {
    console.error("❌ FATAL ERROR: VITE_BASE_URL is undefined. Check your .env file!");
}

const socket = io(url, {
    autoConnect: false, // 👈 We will connect manually in useEffect
    reconnection: true,
    reconnectionAttempts: Infinity,
    transports: ['websocket', 'polling'],
});

const SocketProvider = ({ children }) => {
    useEffect(() => {
        // 1. Connect
        socket.connect();

        // 2. Listen for connection success
        socket.on('connect', () => {
            console.log('✅ Connected to Server! Socket ID:', socket.id);
        });

        // 3. Listen for connection ERRORS (Crucial!)
        socket.on('connect_error', (err) => {
            console.error("❌ Socket Connection Error:", err.message);
        });

        return () => {
            socket.disconnect();
        }
    }, []);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketProvider;