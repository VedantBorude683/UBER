import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="h-screen pt-5 bg-gradient-to-b from-blue-200 to-blue-400 flex flex-col items-center">
      
      <h1 className="text-4xl font-bold mb-8 text-white">
        Welcome to the Home Page
      </h1>

      <div className="space-x-4">
        <Link
          to="/usersignup"
          className="px-4 py-2 bg-white text-blue-500 font-semibold rounded shadow hover:bg-blue-100"
        >
          User Signup
        </Link>

        <Link
          to="/userlogin"
          className="px-4 py-2 bg-white text-blue-500 font-semibold rounded shadow hover:bg-blue-100"
        >
          User Login
        </Link>

        <Link
          to="/captainsignup"
          className="px-4 py-2 bg-white text-blue-500 font-semibold rounded shadow hover:bg-blue-100"
        >
          Captain Signup
        </Link>

        <Link
          to="/captainlogin"
          className="px-4 py-2 bg-white text-blue-500 font-semibold rounded shadow hover:bg-blue-100"
        >
          Captain Login
        </Link>
      </div>

    </div>
  );
};

export default HomePage;
