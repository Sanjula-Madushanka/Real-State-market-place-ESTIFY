import Booking from "../../Models/BookingModel.js";
import Property from "../../Models/PropertyModel.js";

// ✅ Get All Bookings (User/Admin)
export const getAllBooking = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;
    const { status, propertyId } = req.query;

    let query = {};
    if (propertyId) query.property = propertyId;
    if (status) query.status = status;
    if (userRole !== "admin") query.user = userId;

    const bookings = await Booking.find(query).populate("property");
    return res.status(200).json({ bookings });
  } catch (err) {
    console.error("Error in getAllBooking:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Get Bookings for Specific Property (Availability)
export const getPropertyBookings = async (req, res) => {
  const { propertyId, status } = req.query;

  if (!propertyId) {
    return res.status(400).json({ message: "Property ID is required" });
  }

  try {
    const query = {
      property: propertyId,
      status: status || { $ne: "rejected" },
    };

    const bookings = await Booking.find(query)
      .select("startDate endDate status")
      .lean();

    return res.status(200).json({ bookings });
  } catch (err) {
    console.error("Error in getPropertyBookings:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Add New Booking
export const addBookings = async (req, res) => {
  try {
    const { propertyId, startDate, endDate } = req.body;
    const userId = req.user.userId;

    if (!propertyId || !startDate || !endDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const property = await Property.findOne({
      _id: propertyId,
      propertyType: "rent",
      status: "approved",
    });

    if (!property) {
      return res
        .status(404)
        .json({ message: "Property not found or not available for rent" });
    }

    const overlappingBooking = await Booking.findOne({
      property: propertyId,
      status: { $ne: "rejected" },
      $or: [{ startDate: { $lt: endDate }, endDate: { $gt: startDate } }],
    });

    if (overlappingBooking) {
      return res.status(400).json({
        message: "Property is not available during the requested dates",
      });
    }

    const booking = new Booking({
      user: userId,
      property: propertyId,
      price: property.price,
      startDate,
      endDate,
      status: "pending",
    });

    await booking.save();

    return res.status(201).json({ booking });
  } catch (err) {
    console.error("Error in addBookings:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Confirm Booking
export const confirmBooking = async (req, res) => {
  try {
    const id = req.params.id;

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status: "confirmed" },
      { new: true }
    ).populate("property");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    return res.status(200).json({ booking });
  } catch (err) {
    console.error("Error in confirmBooking:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Reject Booking
export const rejectBooking = async (req, res) => {
  try {
    const id = req.params.id;

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status: "rejected" },
      { new: true }
    ).populate("property");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    return res.status(200).json({ booking });
  } catch (err) {
    console.error("Error in rejectBooking:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Get Booking By ID
export const getById = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.userId;

    const booking = await Booking.findOne({ _id: id, user: userId })
      .populate("property")
      .populate("user");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    return res.status(200).json({ booking });
  } catch (err) {
    console.error("Error in getById:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Update Booking (Dates only)
export const updateBooking = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.userId;
    const { startDate, endDate } = req.body;

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return res
        .status(400)
        .json({ message: "End date must be after start date" });
    }

    const existingBooking = await Booking.findOne({ _id: id, user: userId });
    if (!existingBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const newStart = startDate || existingBooking.startDate;
    const newEnd = endDate || existingBooking.endDate;

    const overlappingBooking = await Booking.findOne({
      property: existingBooking.property,
      _id: { $ne: id },
      status: { $ne: "rejected" },
      $or: [{ startDate: { $lt: newEnd }, endDate: { $gt: newStart } }],
    });

    if (overlappingBooking) {
      return res.status(400).json({
        message: "Property is not available during the requested dates",
      });
    }

    const updatedBooking = await Booking.findOneAndUpdate(
      { _id: id, user: userId },
      { startDate: newStart, endDate: newEnd },
      { new: true }
    ).populate("property");

    return res.status(200).json({ booking: updatedBooking });
  } catch (err) {
    console.error("Error in updateBooking:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Delete Booking
export const deleteBooking = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.userId;

    const booking = await Booking.findOneAndDelete({ _id: id, user: userId });

    if (!booking) {
      return res
        .status(404)
        .json({ message: "Unable to delete booking details" });
    }

    return res.status(200).json({ booking });
  } catch (err) {
    console.error("Error in deleteBooking:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
