// routes/views.js
import { Router } from "express";
import {
  homePage,
  aboutPage,
  courseDetailPage,
  bookingConfirmationPage,
} from "../controllers/viewsController.js";
import {
  coursesListPage,
  organiserDashboardPage,
  organiserNewCoursePage,
  organiserEditCoursePage,
  organiserCourseParticipantsPage,
  organiserSessionParticipantsPage,
} from "../controllers/coursesListController.js";
import { requireOrganiser } from "../middlewares/requireOrganiser.js";

const router = Router();

router.get("/", homePage);
router.get("/about", aboutPage);
router.get("/courses", coursesListPage);
router.get("/courses/:id", courseDetailPage);
router.get("/bookings/:bookingId", bookingConfirmationPage);

router.get("/organiser", requireOrganiser, organiserDashboardPage);
router.get("/organiser/courses/new", requireOrganiser, organiserNewCoursePage);
router.get("/organiser/courses/:id/edit", requireOrganiser, organiserEditCoursePage);
router.get("/organiser/courses/:id/participants", requireOrganiser, organiserCourseParticipantsPage);
router.get("/organiser/sessions/:id/participants", requireOrganiser, organiserSessionParticipantsPage);

export default router;
