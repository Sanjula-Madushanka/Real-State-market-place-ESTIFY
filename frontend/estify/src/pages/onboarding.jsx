// src/pages/Onboarding.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import RealEstateVideo from "../assets/real-estate.mp4"; // ✅ Make sure this path is correct

const Onboarding = () => {
  const navigate = useNavigate();

  return (
    <div className="relative w-screen h-screen overflow-hidden text-white">
      {/* Fullscreen Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed top-0 left-0 w-screen h-screen object-cover z-0"
      >
        <source src={RealEstateVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

    

      {/* Foreground content */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full px-6 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold drop-shadow-lg mb-4">
          Find Your Dream Property with <span className="text-green-400">Estify</span>
        </h1>
        <p className="text-lg sm:text-xl max-w-2xl text-gray-200 mb-6">
          Discover top properties across Sri Lanka and get started with confidence.
        </p>
        <button
          onClick={() => navigate("/homepage")}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full text-lg shadow-lg transition"
        >
          Enter Site
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
