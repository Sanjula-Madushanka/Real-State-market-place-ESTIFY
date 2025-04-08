import React, { useState } from "react";
import axios from "axios";
import { DISTRICTS } from "../constants/districts";

const PropertyTable = ({ properties, refresh }) => {
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({});

  const handleEditClick = (property) => {
    setEditing(property._id);
    setFormData({ ...property });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateSubmit = async () => {
    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("contactName", formData.contactName);
    data.append("contactNumber", formData.contactNumber);
    data.append("propertyType", formData.propertyType);
    data.append("district", formData.district);
    data.append("price", formData.price);
    data.append("originalPropertyId", formData._id);

    try {
      const token = localStorage.getItem("agentToken");

      await axios.post("http://localhost:5001/api/properties/update", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      alert("Update request sent.");
      setEditing(null);
      if (refresh) refresh();
    } catch (err) {
      console.error("Failed to send update request", err);
    }
  };

  const handleDeleteRequest = async (id) => {
    const confirmed = confirm("Send delete request for this property?");
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("agentToken");

      await axios.delete(`http://localhost:5001/api/properties/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      alert("Delete request sent.");
      refresh();
    } catch (err) {
      console.error("Failed to send delete request", err);
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border shadow-md">
      <table className="min-w-full bg-white text-left">
        <thead className="bg-gradient-to-r from-green-600 to-green-500 text-white">
          <tr>
            <th className="p-4 font-semibold">Title</th>
            <th className="p-4 font-semibold">Description</th>
            <th className="p-4 font-semibold">Type</th>
            <th className="p-4 font-semibold">District</th>
            <th className="p-4 font-semibold">Price</th>
            <th className="p-4 font-semibold">Contact</th>
            <th className="p-4 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {properties.map((prop) => (
            <tr key={prop._id} className="border-t hover:bg-gray-50">
              <td className="p-4">
                {editing === prop._id ? (
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="border p-1 rounded w-full"
                  />
                ) : (
                  <span className="font-medium text-gray-800">{prop.title}</span>
                )}
              </td>
              <td className="p-4">
                {editing === prop._id ? (
                  <input
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="border p-1 rounded w-full"
                  />
                ) : (
                  <span className="text-gray-600 text-sm">{prop.description}</span>
                )}
              </td>
              <td className="p-4 capitalize">
                {editing === prop._id ? (
                  <select
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleChange}
                    className="border p-1 rounded w-full"
                  >
                    <option value="rent">Rent</option>
                    <option value="selling">Selling</option>
                  </select>
                ) : (
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
                    {prop.propertyType}
                  </span>
                )}
              </td>
              <td className="p-4">
                {editing === prop._id ? (
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    className="border p-1 rounded w-full"
                  >
                    <option value="">Select District</option>
                    {DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                ) : (
                  prop.district
                )}
              </td>
              <td className="p-4">
                {editing === prop._id ? (
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="border p-1 rounded w-full"
                  />
                ) : (
                  <span className="text-emerald-600 font-semibold">
                    LKR {prop.price?.toLocaleString()} {" "}
                    <span className="text-sm text-gray-500">
                      {prop.propertyType === "rent" ? "(Monthly)" : "(Total)"}
                    </span>
                  </span>
                )}
              </td>
              <td className="p-4">
                {editing === prop._id ? (
                  <div className="space-y-1">
                    <input
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleChange}
                      className="border p-1 rounded w-full"
                      placeholder="Name"
                    />
                    <input
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      className="border p-1 rounded w-full"
                      placeholder="Number"
                    />
                  </div>
                ) : (
                  <span className="text-gray-700 text-sm">
                    {prop.contactName} ({prop.contactNumber})
                  </span>
                )}
              </td>
              <td className="p-4 space-x-2">
                {editing === prop._id ? (
                  <>
                    <button
                      onClick={handleUpdateSubmit}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded shadow"
                    >
                      Send
                    </button>
                    <button
                      onClick={() => setEditing(null)}
                      className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded shadow"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleEditClick(prop)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded shadow"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => handleDeleteRequest(prop._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded shadow"
                    >
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PropertyTable;
