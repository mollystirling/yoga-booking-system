// models/_db.js
import Datastore from "nedb-promises";
import path from "path";
import { fileURLToPath } from "url";
import { promises as fs } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Always resolve relative to this file so seeding and server hit the SAME files
const dbDir = path.join(__dirname, "../db");

export const usersDb = Datastore.create({
  filename: path.join(dbDir, "users.db"),
  autoload: true,
});

export const coursesDb = Datastore.create({
  filename: path.join(dbDir, "courses.db"),
  autoload: true,
});

export const sessionsDb = Datastore.create({
  filename: path.join(dbDir, "sessions.db"),
  autoload: true,
});

export const bookingsDb = Datastore.create({
  filename: path.join(dbDir, "bookings.db"),
  autoload: true,
});

// Call this once at startup (server + seed)
export async function initDb() {
  await fs.mkdir(dbDir, { recursive: true });

  // Indexes
  await usersDb.ensureIndex({ fieldName: "email", unique: true });
  await sessionsDb.ensureIndex({ fieldName: "courseId" });

  // ===== SEED DATA =====

  // Seed courses if empty
  const courseCount = await coursesDb.count({});
  if (courseCount === 0) {
    const insertedCourses = await coursesDb.insert([
      {
        title: "Beginner Yoga",
        level: "beginner",
        type: "WEEKLY_BLOCK",
        description: "A gentle introduction to yoga.",
        location: "Glasgow Studio A",
        price: 50,
        startDate: "2026-05-01",
        endDate: "2026-06-01",
        allowDropIn: true,
        sessionIds: [],
      },
      {
        title: "Advanced Flow",
        level: "advanced",
        type: "WEEKEND_WORKSHOP",
        description: "Challenging flows for experienced yogis.",
        location: "Glasgow Studio B",
        price: 75,
        startDate: "2026-06-10",
        endDate: "2026-06-12",
        allowDropIn: false,
        sessionIds: [],
      },
    ]);

    // Seed sessions for each course
    for (const course of insertedCourses) {
      const sessions = await sessionsDb.insert([
        {
          courseId: course._id,
          startDateTime: "2026-05-01T18:00",
          endDateTime: "2026-05-01T19:00",
          capacity: 10,
          bookedCount: 0,
        },
        {
          courseId: course._id,
          startDateTime: "2026-05-08T18:00",
          endDateTime: "2026-05-08T19:00",
          capacity: 10,
          bookedCount: 0,
        },
      ]);

      // Link sessions to course
      await coursesDb.update(
        { _id: course._id },
        { $set: { sessionIds: sessions.map((s) => s._id) } }
      );
    }
  }
}