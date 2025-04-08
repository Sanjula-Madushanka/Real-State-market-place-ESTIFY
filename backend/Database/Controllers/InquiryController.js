// InquiryController.js
import Inquiry from "../../Models/InquiryModel.js"; // Adjusted path with .js extension
import Booking from "../../Models/BookingModel.js"; // Adjusted path with .js extension

export const submitInquiry = async (req, res) => {
    const { bookingId, message } = req.body;
    const userId = req.user.userId;

    const booking = await Booking.findOne({ _id: bookingId, user: userId });
    if (!booking) {
        return res.status(404).json({ message: "Booking not found or access denied" });
    }

    let inquiry;
    try {
        inquiry = new Inquiry({ booking: bookingId, user: userId, message });
        await inquiry.save();
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }

    if (!inquiry) {
        return res.status(400).json({ message: "Unable to submit inquiry" });
    }
    return res.status(201).json({ inquiry });
};

export const respondToInquiry = async (req, res) => {
    const inquiryId = req.params.id;
    const { response } = req.body;

    let inquiry;
    try {
        inquiry = await Inquiry.findByIdAndUpdate(
            inquiryId,
            { response, status: "responded" },
            { new: true }
        );
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }

    if (!inquiry) {
        return res.status(404).json({ message: "Inquiry not found" });
    }
    return res.status(200).json({ inquiry });
};

export const getUserInquiries = async (req, res) => {
    const userId = req.user.userId;

    let inquiries;
    try {
        inquiries = await Inquiry.find({ user: userId }).populate("booking");
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }

    if (!inquiries || inquiries.length === 0) {
        return res.status(404).json({ message: "No inquiries found" });
    }
    return res.status(200).json({ inquiries });
};

export const getAllInquiries = async (req, res) => {
    let inquiries;
    try {
        inquiries = await Inquiry.find().populate("booking user");
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }

    if (!inquiries || inquiries.length === 0) {
        return res.status(404).json({ message: "No inquiries found" });
    }
    return res.status(200).json({ inquiries });
};