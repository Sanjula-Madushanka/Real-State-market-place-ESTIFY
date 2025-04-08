import React from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import BackgroundImage from "../assets/bg-image.png"; // ✅ Ensure this path is correct

const LayoutWrapper = ({ children }) => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center relative text-gray-800 flex flex-col"
      style={{ backgroundImage: `url(${BackgroundImage})` }}
    >
      {/* Soft overlay */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-sm z-0" />

      {/* Page content over background */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="z-50 flex justify-between items-center px-10 py-4 bg-white/80 backdrop-blur border-b border-gray-200 shadow-md">
          <div
            className="text-2xl font-bold text-green-700 tracking-wide cursor-pointer"
            onClick={() => navigate("/")}
          >
            Estify
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => navigate("/homepage")} className="text-sm font-medium hover:text-green-700 transition">Home</button>
            <button onClick={() => navigate("/userProperties")} className="text-sm font-medium hover:text-green-700 transition">Properties</button>
            <button onClick={() => navigate("/valuation-tool")} className="text-sm font-medium hover:text-green-700 transition">ValuationTool</button>
            <button onClick={() => navigate("/agent-signup")} className="text-sm font-medium hover:text-green-700 transition">Agent Sign-Up</button>

            <div className="relative">
              <input
                type="text"
                placeholder="Search properties..."
                className="rounded-full border border-gray-300 px-4 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 w-full">{children}</main>

        {/* Footer */}
        <footer className="text-center py-6 bg-white/80 backdrop-blur border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Contact us: <a href="mailto:info@estify.lk" className="text-green-600">info@estify.lk</a> | Phone: <span className="text-green-600">+94 77 123 4567</span>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default LayoutWrapper;
