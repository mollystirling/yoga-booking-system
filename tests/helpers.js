// tests/helpers.js
import {
  initDb,
  usersDb,
  coursesDb,
  sessionsDb,
  bookingsDb,
} from "../models/_db.js";
import { UserModel } from "../models/userModel.js";
import { CourseModel } from "../models/courseModel.js";
import { SessionModel } from "../models/sessionModel.js";

export async function resetDb() {
  await initDb();
  await Promise.all([
    usersDb.remove({}, { multi: true }),
    coursesDb.remove({}, { multi: true }),
    sessionsDb.remove({}, { multi: true }),
    bookingsDb.remove({}, { multi: true }),
  ]);
  await Promise.all([
    usersDb.persistence.compactDatafile(),
    coursesDb.persistence.compactDatafile(),
    sessionsDb.persistence.compactDatafile(),
    bookingsDb.persistence.compactDatafile(),
  ]);
}

export async function seedMinimal() {
  const user = await UserModel.create({
    name: "Test User",
    email: "user@test.local",
    role: "user",
  });

  const organiser = await UserModel.create({
    name: "Test Organiser",
    email: "organiser@test.local",
    role: "organiser",
  });

  const course = await CourseModel.create({
    title: "Test Course",
    level: "beginner",
    type: "WEEKLY_BLOCK",
    allowDropIn: true,
    startDate: "2026-02-02",
    endDate: "2026-04-20",
    description: "A test course for route testing.",
    location: "Test Studio",
    price: 25,
    sessionIds: [],
  });

  const s1 = await SessionModel.create({
    courseId: course._id,
    startDateTime: new Date("2026-02-02T18:30:00").toISOString(),
    endDateTime: new Date("2026-02-02T19:45:00").toISOString(),
    capacity: 18,
    bookedCount: 0,
  });

  const s2 = await SessionModel.create({
    courseId: course._id,
    startDateTime: new Date("2026-02-09T18:30:00").toISOString(),
    endDateTime: new Date("2026-02-09T19:45:00").toISOString(),
    capacity: 18,
    bookedCount: 0,
  });

  await CourseModel.update(course._id, { sessionIds: [s1._id, s2._id] });

  return { user, organiser, course, sessions: [s1, s2] };
}