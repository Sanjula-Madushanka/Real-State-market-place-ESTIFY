import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import './AddBooking.css'; // Create this CSS file for your styles

const AddBooking = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchingBookings, setFetchingBookings] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [bookedDates, setBookedDates] = useState([]);
  const [formData, setFormData] = useState({
    startDate: null,
    endDate: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };

        // Fetch property details
        const propertyResponse = await axios.get(
          `http://localhost:5001/api/properties/${propertyId}`,
          config
        );
        
        if (propertyResponse.data.propertyType !== 'rent') {
          setError('This property is not available for rent');
          setLoading(false);
          return;
        }
        
        setProperty(propertyResponse.data);

        // Fetch existing bookings for this property (all non-rejected bookings)
        setFetchingBookings(true);
        try {
          const bookingsResponse = await axios.get(
            `http://localhost:5001/api/bookings/property/availability`,
            {
              ...config,
              params: {
                propertyId,
                // Remove status filter to get all non-rejected bookings
              }
            }
          );
          
          // Extract all booked date ranges
          const dates = bookingsResponse.data.bookings?.map(booking => ({
            start: new Date(booking.startDate),
            end: new Date(booking.endDate),
            status: booking.status // Include status for styling
          })) || [];
          
          setBookedDates(dates);
        } catch (bookingsError) {
          if (bookingsError.response?.status !== 404) {
            console.error('Error fetching bookings:', bookingsError);
          }
          // If 404, just continue with empty bookedDates array
          setBookedDates([]);
        } finally {
          setFetchingBookings(false);
        }

        setLoading(false);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setError(err.response?.data?.message || 'Failed to fetch property details');
        }
        setLoading(false);
      }
    };

    fetchData();
  }, [propertyId, navigate]);

  const isDateBooked = (date) => {
    return bookedDates.some(
      booking => date >= booking.start && date <= booking.end
    );
  };

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setFormData({
      ...formData,
      startDate: start,
      endDate: end
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!formData.startDate || !formData.endDate) {
      setError('Please select booking dates');
      return;
    }

    if (formData.startDate > formData.endDate) {
      setError('End date must be after start date');
      return;
    }

    const isOverlapping = bookedDates.some(booking => {
      return (
        (formData.startDate <= booking.end && formData.endDate >= booking.start)
      );
    });

    if (isOverlapping) {
      setError('Selected dates overlap with existing bookings');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const bookingData = {
        propertyId,
        startDate: formData.startDate,
        endDate: formData.endDate
      };

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      const response = await axios.post(
        'http://localhost:5001/api/bookings', 
        bookingData, 
        config
      );
      
      if (response.data.booking) {
        setSuccess(true);
        setTimeout(() => navigate('/my-bookings'), 2000);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                         (err.response?.status === 400 ? 'Property is not available during the requested dates' : 
                         'Failed to submit booking');
      setError(errorMessage);
    }
  };

  // Custom day class for DatePicker
  const dayClassName = (date) => {
    const isBooked = bookedDates.some(
      booking => date >= booking.start && date <= booking.end
    );
    
    if (isBooked) {
      return 'booked-date';
    }
    return null;
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-lg">
        <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
        Loading property details...
      </div>
    );
  }

  if (!property) {
    return <div className="text-center text-red-500 py-12">Property not found</div>;
  }

  if (error && error === 'This property is not available for rent') {
    return (
      <div className="booking-container py-12 text-center">
        <div className="text-red-500 font-semibold">{error}</div>
        <button 
          onClick={() => navigate(-1)} 
          className="mt-6 px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-md">
      <h2 className="text-2xl font-semibold text-center mb-6">
        Book Property: {property.title}
      </h2>
      
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <div className="flex-shrink-0">
          {property.image && (
            <img 
              src={`http://localhost:5001/uploads/${property.image}`} 
              alt={property.title} 
              className="w-full md:w-72 h-48 object-cover rounded-md"
            />
          )}
        </div>
        <div className="flex-1">
          <p><strong>Type:</strong> For Rent</p>
          <p><strong>Location:</strong> {property.district}</p>
          <p><strong>Price:</strong> Rs.{property.price.toLocaleString()} per day</p>
          <p><strong>Contact:</strong> {property.contactName} - {property.contactNumber}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <h3 className="text-xl font-semibold">Select Rental Period</h3>
        
        <div className="form-group">
          <label className="block text-gray-700 mb-2">Booking Dates:</label>
          <div className="relative">
            <DatePicker
              selectsRange
              startDate={formData.startDate}
              endDate={formData.endDate}
              onChange={handleDateChange}
              minDate={new Date()}
              placeholderText="Select date range"
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              dayClassName={dayClassName}
              excludeDateIntervals={bookedDates.map(booking => ({
                start: booking.start,
                end: booking.end
              }))}
              required
              disabled={fetchingBookings}
            />
            {fetchingBookings && (
              <div className="absolute right-3 top-2">
                <FontAwesomeIcon icon={faSpinner} spin />
              </div>
            )}
          </div>
          {bookedDates.length > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              Dates marked in red are already booked
            </p>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
            <div className="bg-green-100 text-green-700 p-6 rounded-lg shadow-lg flex items-center space-x-4 animate-pulse">
              <FontAwesomeIcon icon={faCheckCircle} className="text-4xl" />
              <span className="text-lg">Booking request submitted successfully!</span>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-4">
          <button 
            type="button" 
            onClick={() => navigate(-1)} 
            className="px-6 py-3 bg-gray-500 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-6 py-3 bg-green-500 text-white rounded hover:bg-green-700 transition-colors disabled:bg-green-300"
            disabled={fetchingBookings}
          >
            {fetchingBookings ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                Processing...
              </>
            ) : (
              'Submit Booking Request'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddBooking;