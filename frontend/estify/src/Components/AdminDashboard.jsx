"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { Home, BarChart2, Building, MessageSquare, FileText } from "lucide-react"

const AdminDashboard = () => {
  const [requests, setRequests] = useState([])
  const [filterType, setFilterType] = useState("all")
  const navigate = useNavigate()

  const fetchPending = async () => {
    const res = await axios.get("http://localhost:5001/api/properties/pending")
    const requestsWithOriginals = await Promise.all(
      res.data.map(async (req) => {
        if (req.requestType === "update" && req.originalPropertyId) {
          try {
            const original = await axios.get(`http://localhost:5001/api/properties/${req.originalPropertyId}`)
            return { ...req, original: original.data }
          } catch {
            return req
          }
        }
        return req
      })
    )
    setRequests(requestsWithOriginals)
  }

  useEffect(() => {
    fetchPending()
  }, [])

  const handleApprove = async (id) => {
    await axios.post(`http://localhost:5001/api/properties/approve/${id}`)
    fetchPending()
  }

  const handleReject = async (id) => {
    await axios.delete(`http://localhost:5001/api/properties/reject/${id}`)
    fetchPending()
  }

  const highlightClass = (field, req) =>
    req.original && req.original[field] !== req[field] ? "bg-yellow-100 border-l-4 border-yellow-500 pl-2" : ""

  const filteredRequests = filterType === "all" ? requests : requests.filter((r) => r.requestType === filterType)

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Navigation Bar */}
      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => navigate("/admin/bookings")}
          className="flex items-center gap-2 px-5 py-3 bg-silver hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
        >
          <Home className="w-5 h-5 text-green-600" />
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => navigate("/admin/analytics")}
          className="flex items-center gap-2 px-5 py-3 bg-silver hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
        >
          <BarChart2 className="w-5 h-5 text-green-600" />
          <span>Analytics</span>
        </button>
        <button
  onClick={() => navigate("/admin")}
  className="flex items-center gap-2 px-5 py-3 bg-silver hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
>
  <Building className="w-5 h-5 text-green-600" />
  <span>Properties</span>
</button>

        <button
          onClick={() => navigate("/admin/inquiries")}
          className="flex items-center gap-2 px-5 py-3 bg-silver hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
        >
          <MessageSquare className="w-5 h-5 text-green-600" />
          <span>Inquiries</span>
        </button>
        <button
          onClick={() => navigate("/reports")}
          className="flex items-center gap-2 px-5 py-3 bg-silver hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
        >
          <FileText className="w-5 h-5 text-green-600" />
          <span>Reports</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-3xl font-bold text-green-700 mb-4 md:mb-0">Property Requests</h1>
          <span className="bg-gold text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            {filteredRequests.length} {filteredRequests.length === 1 ? "Request" : "Requests"}
          </span>
        </div>

        <div className="mb-6">
          <label htmlFor="filterType" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Request Type
          </label>
          <select
            id="filterType"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
          >
            <option value="all">All</option>
            <option value="add">Add</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
          </select>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No requests found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {requests.length === 0
                ? "There are no property requests in the system yet."
                : "No requests match your current filter."}
            </p>
            <div className="mt-6">
              <button
                onClick={() => setFilterType("all")}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
              >
                Clear filters
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredRequests.map((req) => (
              <div key={req._id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex flex-col md:flex-row gap-6">
                  {req.image && (
                    <img
                      src={`http://localhost:5001/uploads/${req.image}`}
                      alt={req.title}
                      className="h-48 w-full md:w-64 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-green-700 mb-3">Requests</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <h3 className="font-semibold">New</h3>
                        <p className={`text-gray-700 ${highlightClass("title", req)}`}>Title: {req.title}</p>
                        <p className={`text-gray-700 ${highlightClass("description", req)}`}>Description: {req.description}</p>
                        <p className={`text-gray-700 ${highlightClass("propertyType", req)}`}>Type: {req.propertyType}</p>
                        <p className={`text-gray-700 ${highlightClass("district", req)}`}>District: {req.district}</p>
                        <p className={`text-gray-700 ${highlightClass("price", req)}`}>Price: LKR {req.price?.toLocaleString()}</p>
                        <p className={`text-gray-700 ${highlightClass("contactName", req)}`}>Contact Name: {req.contactName}</p>
                        <p className={`text-gray-700 ${highlightClass("contactNumber", req)}`}>Contact No: {req.contactNumber}</p>
                      </div>
                      {req.original && (
                        <div className="space-y-1">
                          <h3 className="font-semibold">Original</h3>
                          <p className="text-gray-600">Title: {req.original.title}</p>
                          <p className="text-gray-600">Description: {req.original.description}</p>
                          <p className="text-gray-600">Type: {req.original.propertyType}</p>
                          <p className="text-gray-600">District: {req.original.district}</p>
                          <p className="text-gray-600">Price: LKR {req.original.price?.toLocaleString()}</p>
                          <p className="text-gray-600">Contact Name: {req.original.contactName}</p>
                          <p className="text-gray-600">Contact No: {req.original.contactNumber}</p>
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-gray-500 mt-2">
                      Request Type: <span className="capitalize font-medium">{req.requestType}</span>
                    </p>

                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={() => handleApprove(req._id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(req._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
