import React, { useState ,useContext} from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { UserDataContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

const UserLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { user, setUser } = useContext(UserDataContext);
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();

    const userData = {
      email: email,
      password: password
    };
  try {
      // 1. Send Login Request
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/users/login`, userData);

      // 2. If Success (Status 200)
      if (response.status === 200) {
        const data = response.data;
        
        // Save User & Token
        setUser(data.user);
        localStorage.setItem('token', data.token);
        
        // Redirect
        navigate('/home');
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert("Invalid email or password"); // Simple alert for now
    }

    setEmail('');
    setPassword('');
  };

  return (
    <div className='h-[100dvh] p-7 flex flex-col justify-between bg-white'>
        
        {/* Top Section */}
        <div>
            <motion.img 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className='w-20 mb-10' 
                src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" 
                alt="Uber Logo" 
            />
            
            <form onSubmit={submitHandler}>
                
                {/* Email Input */}
                <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="mb-6"
                >
                    <h3 className='text-lg font-medium mb-2 text-gray-900'>What's your email</h3>
                    <input 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required 
                        className='bg-[#eeeeee] w-full rounded-lg px-4 py-3 border border-transparent focus:border-black focus:bg-white transition-all text-lg placeholder:text-base outline-none' 
                        type="email" 
                        placeholder='email@example.com' 
                    />
                </motion.div>

                {/* Password Input */}
                <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8"
                >
                    <h3 className='text-lg font-medium mb-2 text-gray-900'>Enter Password</h3>
                    <input 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                        className='bg-[#eeeeee] w-full rounded-lg px-4 py-3 border border-transparent focus:border-black focus:bg-white transition-all text-lg placeholder:text-base outline-none' 
                        type="password" 
                        placeholder='password' 
                    />
                </motion.div>

                {/* Login Button */}
                <motion.button 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    whileTap={{ scale: 0.96 }}
                    className='bg-black text-white font-semibold mb-4 rounded-lg px-4 py-3 w-full text-lg shadow-md hover:shadow-lg transition-all'
                >
                    Login
                </motion.button>

            </form>
            
            <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className='text-center text-gray-600'
            >
                New here? <Link to='/signup' className='text-blue-600 font-medium hover:underline'>Create new Account</Link>
            </motion.p>
        </div>

        {/* Bottom Section */}
        <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
        >
            <Link 
                to='/captain-login' 
                className='bg-[black] flex items-center justify-center text-white font-semibold mb-5 rounded-lg px-4 py-3 w-full text-lg shadow-md hover:shadow-lg hover:bg-[#0e9f55] transition-all'
            >
                Sign in as Captain
            </Link>
        </motion.div>
    </div>
  )
}

export default UserLogin;