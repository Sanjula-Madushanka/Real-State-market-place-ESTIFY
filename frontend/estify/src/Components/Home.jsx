import React from "react";
import PropertyForm from "../Components/PropertyForm";
import PropertyList from "../Components/PropertyList";

const Home = () => {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-8">Post a Property Advertisement</h1>
      <PropertyForm />
        
    </div>
  );
};

export default Home;
