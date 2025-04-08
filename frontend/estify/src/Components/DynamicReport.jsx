import React, { useEffect, useState } from "react";
import axios from "axios";
import { DISTRICTS } from "../constants/districts";
import { Download } from "lucide-react";
import Papa from "papaparse";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useNavigate } from "react-router-dom";
import { Home, BarChart2, Building, MessageSquare, FileText } from "lucide-react";

const DynamicReport = () => {
  const [filters, setFilters] = useState({ type: "", status: "", district: "", agentId: "" });
  const [reportData, setReportData] = useState([]);
  const [agents, setAgents] = useState([]);
  const navigate = useNavigate();

  const fetchAgents = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/agents");
      setAgents(res.data);
    } catch (err) {
      console.error("Failed to load agents", err);
    }
  };

  const fetchReport = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/properties/report", {
        params: filters
      });
      setReportData(res.data);
    } catch (err) {
      console.error("Error fetching report", err);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const exportCSV = () => {
    const csv = Papa.unparse(reportData.map((item) => ({
      Title: item.title,
      Type: item.propertyType,
      District: item.district,
      Price: item.price,
      Status: item.status,
      Agent: item.postedByAgent?.email || "N/A"
    })));

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "property_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Property Report", 14, 15);

    const tableColumn = ["Title", "Type", "District", "Price", "Status", "Agent"];
    const tableRows = reportData.map((item) => [
      item.title,
      item.propertyType,
      item.district,
      `LKR ${item.price?.toLocaleString()}`,
      item.status,
      item.postedByAgent?.email || "-"
    ]);

    autoTable(doc, {
      startY: 20,
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("property_report.pdf");
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Navigation Bar */}
      <div className="flex space-x-4 mb-8">
        <button onClick={() => navigate("/admin/bookings")} className="flex items-center gap-2 px-5 py-3 bg-gray-100 hover:bg-green-100 text-gray-700 rounded-lg transition-colors">
          <Home className="w-5 h-5 text-green-600" /> <span>Dashboard</span>
        </button>
        <button onClick={() => navigate("/admin/analytics")} className="flex items-center gap-2 px-5 py-3 bg-gray-100 hover:bg-green-100 text-gray-700 rounded-lg transition-colors">
          <BarChart2 className="w-5 h-5 text-green-600" /> <span>Analytics</span>
        </button>
        <button onClick={() => navigate("/admin")} className="flex items-center gap-2 px-5 py-3 bg-gray-100 hover:bg-green-100 text-gray-700 rounded-lg transition-colors">
          <Building className="w-5 h-5 text-green-600" /> <span>Properties</span>
        </button>
        <button onClick={() => navigate("/admin/inquiries")} className="flex items-center gap-2 px-5 py-3 bg-gray-100 hover:bg-green-100 text-gray-700 rounded-lg transition-colors">
          <MessageSquare className="w-5 h-5 text-green-600" /> <span>Inquiries</span>
        </button>
        <button onClick={() => navigate("/reports")} className="flex items-center gap-2 px-5 py-3 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg transition-colors">
          <FileText className="w-5 h-5" /> <span>Reports</span>
        </button>
      </div>

      {/* Report Section */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">Dynamic Property Report</h1>
          {reportData.length > 0 && (
            <div className="flex gap-3">
              <button onClick={exportCSV} className="flex items-center gap-2 bg-yellow-200 px-4 py-2 rounded hover:bg-yellow-300 text-yellow-900">
                <Download size={18} /> CSV
              </button>
              <button onClick={exportPDF} className="flex items-center gap-2 bg-yellow-200 px-4 py-2 rounded hover:bg-yellow-300 text-yellow-900">
                <Download size={18} /> PDF
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
            >
              <option value="">All Types</option>
              <option value="rent">Rent</option>
              <option value="selling">Selling</option>
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
            >
              <option value="">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div>
            <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">District</label>
            <select
              name="district"
              value={filters.district}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
            >
              <option value="">All Districts</option>
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="agentId" className="block text-sm font-medium text-gray-700 mb-1">Agent</label>
            <select
              name="agentId"
              value={filters.agentId}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
            >
              <option value="">All Agents</option>
              {agents.map((a) => (
                <option key={a._id} value={a._id}>{a.email}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={fetchReport}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow mb-6"
        >
          Generate Report
        </button>

        {reportData.length > 0 ? (
          <div className="overflow-x-auto rounded border">
            <table className="min-w-full bg-white">
              <thead className="bg-green-100">
                <tr>
                  <th className="p-3 text-left">Title</th>
                  <th className="p-3 text-left">Type</th>
                  <th className="p-3 text-left">District</th>
                  <th className="p-3 text-left">Price</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Agent</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((item) => (
                  <tr key={item._id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{item.title}</td>
                    <td className="p-3 capitalize">{item.propertyType}</td>
                    <td className="p-3">{item.district}</td>
                    <td className="p-3">LKR {item.price?.toLocaleString()}</td>
                    <td className="p-3 capitalize">{item.status}</td>
                    <td className="p-3">{item.postedByAgent?.email || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-600 mt-8">No data available. Please generate a report.</p>
        )}
      </div>
    </div>
  );
};

export default DynamicReport;
