// controllers/coursesListController.js
import { CourseModel } from "../models/courseModel.js";
import { SessionModel } from "../models/sessionModel.js";
import { BookingModel } from "../models/bookingModel.js";
import { UserModel } from "../models/userModel.js";

const fmtDateOnly = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

const fmtDateTime = (iso) =>
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

export const coursesListPage = async (req, res, next) => {
  try {
    const {
      level,
      type,
      dropin,
      q,
      page = "1",
      pageSize = "10",
    } = req.query;

    const filter = {};
    if (level) filter.level = level;
    if (type) filter.type = type;
    if (dropin === "yes") filter.allowDropIn = true;
    if (dropin === "no") filter.allowDropIn = false;

    let courses = await CourseModel.list(filter);

    const needle = (q || "").trim().toLowerCase();
    if (needle) {
      courses = courses.filter(
        (c) =>
          c.title?.toLowerCase().includes(needle) ||
          c.description?.toLowerCase().includes(needle) ||
          c.location?.toLowerCase().includes(needle)
      );
    }

    courses.sort((a, b) => {
      const ad = a.startDate
        ? new Date(a.startDate).getTime()
        : Number.MAX_SAFE_INTEGER;
      const bd = b.startDate
        ? new Date(b.startDate).getTime()
        : Number.MAX_SAFE_INTEGER;
      if (ad !== bd) return ad - bd;
      return (a.title || "").localeCompare(b.title || "");
    });

    const p = Math.max(1, parseInt(page, 10) || 1);
    const ps = Math.max(1, parseInt(pageSize, 10) || 10);
    const total = courses.length;
    const totalPages = Math.max(1, Math.ceil(total / ps));
    const start = (p - 1) * ps;
    const pageItems = courses.slice(start, start + ps);

    const cards = await Promise.all(
      pageItems.map(async (c) => {
        const sessions = await SessionModel.listByCourse(c._id);
        const first = sessions[0];

        return {
          id: c._id,
          title: c.title,
          level: c.level,
          type: c.type,
          allowDropIn: c.allowDropIn,
          startDate: fmtDateOnly(c.startDate),
          endDate: fmtDateOnly(c.endDate),
          nextSession: first ? fmtDateTime(first.startDateTime) : "TBA",
          sessionsCount: sessions.length,
          description: c.description,
          location: c.location || "",
          price: c.price ?? "",
        };
      })
    );

    const pagination = {
      page: p,
      pageSize: ps,
      total,
      totalPages,
      hasPrev: p > 1,
      hasNext: p < totalPages,
      prevLink: p > 1 ? buildLink(req, p - 1, ps) : null,
      nextLink: p < totalPages ? buildLink(req, p + 1, ps) : null,
    };

    res.render("courses", {
      title: "Courses",
      filters: {
        level,
        type,
        dropin,
        q,
        isBeginner: level === "beginner",
        isIntermediate: level === "intermediate",
        isAdvanced: level === "advanced",
      },
      courses: cards,
      pagination,
    });
  } catch (err) {
    next(err);
  }
};

function buildLink(req, page, pageSize) {
  const url = new URL(
    `${req.protocol}://${req.get("host")}${req.originalUrl.split("?")[0]}`
  );
  const params = new URLSearchParams(req.query);
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  return `${url.pathname}?${params.toString()}`;
}

export const organiserDashboardPage = async (req, res, next) => {
  try {
    const courses = await CourseModel.list();

    const cards = await Promise.all(
      courses.map(async (c) => {
        const sessions = await SessionModel.listByCourse(c._id);
        return {
          _id: c._id,
          title: c.title,
          level: c.level,
          type: c.type,
          allowDropIn: c.allowDropIn,
          startDate: fmtDateOnly(c.startDate),
          endDate: fmtDateOnly(c.endDate),
          sessionsCount: sessions.length,
          description: c.description,
          location: c.location || "",
          price: c.price ?? "",
        };
      })
    );

    res.render("organiser_dashboard", {
      title: "Organiser Dashboard",
      courses: cards,
    });
  } catch (err) {
    next(err);
  }
};

export const organiserNewCoursePage = async (req, res) => {
  res.render("organiser_course_form", {
    title: "Add Course",
    course: {
      allowDropIn: false,
    },
    action: "/organiser/courses",
    submitLabel: "Create Course",
  });
};

export const organiserEditCoursePage = async (req, res, next) => {
  try {
    const course = await CourseModel.findById(req.params.id);

    if (!course) {
      return res.status(404).render("error", {
        title: "Course not found",
        message: "The requested course could not be found.",
      });
    }

    const sessions = await SessionModel.listByCourse(course._id);

    const sessionRows = sessions.map((s) => ({
      _id: s._id,
      startDateTime: s.startDateTime ? s.startDateTime.slice(0, 16) : "",
      endDateTime: s.endDateTime ? s.endDateTime.slice(0, 16) : "",
      capacity: s.capacity,
      bookedCount: s.bookedCount ?? 0,
    }));

    res.render("organiser_course_form", {
      title: "Edit Course",
      course: {
        ...course,
        isBeginner: course.level === "beginner",
        isIntermediate: course.level === "intermediate",
        isAdvanced: course.level === "advanced",
        isWeeklyBlock: course.type === "WEEKLY_BLOCK",
        isWeekendWorkshop: course.type === "WEEKEND_WORKSHOP",
      },
      sessions: sessionRows,
      action: `/organiser/courses/${course._id}`,
      submitLabel: "Update Course",
    });
  } catch (err) {
    next(err);
  }
};

export const organiserCourseParticipantsPage = async (req, res, next) => {
  try {
    const course = await CourseModel.findById(req.params.id);

    if (!course) {
      return res.status(404).render("error", {
        title: "Course not found",
        message: "The requested course could not be found.",
      });
    }

    const bookings = await BookingModel.listByCourse(course._id);

    const participants = await Promise.all(
      bookings.map(async (booking) => {
        const user = await UserModel.findById(booking.userId);
        return {
          bookingId: booking._id,
          name: user?.name || "Unknown user",
          email: user?.email || "Unknown email",
          status: booking.status,
          type: booking.type,
          createdAt: booking.createdAt
            ? new Date(booking.createdAt).toLocaleString("en-GB")
            : "",
        };
      })
    );

    res.render("organiser_participants", {
      title: `Participants - ${course.title}`,
      heading: `Participants for ${course.title}`,
      participants,
    });
  } catch (err) {
    next(err);
  }
};

export const organiserSessionParticipantsPage = async (req, res, next) => {
  try {
    const session = await SessionModel.findById(req.params.id);

    if (!session) {
      return res.status(404).render("error", {
        title: "Session not found",
        message: "The requested session could not be found.",
      });
    }

    const bookings = await BookingModel.listBySession(session._id);

    const participants = await Promise.all(
      bookings.map(async (booking) => {
        const user = await UserModel.findById(booking.userId);
        return {
          bookingId: booking._id,
          name: user?.name || "Unknown user",
          email: user?.email || "Unknown email",
          status: booking.status,
          type: booking.type,
          createdAt: booking.createdAt
            ? new Date(booking.createdAt).toLocaleString("en-GB")
            : "",
        };
      })
    );

    res.render("organiser_participants", {
      title: "Session Participants",
      heading: "Participants for selected session",
      participants,
    });
  } catch (err) {
    next(err);
  }
};