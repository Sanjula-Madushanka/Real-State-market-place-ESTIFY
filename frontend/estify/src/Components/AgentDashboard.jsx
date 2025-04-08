import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PropertyTable from "../Components/PropertyTable";
import { LogOut, Home, PlusCircle } from "lucide-react";
import { motion } from "framer-motion";

const AgentDashboard = () => {
  const [properties, setProperties] = useState([]);
  const navigate = useNavigate();

  const fetchAgentProperties = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/properties/my-properties", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("agentToken")}`
        }
      });
      setProperties(res.data);
    } catch (err) {
      console.error("Failed to fetch agent properties", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("agentToken");
    navigate("/agent-login");
  };

  const handlePostAd = () => {
    navigate("/postad");
  };

  useEffect(() => {
    const token = localStorage.getItem("agentToken");
    if (!token) {
      navigate("/agent-login");
    } else {
      fetchAgentProperties();
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-b from-green-50 to-white px-4 py-8"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Home className="text-green-600" />
            <h1 className="text-3xl font-bold text-gray-800">Agent Dashboard</h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handlePostAd}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl shadow"
            >
              <PlusCircle size={18} /> Post Ad
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl shadow"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <PropertyTable properties={properties} refresh={fetchAgentProperties} />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AgentDashboard;
