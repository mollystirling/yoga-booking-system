// routes/bookings.js
import { Router } from "express";
import {
  bookCourse,
  bookSession,
  cancelBooking,
} from "../controllers/bookingController.js";
import { BookingModel } from "../models/bookingModel.js";
import { requireUser } from "../middlewares/requireUser.js";

const router = Router();

router.post("/course", requireUser, bookCourse);
router.post("/session", requireUser, bookSession);
router.post("/:bookingId/cancel", requireUser, cancelBooking);

router.get("/:bookingId", requireUser, async (req, res) => {
  try {
    const booking = await BookingModel.findById(req.params.bookingId);

    if (!booking) {
      return res.status(404).render("error", {
        title: "Booking not found",
        message: "The booking confirmation could not be displayed.",
      });
    }

    const isOwner = booking.userId === req.user._id;
    const isOrganiser = req.user.role === "organiser";

    if (!isOwner && !isOrganiser) {
      return res.status(403).render("error", {
        title: "Access denied",
        message: "You are not allowed to view this booking.",
      });
    }

    res.render("booking_confirmation", {
      title: "Booking Confirmation",
      booking: {
        _id: booking._id,
        type: booking.type,
        status: booking.status,
        createdAt: booking.createdAt
          ? new Date(booking.createdAt).toLocaleString("en-GB")
          : "",
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).render("error", {
      title: "Booking failed",
      message: "Unable to load booking confirmation.",
    });
  }
});

export default router;