// controllers/bookingController.js
import {
  bookCourseForUser,
  bookSessionForUser,
} from "../services/bookingService.js";
import { BookingModel } from "../models/bookingModel.js";
import { SessionModel } from "../models/sessionModel.js";

export const bookCourse = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).render("error", {
        title: "Login required",
        message: "You must be logged in to book a course.",
      });
    }

    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).render("error", {
        title: "Booking failed",
        message: "Missing course ID.",
      });
    }

    const booking = await bookCourseForUser(req.user._id, courseId);
    return res.redirect(`/bookings/${booking._id}`);
  } catch (err) {
    console.error(err);
    return res.status(400).render("error", {
      title: "Booking failed",
      message: err.message || "Unable to complete course booking.",
    });
  }
};

export const bookSession = async (req, res) => {
  try {
    console.log("bookSession req.body =", req.body);
    if (!req.user?._id) {
      return res.status(401).render("error", {
        title: "Login required",
        message: "You must be logged in to book a session.",
      });
    }

    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).render("error", {
        title: "Booking failed",
        message: "Missing session ID.",
      });
    }

    const booking = await bookSessionForUser(req.user._id, sessionId);
    return res.redirect(`/bookings/${booking._id}`);
  } catch (err) {
    console.error(err);
    return res.status(400).render("error", {
      title: "Booking failed",
      message: err.message || "Unable to complete session booking.",
    });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).render("error", {
        title: "Login required",
        message: "You must be logged in to cancel a booking.",
      });
    }

    const { bookingId } = req.params;
    const booking = await BookingModel.findById(bookingId);

    if (!booking) {
      return res.status(404).render("error", {
        title: "Booking not found",
        message: "The booking you tried to cancel could not be found.",
      });
    }

    const isOwner = booking.userId === req.user._id;
    const isOrganiser = req.user.role === "organiser";

    if (!isOwner && !isOrganiser) {
      return res.status(403).render("error", {
        title: "Access denied",
        message: "You are not allowed to cancel this booking.",
      });
    }

    if (booking.status === "CANCELLED") {
      return res.redirect(`/bookings/${booking._id}`);
    }

    if (booking.status === "CONFIRMED" && Array.isArray(booking.sessionIds)) {
      for (const sid of booking.sessionIds) {
        await SessionModel.incrementBookedCount(sid, -1);
      }
    }

    await BookingModel.cancel(bookingId);

    return res.redirect(`/bookings/${booking._id}`);
  } catch (err) {
    console.error(err);
    return res.status(500).render("error", {
      title: "Cancellation failed",
      message: "Failed to cancel booking.",
    });
  }
};