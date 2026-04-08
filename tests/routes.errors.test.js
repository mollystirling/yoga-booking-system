import request from "supertest";
import { app } from "../index.js";
import { resetDb, seedMinimal } from "./helpers.js";

describe("Error handling", () => {
  let data;

  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    await resetDb();
    data = await seedMinimal();
  });

  test("POST /bookings/session without login is blocked", async () => {
    const res = await request(app).post("/bookings/session").send({
      sessionId: data.sessions[0]._id,
    });

    expect([401, 302]).toContain(res.status);
  });

  test("POST /bookings/course without login is blocked", async () => {
    const res = await request(app).post("/bookings/course").send({
      courseId: data.course._id,
    });

    expect([401, 302]).toContain(res.status);
  });

  test("GET /bookings/:id without login is blocked", async () => {
    const res = await request(app).get("/bookings/some-id");
    expect([401, 302, 403, 404]).toContain(res.status);
  });
});
