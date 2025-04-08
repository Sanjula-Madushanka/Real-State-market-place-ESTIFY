import React, { useEffect, useState } from "react";
import axios from "axios";
import { DISTRICTS } from "../constants/districts";
import { MapPin, Home, Phone } from "lucide-react";
import { motion } from "framer-motion";
import LayoutWrapper from "../Components/LayoutWrapper";
import { useNavigate } from "react-router-dom";

const UserProperties = () => {
  const [properties, setProperties] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(Infinity);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await axios.get("http://localhost:5001/api/properties");
        setProperties(res.data);
      } catch (error) {
        console.error("Error fetching properties:", error);
      }
    };

    fetchProperties();
  }, []);

  const filteredProperties = properties.filter((p) => {
    const matchesDistrict = selectedDistrict === "all" || p.district === selectedDistrict;
    const matchesPrice = p.price >= minPrice && p.price <= maxPrice;
    return matchesDistrict && matchesPrice;
  });

  const handleBookNow = () => {
    navigate("/register");
  };

  return (
    <LayoutWrapper>
      <div className="p-6">
        <h1 className="text-4xl font-extrabold text-center text-green-700 mb-10 drop-shadow-md">
          Explore Properties
        </h1>

        {/* Filters */}
        <div className="mb-12 flex flex-wrap justify-center gap-6 bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex items-center gap-3">
            <label className="font-semibold text-gray-700">District:</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="border rounded px-4 py-2 w-48 shadow-sm focus:ring-2 focus:ring-green-300"
            >
              <option value="all">All</option>
              {DISTRICTS.map((district) => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Min Price (LKR)</label>
              <input
                type="number"
                value={minPrice === 0 ? "" : minPrice}
                onChange={(e) => setMinPrice(Number(e.target.value) || 0)}
                className="border px-3 py-2 rounded w-32 shadow-sm focus:ring-2 focus:ring-green-300"
                placeholder="Any"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Max Price (LKR)</label>
              <input
                type="number"
                value={maxPrice === Infinity ? "" : maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value) || Infinity)}
                className="border px-3 py-2 rounded w-32 shadow-sm focus:ring-2 focus:ring-green-300"
                placeholder="Any"
              />
            </div>
          </div>
        </div>

        {/* Property Listings */}
        {filteredProperties.length === 0 ? (
          <p className="text-center text-gray-600 text-lg">No properties found for selected filters.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((property) => (
              <motion.div
                key={property._id}
                whileHover={{ scale: 1.02 }}
                className="bg-white border rounded-2xl shadow-lg overflow-hidden transition hover:shadow-xl"
              >
                {property.image && (
                  <img
                    src={`http://localhost:5001/uploads/${property.image}`}
                    alt={property.title}
                    className="h-48 w-full object-cover"
                  />
                )}
                <div className="p-5 space-y-3">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Home size={18} className="text-emerald-500" /> {property.title}
                  </h2>
                  <p className="text-gray-600 text-sm line-clamp-2">{property.description}</p>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <MapPin size={14} /> {property.district}
                  </p>
                  <p className="text-emerald-600 font-bold text-lg">
                    LKR {property.price?.toLocaleString()} {" "}
                    <span className="text-sm text-gray-500">
                      ({property.propertyType === "rent" ? "Monthly" : "Total"})
                    </span>
                  </p>
                  <p className="text-sm text-gray-700 flex items-center gap-1">
                    <Phone size={14} /> {property.contactName} ({property.contactNumber})
                  </p>
                  <button
                    onClick={handleBookNow}
                    className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white text-sm py-2 px-4 rounded-md shadow-md transition"
                  >
                    Book Now
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </LayoutWrapper>
  );
};

export default UserProperties;
