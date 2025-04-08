import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import AdminDashboard from "./components/AdminDashboard";
import AllProperties from "./components/AllProperties";
import UserProperties from "./components/UserProperties";
import AgentSignup from "./components/AgentSignup";
import AgentLogin from "./components/AgentLogin";
import AgentDashboard from "./components/AgentDashboard";
import Login from "./Components/Auth/Login";
import Register from "./Components/Auth/Register";
import Dashboard from "./pages/Dashboard";
import PropertyTable from "./components/Properties/Allproperties";
 import AddBooking from "./Components/Booking/addBooking";
import UserBookings from "./Components/Booking/UserBookings";
import MyInquiries from "./Components/Inquiry/MyInquiries";
import AdminBookings from "./Components/Admin/AdminBookings";
import AdminInquiries from "./Components/Admin/AdminInquiries";
import AnalyticsPage from "./Components/Admin/Analiyze";
import "./index.css"; // Ensure Tailwind is applied
import DynamicReport from "./Components/DynamicReport";
import Onboarding from "./pages/onboarding";
import Homepage from "./pages/home";
import PropertyForm from "./Components/PropertyForm";

import ValuationTool from "./Components/ValuationTool";


function App() {
  return (
   <Routes>
      {/* General Routes */}
      <Route path="/" element={<Onboarding/>} />
      <Route path="/homepage" element={<Homepage/>}/>
      <Route path="/login" element={<Login />} /> 
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      
      {/* Properties Routes */}
      
      <Route path="/properties" element={<PropertyTable />} />
      <Route path="/userProperties" element={<UserProperties/>}/>
      
      {/* Booking Routes */}
      <Route path="/bookings/:propertyId" element={<AddBooking />} />
      <Route path="/my-bookings" element={<UserBookings />} />
      
      {/* Inquiry Routes */}
      <Route path="/my-inquiries" element={<MyInquiries />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/bookings" element={<AdminBookings />} />


      <Route path="/admin/inquiries" element={<AdminInquiries />} /> 
      <Route path="/admin/analytics" element={<AnalyticsPage />} />

      
      <Route path="/reports" element={<DynamicReport/>}/>
      
      {/* Agent Routes */}
      <Route path="/agent-signup" element={<AgentSignup />} />
      <Route path="/postad" element={<PropertyForm/>}/>
      <Route path="/agent-login" element={<AgentLogin />} />
      <Route path="/agent-dashboard" element={<AgentDashboard />} />

      <Route path="/valuation-tool" element={<ValuationTool />} />
      
    </Routes>
  );
}

export default App;
