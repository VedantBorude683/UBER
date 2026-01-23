import React, { useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UserLogout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token'); // Get token before removing

        axios.get(`${import.meta.env.VITE_BASE_URL}/users/logout`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then((response) => {
            if (response.status === 200) {
                localStorage.removeItem('token');
                navigate('/login');
            }
        }).catch((err) => {
            console.error(err);
            // Even if server fails, remove local token and redirect
            localStorage.removeItem('token'); 
            navigate('/login');
        });
    }, [navigate]);

    return (
        <div className='h-screen flex items-center justify-center bg-gray-100 text-gray-800 font-bold text-xl'>
            Logging out...
        </div>
    )
}

export default UserLogout;