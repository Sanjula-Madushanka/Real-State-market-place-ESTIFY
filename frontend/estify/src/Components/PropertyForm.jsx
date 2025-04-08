import React, { useState } from "react";
import axios from "axios";
import { DISTRICTS } from "../constants/districts";
import { Home, MapPin, Phone, Image as ImageIcon, BadgePlus } from "lucide-react";

const PropertyForm = ({ isUpdate = false, originalPropertyId = null }) => {
  const initialFormState = {
    title: "",
    description: "",
    contactName: "",
    contactNumber: "",
    propertyType: "rent",
    district: "",
    price: "",
    image: null,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({ ...formData, [name]: files ? files[0] : value });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title || formData.title.length < 3)
      newErrors.title = "Title must be at least 3 characters.";
    if (!formData.description || formData.description.length < 10)
      newErrors.description = "Description must be at least 10 characters.";
    if (!formData.contactName || !/^[A-Za-z\s]+$/.test(formData.contactName))
      newErrors.contactName = "Contact name must contain only letters.";
    if (!formData.contactNumber || !/^[0-9]{10}$/.test(formData.contactNumber))
      newErrors.contactNumber = "Contact number must be exactly 10 digits.";
    if (!formData.district)
      newErrors.district = "District is required.";
    if (formData.price === "" || Number(formData.price) < 0)
      newErrors.price = "Price must be a positive number.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const data = new FormData();
    for (let key in formData) {
      data.append(key, formData[key]);
    }
    if (isUpdate) data.append("originalPropertyId", originalPropertyId);

    try {
      const url = isUpdate
        ? "http://localhost:5001/api/properties/update"
        : "http://localhost:5001/api/properties/post";

      const token = localStorage.getItem("agentToken");
      if (!token) {
        alert("Agent is not logged in. Please login to post a property.");
        return;
      }

      await axios.post(url, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Request submitted for approval.");
      setFormData(initialFormState);
    } catch (err) {
      console.error(err);
      alert("Error submitting form");
    }
  };

  const inputClass = (field) =>
    `border p-3 w-full rounded shadow-sm focus:ring-2 focus:outline-none ${
      errors[field] ? "border-red-500 ring-red-200" : "ring-green-200"
    }`;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 bg-white p-8 rounded-2xl shadow-2xl max-w-2xl mx-auto mt-10 border border-green-100"
    >
      <h2 className="text-3xl font-bold text-center text-green-700 flex items-center justify-center gap-2">
        <BadgePlus /> {isUpdate ? "Update Property" : "Add New Property"}
      </h2>

      <div>
        <input
          name="title"
          placeholder="Title"
          minLength={3}
          value={formData.title}
          onChange={handleChange}
          className={inputClass("title")}
          required
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
      </div>

      <div>
        <textarea
          name="description"
          placeholder="Description"
          minLength={10}
          value={formData.description}
          onChange={handleChange}
          className={inputClass("description")}
          required
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
      </div>

      <div>
        <input
          name="contactName"
          placeholder="Contact Name"
          value={formData.contactName}
          onChange={handleChange}
          className={inputClass("contactName")}
          required
        />
        {errors.contactName && <p className="text-red-500 text-sm mt-1">{errors.contactName}</p>}
      </div>

      <div>
        <input
          name="contactNumber"
          placeholder="Contact Number"
          value={formData.contactNumber}
          onChange={handleChange}
          className={inputClass("contactNumber")}
          maxLength={10}
          required
        />
        {errors.contactNumber && <p className="text-red-500 text-sm mt-1">{errors.contactNumber}</p>}
      </div>

      <div className="flex gap-4">
        <select
          name="propertyType"
          onChange={handleChange}
          value={formData.propertyType}
          className="border p-3 w-full rounded shadow-sm"
          required
        >
          <option value="rent">Rent</option>
          <option value="selling">Selling</option>
        </select>

        <input
          name="price"
          type="number"
          min={0}
          value={formData.price}
          placeholder={
            formData.propertyType === "rent"
              ? "Monthly Rent (LKR)"
              : "Total Price (LKR)"
          }
          onChange={handleChange}
          className={inputClass("price")}
          required
        />
      </div>
      {errors.price && <p className="text-red-500 text-sm -mt-3">{errors.price}</p>}

      <div>
        <select
          name="district"
          value={formData.district}
          onChange={handleChange}
          className={inputClass("district")}
          required
        >
          <option value="">Select District</option>
          {DISTRICTS.map((district) => (
            <option key={district} value={district}>
              {district}
            </option>
          ))}
        </select>
        {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district}</p>}
      </div>

      <div className="flex items-center gap-2">
        <ImageIcon className="text-gray-500" />
        <input
          type="file"
          name="image"
          onChange={handleChange}
          className="border p-2 rounded w-full"
        />
      </div>

      <button
        type="submit"
        className="bg-emerald-600 hover:bg-emerald-700 text-white p-3 w-full rounded-xl font-semibold shadow"
      >
        {isUpdate ? "Submit Update" : "Add Property"}
      </button>
    </form>
  );
};

export default PropertyForm;
