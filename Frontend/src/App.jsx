import React from "react";
import { Route,Routes } from "react-router-dom";
import CaptainLogin from "./pages/captainlogin.jsx";
import CaptainSignup from "./pages/captainsignup.jsx";
import Start from "./pages/HomePage.jsx";
import UserLogin from "./pages/userlogin.jsx";
import UserSignup from "./pages/usersignup.jsx";
import UserHome from "./pages/UserHome.jsx";
import logout from "./pages/logout.jsx";
import UserProtectWrapper from "./pages/UserProtectWrapper.jsx";
import CaptainProtectWrapper from "./pages/CaptainProtectWrapper.jsx";
import CaptainHome from "./pages/CaptainHome.jsx";
import  UserLogout  from "./pages/logout.jsx";

import CaptainRiding from "./pages/CaptainRiding.jsx";

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/signup" element={<UserSignup />} />
        
        {/* THIS IS THE MAIN DASHBOARD ROUTE */}
        <Route path="/home" element={
          <UserProtectWrapper>
            <UserHome />
          </UserProtectWrapper>
        } />

        <Route path="/user/logout" element={
          <UserProtectWrapper>
            <UserLogout />
          </UserProtectWrapper>
        } />
      
      <Route path='/captain-home' element={
          <CaptainProtectWrapper>
            <CaptainHome />
          </CaptainProtectWrapper>
       } />

   

     <Route path='/captain-login' element={
          
            <CaptainLogin />
         
       } />

       <Route path='/captain-signup' element={
          
            <CaptainSignup />
          
       } />

        <Route path='/captain-riding' element={<CaptainRiding />} />

    </Routes>
      
    

    

    </div>
  )
};
export default App;