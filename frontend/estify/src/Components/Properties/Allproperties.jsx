import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PropertyTable = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/properties');
        setProperties(response.data);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch properties');
        setLoading(false);
        console.error(err);
      }
    };

    fetchProperties();
  }, []);

  const handleBookNow = (propertyId) => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    navigate(`/bookings/${propertyId}`);
  };

  if (loading) return <div>Loading properties...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="property-table-container">
      <h2>Available Properties</h2>
      <table className="property-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Title</th>
            <th>Type</th>
            <th>District</th>
            <th>Price</th>
            <th>Contact</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {properties.map((property) => (
            <tr key={property._id}>
              <td>
                {property.image && (
                  <img 
                    src={`http://localhost:5001/uploads/${property.image}`} 
                    alt={property.title} 
                    width="100"
                  />
                )}
              </td>
              <td>{property.title}</td>
              <td>{property.propertyType === 'rent' ? 'For Rent' : 'For Sale'}</td>
              <td>{property.district}</td>
              <td>Rs.{property.price.toLocaleString()}</td>
              <td>
                <div>{property.contactName}</div>
                <div>{property.contactNumber}</div>
              </td>
              <td>
                {property.propertyType === 'rent' && (
                  <button 
                    onClick={() => handleBookNow(property._id)}
                    className="book-now-btn"
                  >
                    Book Now
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <style>{`
        .property-table-container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .property-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        
        .property-table th, .property-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        
        .property-table th {
          background-color: #f2f2f2;
          font-weight: bold;
        }
        
        .property-table tr:hover {
          background-color: #f5f5f5;
        }
        
        .book-now-btn {
          background-color: #4CAF50;
          color: white;
          border: none;
          padding: 8px 16px;
          text-align: center;
          text-decoration: none;
          display: inline-block;
          font-size: 14px;
          margin: 4px 2px;
          cursor: pointer;
          border-radius: 4px;
          transition: background-color 0.3s;
        }
        
        .book-now-btn:hover {
          background-color: #45a049;
        }
        
        img {
          border-radius: 4px;
          object-fit: cover;
        }
      `}</style>
    </div>
  );
};

export default PropertyTable;