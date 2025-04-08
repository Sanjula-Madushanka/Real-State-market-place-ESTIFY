import Property from "../../Models/PropertyModel.js";

// SUBMIT NEW PROPERTY (Agent → Admin Approval)
export const submitPropertyRequest = async (req, res) => {
  try {
    const image = req.file?.filename || null;
    const {
      title,
      description,
      contactName,
      contactNumber,
      propertyType,
      district,
      price
    } = req.body;

    const newProperty = new Property({
      title,
      description,
      contactName,
      contactNumber,
      propertyType,
      district,
      price,
      image,
      postedByAgent: req.agent.id
    });

    await newProperty.save();
    res.status(201).json({ message: "Request submitted for approval." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// APPROVE REQUEST (Admin Action)
export const approvePropertyRequest = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    if (property.requestType === "delete") {
      await Property.findByIdAndDelete(property._id);
      return res.json({ message: "Property deleted." });
    }

    if (property.requestType === "update" && property.originalPropertyId) {
      const original = await Property.findById(property.originalPropertyId);
      if (original) {
        original.title = property.title;
        original.description = property.description;
        original.contactName = property.contactName;
        original.contactNumber = property.contactNumber;
        original.propertyType = property.propertyType;
        original.district = property.district;
        original.price = property.price;
        if (property.image) original.image = property.image;
        await original.save();
        await Property.findByIdAndDelete(property._id);
        return res.json({ message: "Property updated successfully." });
      } else {
        return res.status(404).json({ message: "Original property not found." });
      }
    }

    property.status = "approved";
    property.requestType = "add";
    await property.save();
    res.json({ message: "Property approved." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL APPROVED PROPERTIES
export const getAllProperties = async (req, res) => {
  const properties = await Property.find({ status: "approved" });
  res.json(properties);
};

// GET PROPERTY BY ID (only approved)
export const getPropertyById = async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property || property.status !== "approved") {
    return res.status(404).json({ message: "Not found" });
  }
  res.json(property);
};

// REQUEST TO UPDATE PROPERTY (Agent → Admin Approval)
export const requestPropertyUpdate = async (req, res) => {
  try {
    const image = req.file?.filename || null;
    const {
      originalPropertyId,
      title,
      description,
      contactName,
      contactNumber,
      propertyType,
      district,
      price
    } = req.body;

    const newRequest = new Property({
      title,
      description,
      contactName,
      contactNumber,
      propertyType,
      district,
      price,
      image,
      status: "pending",
      requestType: "update",
      originalPropertyId,
      postedByAgent: req.agent.id
    });

    await newRequest.save();
    res.status(200).json({ message: "Update request submitted." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// REQUEST TO DELETE PROPERTY (Agent → Admin Approval)
export const requestPropertyDelete = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    property.status = "pending";
    property.requestType = "delete";
    property.postedByAgent = req.agent.id;
    await property.save();

    res.json({ message: "Delete request submitted for approval." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ALL PENDING REQUESTS (Admin Dashboard)
export const getPendingRequests = async (req, res) => {
  try {
    const pending = await Property.find({ status: "pending" });
    res.json(pending);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// REJECT REQUEST (Admin Action)
export const rejectPropertyRequest = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Request not found." });

    if (property.requestType === "delete") {
      property.status = "approved";
      property.requestType = "add";
      await property.save();
      return res.json({ message: "Delete request rejected. Property restored." });
    }

    await Property.findByIdAndDelete(req.params.id);
    res.json({ message: "Request rejected and deleted." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET APPROVED PROPERTIES FOR LOGGED-IN AGENT
export const getAgentProperties = async (req, res) => {
  try {
    const properties = await Property.find({
      postedByAgent: req.agent.id,
      status: "approved",
      requestType: "add"
    });
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CREATE PROPERTY DIRECTLY
export const createPropertyDirect = async (req, res) => {
  try {
    const image = req.file?.filename || null;
    const {
      title,
      description,
      contactName,
      contactNumber,
      propertyType,
      district,
      price
    } = req.body;

    const property = new Property({
      title,
      description,
      contactName,
      contactNumber,
      propertyType,
      district,
      price,
      image,
      status: "approved",
      requestType: "add",
      postedByAgent: req.agent.id,
    });

    await property.save();
    res.status(201).json({ message: "Property added successfully.", property });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE PROPERTY DIRECTLY
export const updatePropertyDirect = async (req, res) => {
  try {
    const property = await Property.findOne({
      _id: req.params.id,
      postedByAgent: req.agent.id
    });

    if (!property) return res.status(404).json({ message: "Property not found or unauthorized" });

    const image = req.file?.filename || property.image;

    const {
      title,
      description,
      contactName,
      contactNumber,
      propertyType,
      district,
      price
    } = req.body;

    property.title = title || property.title;
    property.description = description || property.description;
    property.contactName = contactName || property.contactName;
    property.contactNumber = contactNumber || property.contactNumber;
    property.propertyType = propertyType || property.propertyType;
    property.district = district || property.district;
    property.price = price || property.price;
    property.image = image;

    await property.save();
    res.json({ message: "Property updated successfully.", property });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE PROPERTY DIRECTLY
export const deletePropertyDirect = async (req, res) => {
  try {
    const property = await Property.findOneAndDelete({
      _id: req.params.id,
      postedByAgent: req.agent.id
    });

    if (!property) return res.status(404).json({ message: "Property not found or unauthorized" });

    res.json({ message: "Property deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL PROPERTIES BY LOGGED-IN AGENT
export const getAllAgentProperties = async (req, res) => {
  try {
    const properties = await Property.find({
      postedByAgent: req.agent.id
    }).sort({ createdAt: -1 });

    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET FILTERED REPORT (Dynamic)
export const getFilteredReport = async (req, res) => {
  try {
    const { type, status, district, agentId } = req.query;
    const query = {};

    if (type) query.propertyType = type;
    if (status) query.status = status;
    if (district) query.district = district;
    if (agentId) query.postedByAgent = agentId;

    const results = await Property.find(query).populate("postedByAgent", "email");
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
