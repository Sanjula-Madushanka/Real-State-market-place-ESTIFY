import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [responseText, setResponseText] = useState({});
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedInquiry, setExpandedInquiry] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Fetch all inquiries on component mount
  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const { data } = await axios.get("http://localhost:5001/api/inquiries/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setInquiries(data.inquiries);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch inquiries");
        setLoading(false);
        if (err.response?.status === 401) {
          navigate("/login");
        }
      }
    };

    fetchInquiries();
  }, [token, navigate]);

  // Handle response submission
  const handleRespond = async (inquiryId) => {
    if (!responseText[inquiryId] || responseText[inquiryId].trim() === "") {
      setError("Response cannot be empty");
      return;
    }

    try {
      const { data } = await axios.put(
        `http://localhost:5001/api/inquiries/${inquiryId}/respond`,
        { response: responseText[inquiryId] },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setInquiries((prevInquiries) =>
        prevInquiries.map((inquiry) =>
          inquiry._id === inquiryId ? data.inquiry : inquiry
        )
      );
      setResponseText((prev) => ({ ...prev, [inquiryId]: "" }));
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit response");
    }
  };

  // Filter inquiries based on status and search query
  const filteredInquiries = inquiries.filter((inquiry) => {
    const matchesStatus = statusFilter === "all" || inquiry.status === statusFilter;
    const matchesSearch = 
      inquiry.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.response?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.booking?._id?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      responded: "bg-green-100 text-green-800 border-green-200",
      resolved: "bg-blue-100 text-blue-800 border-blue-200",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusClasses[status] || "bg-gray-100 text-gray-800 border-gray-200"}`}>
        {status ? status.toUpperCase() : "UNKNOWN"}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading inquiries...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-md mx-auto text-center bg-white p-8 rounded-lg shadow-md">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Error</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("admin/bookings")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg shadow transition duration-200"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Navigation Bar */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => navigate("/admin/bookings")}
            className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </button>
          <button
            onClick={() => navigate("/admin/analytics")}
            className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Analytics
          </button>
          <button
            onClick={() => navigate("/admin")}
            className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Properties
          </button>
          <button
            onClick={() => navigate("/admin/inquiries")}
            className="flex items-center px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg transition duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Inquiries
          </button>
          <button
            onClick={() => navigate("/reports")}
            className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 4h6m-3-14v6m-7 2a9 9 0 1118 0 9 9 0 01-18 0z" />
            </svg>
            Reports
          </button>
          
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">Inquiry Management</h1>
          <div className="flex items-center space-x-2">
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {filteredInquiries.length} {filteredInquiries.length === 1 ? "Inquiry" : "Inquiries"}
            </span>
          </div>
        </div>

        {/* Filters Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Status
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="responded">Responded</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div>
            <label htmlFor="searchQuery" className="block text-sm font-medium text-gray-700 mb-1">
              Search Inquiries
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                id="searchQuery"
                type="text"
                placeholder="Search by email, message, or booking ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              />
            </div>
          </div>
        </div>

        {filteredInquiries.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No inquiries found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {inquiries.length === 0 
                ? "There are no inquiries in the system yet." 
                : "No inquiries match your current filters."}
            </p>
            <div className="mt-6">
              <button
                onClick={() => {
                  setStatusFilter("all");
                  setSearchQuery("");
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Clear filters
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Response
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInquiries.map((inquiry) => (
                  <React.Fragment key={inquiry._id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{inquiry.user?.email || "Unknown User"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-mono">{inquiry.booking?._id || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div 
                          className={`text-sm text-gray-900 ${expandedInquiry === inquiry._id ? "" : "truncate max-w-xs"}`}
                          onClick={() => setExpandedInquiry(expandedInquiry === inquiry._id ? null : inquiry._id)}
                        >
                          {inquiry.message}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(inquiry.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-sm ${inquiry.response ? "text-gray-900" : "text-gray-400 italic"}`}>
                          {inquiry.response || "No response yet"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {inquiry.status === "pending" && (
                          <button
                            onClick={() => setExpandedInquiry(expandedInquiry === inquiry._id ? null : inquiry._id)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            {expandedInquiry === inquiry._id ? "Collapse" : "Respond"}
                          </button>
                        )}
                      </td>
                    </tr>
                    {expandedInquiry === inquiry._id && (
                      <tr className="bg-gray-50">
                        <td colSpan="6" className="px-6 py-4">
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-1">Original Message</h4>
                                <div className="bg-gray-100 p-3 rounded-lg text-sm text-gray-800">
                                  {inquiry.message}
                                </div>
                              </div>
                              {inquiry.response && (
                                <div>
                                  <h4 className="text-sm font-medium text-gray-700 mb-1">Previous Response</h4>
                                  <div className="bg-green-50 p-3 rounded-lg text-sm text-gray-800">
                                    {inquiry.response}
                                  </div>
                                </div>
                              )}
                            </div>
                            {inquiry.status === "pending" && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-1">Your Response</h4>
                                <textarea
                                  value={responseText[inquiry._id] || ""}
                                  onChange={(e) =>
                                    setResponseText((prev) => ({
                                      ...prev,
                                      [inquiry._id]: e.target.value,
                                    }))
                                  }
                                  placeholder="Type your response here..."
                                  rows="3"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                />
                                <div className="flex justify-end mt-2 space-x-3">
                                  <button
                                    onClick={() => setExpandedInquiry(null)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleRespond(inquiry._id)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
                                  >
                                    Submit Response
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInquiries;