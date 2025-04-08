import React, { useEffect, useState } from "react";
import axios from "axios";

const PropertyList = () => {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get("http://localhost:5001/api/properties");
      setProperties(res.data);
    };
    fetchData();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {properties.map((prop) => (
        <div key={prop._id} className="bg-white border rounded-xl shadow hover:shadow-lg overflow-hidden">
          <img src={`/uploads/${prop.image}`} alt={prop.title} className="w-full h-48 object-cover" />
          <div className="p-4">
            <h3 className="text-xl font-bold mb-2">{prop.title}</h3>
            <p className="text-gray-700 mb-2">{prop.description}</p>
            <p className="text-sm text-gray-500 mb-1">Type: {prop.propertyType}</p>
            <p className="text-sm text-gray-500">Contact: {prop.contactName} ({prop.contactNumber})</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PropertyList;
