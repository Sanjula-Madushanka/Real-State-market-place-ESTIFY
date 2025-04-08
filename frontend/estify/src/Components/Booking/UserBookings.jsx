import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const UserBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editDates, setEditDates] = useState({
    startDate: null,
    endDate: null,
  });
  const [filter, setFilter] = useState("all");
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState(null);
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [unavailableDates, setUnavailableDates] = useState([]);
  const navigate = useNavigate();

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setEditDates({ startDate: start, endDate: end });
    setError(''); // Clear any previous errors when dates change
  };

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get("http://localhost:5001/api/bookings", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const validBookings = Array.isArray(response.data.bookings)
          ? response.data.bookings.filter(
              (booking) => booking && booking.property
            )
          : [];
        setBookings(validBookings);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch bookings");
        console.error("Fetch bookings error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [navigate]);

  const fetchUnavailableDates = async (propertyId, currentBookingId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5001/api/bookings/property/availability`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { propertyId },
        }
      );

      // Filter out the current booking's dates (so user can keep their original dates)
      const dates =
        response.data.bookings
          ?.filter((booking) => booking._id !== currentBookingId)
          ?.map((booking) => ({
            start: new Date(booking.startDate),
            end: new Date(booking.endDate),
          })) || [];

      setUnavailableDates(dates);
    } catch (err) {
      console.error("Error fetching unavailable dates:", err);
      setUnavailableDates([]);
    }
  };

  const handleEditClick = async (booking) => {
    setEditingId(booking._id);
    setEditDates({
      startDate: new Date(booking.startDate),
      endDate: new Date(booking.endDate),
    });

    if (booking.property?._id) {
      await fetchUnavailableDates(booking.property._id, booking._id);
    }
  };

  const isDateUnavailable = (date) => {
    return unavailableDates.some(
      (range) => date >= range.start && date <= range.end
    );
  };

  const handleUpdateBooking = async (bookingId) => {
    if (!editDates.startDate || !editDates.endDate) {
      setError("Please select booking dates");
      return;
    }

    if (editDates.startDate > editDates.endDate) {
      setError("End date must be after start date");
      return;
    }

    const isOverlapping = unavailableDates.some((range) => {
      return (
        editDates.startDate <= range.end && editDates.endDate >= range.start
      );
    });

    if (isOverlapping) {
      setError("Selected dates overlap with existing bookings");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5001/api/bookings/${bookingId}`,
        {
          startDate: editDates.startDate,
          endDate: editDates.endDate,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBookings(
        bookings.map((b) => (b._id === bookingId ? response.data.booking : b))
      );
      setEditingId(null);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update booking");
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5001/api/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(bookings.filter((b) => b._id !== bookingId));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel booking");
    }
  };

  const handleInquiryClick = (bookingId) => {
    setCurrentBookingId(bookingId);
    setInquiryMessage("");
    setShowInquiryModal(true);
  };

  const submitInquiry = async () => {
    if (!inquiryMessage.trim()) {
      alert("Please enter your inquiry message");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5001/api/inquiries",
        { bookingId: currentBookingId, message: inquiryMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setShowInquiryModal(false);
      alert("Inquiry submitted successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit inquiry");
      setShowInquiryModal(false);
    }
  };

  const formatDate = (dateString) => {
    return dateString
      ? new Date(dateString).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "N/A";
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      confirmed: "bg-green-100 text-green-800 border border-green-200",
      rejected: "bg-red-100 text-red-800 border border-red-200",
      cancelled: "bg-gray-100 text-gray-800 border border-gray-200",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          statusClasses[status] || "bg-gray-100 text-gray-800"
        } shadow-sm`}
      >
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown"}
      </span>
    );
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter === "all") return true;
    return booking.status === filter;
  });

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-xl font-medium text-gray-700">
            Loading your bookings...
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Please wait while we fetch your reservation details
          </p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
        <div className="max-w-md p-6 bg-white rounded-xl shadow-lg text-center">
          <div className="text-red-500 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Try Again
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-200 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Go Home
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Inquiry Modal */}
      {showInquiryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Submit Inquiry
              </h3>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows={5}
                placeholder="Enter your inquiry message here..."
                value={inquiryMessage}
                onChange={(e) => setInquiryMessage(e.target.value)}
              />
              <div className="mt-4 flex justify-end space-x-3">
                <button
                  onClick={() => setShowInquiryModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={submitInquiry}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Submit Inquiry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Your Bookings
          </h1>
          <p className="mt-3 text-xl text-gray-600">
            Manage your upcoming and past reservations
          </p>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-2xl mx-auto p-8 text-center">
            <div className="bg-blue-50 rounded-full p-4 inline-block mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-medium text-gray-900 mb-2">
              No bookings yet
            </h3>
            <p className="text-gray-500 mb-6">
              You haven't made any reservations. Start exploring properties to
              book your stay.
            </p>
            <button
              onClick={() => navigate("/properties")}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out transform hover:-translate-y-1 hover:shadow-md"
            >
              Browse Properties
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="ml-2 -mr-1 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </button>
          </div>
        ) : (
          <div className="bg-white shadow-xl rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between">
              <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                <h2 className="text-lg font-medium text-gray-900">
                  Your Reservations
                </h2>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {filteredBookings.length}{" "}
                  {filteredBookings.length === 1 ? "booking" : "bookings"}
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-3 py-1 text-sm rounded-md ${
                    filter === "all"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter("pending")}
                  className={`px-3 py-1 text-sm rounded-md ${
                    filter === "pending"
                      ? "bg-yellow-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setFilter("confirmed")}
                  className={`px-3 py-1 text-sm rounded-md ${
                    filter === "confirmed"
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Confirmed
                </button>
                <button
                  onClick={() => setFilter("cancelled")}
                  className={`px-3 py-1 text-sm rounded-md ${
                    filter === "cancelled"
                      ? "bg-gray-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Cancelled
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Property
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Dates
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Total Price
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBookings.map((booking) => (
                    <tr
                      key={booking._id}
                      className="hover:bg-gray-50 transition duration-150 ease-in-out"
                    >
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-16 w-16 rounded-lg overflow-hidden">
                            {booking.property?.images?.[0] ? (
                              <img
                                className="h-full w-full object-cover cursor-pointer hover:opacity-90 transition duration-200"
                                src={booking.property.images[0]}
                                alt={booking.property.title}
                                onClick={() =>
                                  booking.property?._id &&
                                  navigate(
                                    `/properties/${booking.property._id}`
                                  )
                                }
                              />
                            ) : (
                              <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-8 w-8 text-gray-400"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div
                              className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600 transition duration-150"
                              onClick={() =>
                                booking.property?._id &&
                                navigate(`/properties/${booking.property._id}`)
                              }
                            >
                              {booking.property?.title || "Unknown Property"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {booking.property?.district || "N/A"},{" "}
                              {booking.property?.city || "N/A"}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              Booked on {formatDate(booking.createdAt)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        {editingId === booking._id ? (
                          <DatePicker
                            selectsRange
                            startDate={editDates.startDate}
                            endDate={editDates.endDate}
                            onChange={handleDateChange}
                            minDate={new Date()}
                            className="border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                            dateFormat="MMM d, yyyy"
                            dayClassName={(date) =>
                              isDateUnavailable(date) ? "booked-date" : null
                            }
                            excludeDateIntervals={unavailableDates.map(
                              (range) => ({
                                start: range.start,
                                end: range.end,
                              })
                            )}
                          />
                        ) : (
                          <div className="text-sm text-gray-900">
                            <div className="font-medium">
                              {formatDate(booking.startDate)}
                            </div>
                            <div className="text-gray-500">to</div>
                            <div className="font-medium">
                              {formatDate(booking.endDate)}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          Rs.
                          {booking.price && booking.startDate && booking.endDate
                            ? (
                                booking.price *
                                ((new Date(booking.endDate) -
                                  new Date(booking.startDate)) /
                                  (1000 * 60 * 60 * 24))
                              ).toFixed(2)
                            : "N/A"}
                          <div className="text-xs text-gray-500">
                            Rs.{booking.price?.toFixed(2) || "N/A"} per night
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        {getStatusBadge(booking.status)}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-medium">
                        {editingId === booking._id ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleUpdateBooking(booking._id)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {booking.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleEditClick(booking)}
                                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-1"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                  </svg>
                                  Edit
                                </button>
                                <button
                                  onClick={() =>
                                    handleCancelBooking(booking._id)
                                  }
                                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-1"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                  Cancel
                                </button>
                              </>
                            )}
                            {booking.status === "confirmed" && (
                              <button
                                onClick={() =>
                                  navigate(`/bookings/${booking._id}`)
                                }
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 mr-1"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                                View
                              </button>
                            )}
                            <button
                              onClick={() => handleInquiryClick(booking._id)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                                />
                              </svg>
                              Inquire
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredBookings.length === 0 && (
              <div className="text-center py-8 bg-gray-50">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No bookings found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try changing your filter criteria
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserBookings;
