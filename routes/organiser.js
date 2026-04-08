//routes/organiser.js
import { Router } from "express";
import { requireOrganiser } from "../middlewares/requireOrganiser.js";
import { CourseModel } from "../models/courseModel.js";
import { SessionModel } from "../models/sessionModel.js";
import { UserModel } from "../models/userModel.js";
import {
  validateCourseInput,
  validateSessionInput,
  normaliseBoolean,
} from "../utils/validators.js";

const router = Router();

router.post("/courses", requireOrganiser, async (req, res) => {
  try {
    const errors = validateCourseInput(req.body);

    if (errors.length) {
      return res.status(400).render("error", {
        title: "Create course failed",
        message: errors.join(" "),
      });
    }

    const {
      title,
      level,
      type,
      description,
      location,
      price,
      startDate,
      endDate,
      allowDropIn,
    } = req.body;

    await CourseModel.create({
      title: title.trim(),
      level,
      type,
      description: description.trim(),
      location: location?.trim() || "",
      price: price ? Number(price) : 0,
      startDate,
      endDate,
      allowDropIn: normaliseBoolean(allowDropIn),
      sessionIds: [],
    });

    res.redirect("/organiser");
  } catch (err) {
    console.error(err);
    res.status(400).render("error", {
      title: "Create course failed",
      message: "Unable to create course.",
    });
  }
});

router.post("/courses/:id", requireOrganiser, async (req, res) => {
  try {
    const errors = validateCourseInput(req.body);

    if (errors.length) {
      return res.status(400).render("error", {
        title: "Update course failed",
        message: errors.join(" "),
      });
    }

    const {
      title,
      level,
      type,
      description,
      location,
      price,
      startDate,
      endDate,
      allowDropIn,
    } = req.body;

    await CourseModel.update(req.params.id, {
      title: title.trim(),
      level,
      type,
      description: description.trim(),
      location: location?.trim() || "",
      price: price ? Number(price) : 0,
      startDate,
      endDate,
      allowDropIn: normaliseBoolean(allowDropIn),
    });

    res.redirect("/organiser");
  } catch (err) {
    console.error(err);
    res.status(400).render("error", {
      title: "Update course failed",
      message: "Unable to update course.",
    });
  }
});

router.post("/courses/:id/delete", requireOrganiser, async (req, res) => {
  try {
    await CourseModel.delete(req.params.id);
    res.redirect("/organiser");
  } catch (err) {
    console.error(err);
    res.status(400).render("error", {
      title: "Delete course failed",
      message: "Unable to delete course.",
    });
  }
});

router.post(
  "/courses/:courseId/sessions",
  requireOrganiser,
  async (req, res) => {
    try {
      const errors = validateSessionInput(req.body);

      if (errors.length) {
        return res.status(400).render("error", {
          title: "Create session failed",
          message: errors.join(" "),
        });
      }

      const { startDateTime, endDateTime, capacity } = req.body;

      await SessionModel.create({
        courseId: req.params.courseId,
        startDateTime,
        endDateTime,
        capacity: Number(capacity),
        bookedCount: 0,
      });

      res.redirect(`/organiser/courses/${req.params.courseId}/edit`);
    } catch (err) {
      console.error(err);
      res.status(400).render("error", {
        title: "Create session failed",
        message: "Unable to create session.",
      });
    }
  }
);

router.post("/sessions/:id", requireOrganiser, async (req, res) => {
  try {
    const session = await SessionModel.findById(req.params.id);

    if (!session) {
      return res.status(404).render("error", {
        title: "Session not found",
        message: "The requested session could not be found.",
      });
    }

    const errors = validateSessionInput(req.body);

    if (errors.length) {
      return res.status(400).render("error", {
        title: "Update session failed",
        message: errors.join(" "),
      });
    }

    const { startDateTime, endDateTime, capacity } = req.body;

    await SessionModel.update(req.params.id, {
      startDateTime,
      endDateTime,
      capacity: Number(capacity),
    });

    res.redirect(`/organiser/courses/${session.courseId}/edit`);
  } catch (err) {
    console.error(err);
    res.status(400).render("error", {
      title: "Update session failed",
      message: "Unable to update session.",
    });
  }
});

router.post("/sessions/:id/delete", requireOrganiser, async (req, res) => {
  try {
    const session = await SessionModel.findById(req.params.id);

    if (!session) {
      return res.status(404).render("error", {
        title: "Session not found",
        message: "The requested session could not be found.",
      });
    }

    await SessionModel.delete(req.params.id);
    res.redirect(`/organiser/courses/${session.courseId}/edit`);
  } catch (err) {
    console.error(err);
    res.status(400).render("error", {
      title: "Delete session failed",
      message: "Unable to delete session.",
    });
  }
});

router.get("/users", requireOrganiser, async (req, res) => {
  try {
    const users = await UserModel.list();

    res.render("organiser_users", {
      title: "Manage Users",
      users: users.map((u) => ({
        _id: u._id,
        name: u.name,
        email: u.email,
        role: u.role || "user",
        isOrganiser: u.role === "organiser",
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).render("error", {
      title: "User list failed",
      message: "Unable to load users.",
    });
  }
});

router.post("/users/:id/promote", requireOrganiser, async (req, res) => {
  try {
    await UserModel.update(req.params.id, { role: "organiser" });
    res.redirect("/organiser/users");
  } catch (err) {
    console.error(err);
    res.status(400).render("error", {
      title: "Promotion failed",
      message: "Unable to promote user to organiser.",
    });
  }
});

router.post("/users/:id/remove", requireOrganiser, async (req, res) => {
  try {
    if (req.user && req.user._id === req.params.id) {
      return res.status(400).render("error", {
        title: "Action blocked",
        message: "You cannot remove your own account.",
      });
    }

    await UserModel.delete(req.params.id);
    res.redirect("/organiser/users");
  } catch (err) {
    console.error(err);
    res.status(400).render("error", {
      title: "Remove user failed",
      message: "Unable to remove user.",
    });
  }
});

export default router;