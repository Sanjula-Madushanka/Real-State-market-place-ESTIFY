import mongoose from "mongoose";

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
    minlength: [3, "Title must be at least 3 characters"]
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    minlength: [10, "Description must be at least 10 characters"]
  },
  contactName: {
    type: String,
    required: [true, "Contact name is required"],
    trim: true,
    match: [/^[A-Za-z\s]+$/, "Contact name must contain only letters"]
  },  
  contactNumber: {
    type: String,
    required: [true, "Mobile number is required"],
    match: [/^[0-9]{10}$/, "Enter a valid 10-digit mobile number"]
  },
  propertyType: {
    type: String,
    enum: ["rent", "selling"],
    required: [true, "Property type is required"]
  },
  district: {
    type: String,
    required: [true, "District is required"],
    trim: true
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: [0, "Price cannot be negative"]
  },
  image: {
    type: String
  },
  status: {
    type: String,
    enum: ["pending", "approved"],
    default: "pending"
  },
  requestType: {
    type: String,
    enum: ["add", "update", "delete"],
    default: "add"
  },
  originalPropertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property"
  },
  postedByAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Agent",
    required: true,
  },
}, {
  timestamps: true
});

const Property = mongoose.model("Property", propertySchema);
export default Property;