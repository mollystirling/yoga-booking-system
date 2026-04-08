// controllers/viewsController.js
import { CourseModel } from "../models/courseModel.js";
import { SessionModel } from "../models/sessionModel.js";
import { BookingModel } from "../models/bookingModel.js";

const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleString("en-GB", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "TBA";

const fmtDateOnly = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

export const homePage = async (req, res, next) => {
  try {
    const courses = await CourseModel.list();

    const cards = await Promise.all(
      courses.map(async (course) => {
        const sessions = await SessionModel.listByCourse(course._id);
        const nextSession = sessions[0];

        return {
          id: course._id,
          title: course.title,
          level: course.level,
          type: course.type,
          allowDropIn: course.allowDropIn,
          startDate: fmtDateOnly(course.startDate),
          endDate: fmtDateOnly(course.endDate),
          nextSession: nextSession ? fmtDate(nextSession.startDateTime) : "TBA",
          sessionsCount: sessions.length,
          description: course.description,
          location: course.location || "",
          price: course.price ?? "",
        };
      })
    );

    res.render("home", {
      title: "Yoga Courses",
      courses: cards,
    });
  } catch (err) {
    next(err);
  }
};

export const aboutPage = async (req, res, next) => {
  try {
    const courses = await CourseModel.list();

    const courseSummaries = courses.map((course) => ({
      title: course.title,
      level: course.level,
      type: course.type,
      location: course.location || "Studio location shown on course page",
      price: course.price ?? "",
      description: course.description,
    }));

    res.render("about", {
      title: "About the Studio",
      studio: {
        name: "Yoga Studio",
        description:
          "We offer welcoming yoga and mindfulness classes for a range of experience levels, from beginner sessions to more advanced workshops.",
        location:
          "Classes take place at our Glasgow studio locations. Full venue details are shown on each course page.",
        classesInfo:
          "Our timetable includes weekly block courses and weekend workshops, with some classes allowing drop-in booking.",
      },
      courses: courseSummaries,
    });
  } catch (err) {
    next(err);
  }
};

export const courseDetailPage = async (req, res, next) => {
  try {
    const courseId = req.params.id;
    const course = await CourseModel.findById(courseId);

    if (!course) {
      return res.status(404).render("error", {
        title: "Not found",
        message: "Course not found",
      });
    }

    const sessions = await SessionModel.listByCourse(courseId);

    const rows = sessions.map((session) => ({
      sessionId: session._id,
      start: fmtDate(session.startDateTime),
      end: fmtDate(session.endDateTime),
      capacity: session.capacity,
      booked: session.bookedCount ?? 0,
      remaining: Math.max(
        0,
        (session.capacity ?? 0) - (session.bookedCount ?? 0)
      ),
      allowDropIn: course.allowDropIn,
      isFull: (session.bookedCount ?? 0) >= (session.capacity ?? 0),
    }));

    res.render("course", {
      title: course.title,
      course: {
        _id: course._id,
        title: course.title,
        level: course.level,
        type: course.type,
        allowDropIn: course.allowDropIn,
        startDate: fmtDateOnly(course.startDate),
        endDate: fmtDateOnly(course.endDate),
        description: course.description,
        location: course.location || "",
        price: course.price ?? "",
      },
      sessions: rows,
    });
  } catch (err) {
    next(err);
  }
};

export const bookingConfirmationPage = async (req, res, next) => {
  try {
    const bookingId = req.params.bookingId;
    const booking = await BookingModel.findById(bookingId);

    if (!booking) {
      return res.status(404).render("error", {
        title: "Not found",
        message: "Booking not found",
      });
    }

    const isOwner = booking.userId === req.user?._id;
    const isOrganiser = req.user?.role === "organiser";

    if (!isOwner && !isOrganiser) {
      return res.status(403).render("error", {
        title: "Access denied",
        message: "You are not allowed to view this booking.",
      });
    }

    res.render("booking_confirmation", {
      title: "Booking confirmation",
      booking: {
        _id: booking._id,
        type: booking.type,
        status: req.query.status || booking.status,
        createdAt: booking.createdAt ? fmtDate(booking.createdAt) : "",
      },
    });
  } catch (err) {
    next(err);
  }
};
