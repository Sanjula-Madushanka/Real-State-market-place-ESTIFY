import React, { useEffect, useState } from "react";
import axios from "axios";
import PropertyTable from "../Components/PropertyTable";

const AllProperties = () => {
  const [properties, setProperties] = useState([]);

  const fetchProperties = async () => {
    const res = await axios.get("http://localhost:5001/api/properties");
    setProperties(res.data);
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-4 text-center">All Approved Properties</h1>
      <PropertyTable properties={properties} refresh={fetchProperties} />
    </div>
  );
};

export default AllProperties;
