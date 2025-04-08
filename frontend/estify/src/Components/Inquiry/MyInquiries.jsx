import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MyInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:5001/api/inquiries', {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Ensure we have an array and filter out invalid inquiries
        const validInquiries = Array.isArray(response.data.inquiries)
          ? response.data.inquiries.filter(inquiry => inquiry && inquiry.booking)
          : [];
        setInquiries(validInquiries);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch inquiries');
        console.error('Fetch inquiries error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, [navigate]);

  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleDateString() : 'N/A';
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      responded: 'bg-green-100 text-green-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status ? status.toUpperCase() : 'UNKNOWN'}
      </span>
    );
  };

  if (loading) return <div className="text-center py-8">Loading your inquiries...</div>;
  if (error) return <div className="text-center text-red-500 py-8">{error}</div>;

  return (
    <div prostitv div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Inquiries</h1>
      
      {inquiries.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">You haven't submitted any inquiries yet.</p>
          <button
            onClick={() => navigate('/bookings')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            View Bookings
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left">Property</th>
                <th className="py-3 px-4 text-left">Booking Dates</th>
                <th className="py-3 px-4 text-left">Message</th>
                <th className="py-3 px-4 text-left">Response</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {inquiries.map((inquiry) => (
                <tr key={inquiry._id}>
                  <td className="py-4 px-4">
                    <div
                      className="cursor-pointer hover:text-blue-500"
                      onClick={() => inquiry.booking?.property?._id && navigate(`/properties/${inquiry.booking.property._id}`)}
                    >
                      <div className="font-medium">
                        {inquiry.booking?.property?.title || 'Unknown Property'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {inquiry.booking?.property?.district || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {inquiry.booking
                      ? `${formatDate(inquiry.booking.startDate)} - ${formatDate(inquiry.booking.endDate)}`
                      : 'N/A'}
                  </td>
                  <td class  className="py-4 px-4">{inquiry.message}</td>
                  <td className="py-4 px-4">
                    {inquiry.response || 'No response yet'}
                  </td>
                  <td className="py-4 px-4">
                    {getStatusBadge(inquiry.status)}
                  </td>
                  <td className="py-4 px-4">
                    {formatDate(inquiry.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyInquiries;