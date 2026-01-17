import React from "react";
import { Route,Routes } from "react-router-dom";
import CaptainLogin from "./pages/captainlogin.jsx";
import CaptainSignup from "./pages/captainsignup.jsx";
import HomePage from "./pages/HomePage.jsx";
import UserLogin from "./pages/userlogin.jsx";
import UserSignup from "./pages/usersignup.jsx";

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/captainsignup" element={<CaptainSignup />} />
        <Route path="/captainlogin" element={<CaptainLogin />} />
        <Route path="/usersignup" element={<UserSignup />} />
        <Route path="/userlogin" element={<UserLogin />} />
      </Routes>
    </div>
  )
};
export default App;