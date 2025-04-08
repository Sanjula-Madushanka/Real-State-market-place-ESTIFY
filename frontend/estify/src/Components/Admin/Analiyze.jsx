import React, { useEffect, useState, useRef } from "react";
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiDownload, FiShare2, FiFileText, FiImage, FiFile } from "react-icons/fi";

import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";



const AnalyticsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showShareOptions, setShowShareOptions] = useState(false);
  const navigate = useNavigate();
  const chartRef = useRef(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found");

        const response = await fetch("http://localhost:5001/api/admin/bookings", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        
        if (!response.ok) {
          if (response.status === 401) throw new Error("Unauthorized - Please login again");
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        setBookings(data.bookings || []);
      } catch (err) {
        setError(err.message || "Failed to fetch bookings.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleGoBack = () => {
    navigate(-1);
  };

  // Export to CSV
  const exportToCSV = () => {
    const data = bookings.map(booking => ({
      ID: booking._id,
      Status: booking.status,
      Date: new Date(booking.createdAt).toLocaleDateString(),
      Customer: booking.customerName,
      Service: booking.serviceType
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");
    XLSX.writeFile(workbook, "bookings_data.csv");
    setShowShareOptions(false);
  };

  // Export to PDF
  const exportToPDF = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Add title
    doc.setFontSize(18);
    doc.text("Booking Analytics Report", pageWidth / 2, 15, { align: "center" });
    
    // Add date
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 25, { align: "center" });
    
    // Add summary data
    doc.setFontSize(14);
    doc.text("Summary Statistics", 14, 40);
    doc.setFontSize(12);
    
    const statusCounts = calculateStatusCounts();
    let yPosition = 50;
    doc.text(`Total Bookings: ${bookings.length}`, 14, yPosition);
    Object.entries(statusCounts).forEach(([status, count]) => {
      yPosition += 10;
      doc.text(`${status}: ${count}`, 14, yPosition);
    });
    
    // Add charts as images
    if (chartRef.current) {
      const canvas = await html2canvas(chartRef.current);
      const imgData = canvas.toDataURL("image/png");
      yPosition += 20;
      doc.addImage(imgData, "PNG", 10, yPosition, 180, 100);
    }
    
    doc.save("booking_analytics.pdf");
    setShowShareOptions(false);
  };

  // Export chart as PNG
  const exportChartAsImage = async () => {
    if (chartRef.current) {
      const canvas = await html2canvas(chartRef.current);
      canvas.toBlob(blob => {
        saveAs(blob, "booking_analytics.png");
      });
      setShowShareOptions(false);
    }
  };

  const calculateStatusCounts = () => {
    return bookings.reduce((acc, booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1;
      return acc;
    }, {});
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  const totalBookings = bookings.length;
  const statusCounts = calculateStatusCounts();

  if (totalBookings === 0) return (
    <div className="p-6">
      <button 
        onClick={handleGoBack}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
      >
        <FiArrowLeft className="mr-2" /> Back
      </button>
      <p>No bookings available.</p>
    </div>
  );

  const statusColors = {
    "Confirmed": "#4CAF50",
    "Rejected": "#F44336",
    "Pending": "#FFC107",
    "Completed": "#2196F3",
    "Canceled": "#9E9E9E"
  };

  const pieData = Object.keys(statusCounts).map(status => ({
    name: status,
    value: statusCounts[status],
    color: statusColors[status] || "#8884d8"
  }));

  const barData = Object.keys(statusCounts).map(status => ({
    name: status,
    Count: statusCounts[status],
    fill: statusColors[status] || "#8884d8"
  }));

  barData.sort((a, b) => {
    const order = ["Confirmed", "Rejected", "Pending", "Completed", "Canceled"];
    return order.indexOf(a.name) - order.indexOf(b.name);
  });

  return (
    <div className="p-6" ref={chartRef}>
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={handleGoBack}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <FiArrowLeft className="mr-2" /> Back
        </button>
        
        <div className="relative">
        <button 
  onClick={() => setShowShareOptions(!showShareOptions)}
  className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-500 transition duration-200"
>
  <FiShare2 className="mr-2" /> Share/Export
</button>

          
          {showShareOptions && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
              <div className="py-1">
                <button 
                  onClick={exportToCSV}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FiFileText className="mr-2" /> Export as CSV
                </button>
                <button 
                  onClick={exportToPDF}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FiFile className="mr-2" /> Export as PDF
                </button>
                <button 
                  onClick={exportChartAsImage}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FiImage className="mr-2" /> Export as Image
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-4">Booking Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        {Object.entries({
          "Total": totalBookings,
          "Confirmed": statusCounts["Confirmed"] || 0,
          "Rejected": statusCounts["Rejected"] || 0,
          "Pending": statusCounts["Pending"] || 0,
          "Canceled": statusCounts["Canceled"] || 0
        }).map(([status, count]) => (
          <div 
            key={status}
            className={`${
              status === "Total" ? "bg-blue-500" :
              status === "Confirmed" ? "bg-green-500" :
              status === "Rejected" ? "bg-red-500" :
              status === "Pending" ? "bg-yellow-500" : "bg-gray-500"
            } text-white p-4 rounded-lg shadow-md`}
          >
            <h2 className="text-lg">{status}</h2>
            <p className="text-2xl font-bold">{count}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Booking Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie 
                data={pieData} 
                cx="50%" 
                cy="50%" 
                outerRadius={80} 
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Booking Status Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={barData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Count" name="Booking Status Count">
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;