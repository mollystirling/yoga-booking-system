
// models/bookingModel.js
import { bookingsDb } from "./_db.js";

export const BookingModel = {
  async create(booking) {
    return bookingsDb.insert({
      ...booking,
      createdAt: new Date().toISOString(),
    });
  },

  async findById(id) {
    return bookingsDb.findOne({ _id: id });
  },

  async listByUser(userId) {
    return bookingsDb.find({ userId }).sort({ createdAt: -1 });
  },

  async listByCourse(courseId) {
    return bookingsDb.find({ courseId, status: { $ne: "CANCELLED" } });
  },

  async listBySession(sessionId) {
    return bookingsDb.find({
      sessionIds: sessionId,
      status: { $ne: "CANCELLED" },
    });
  },

  async findExistingCourseBooking(userId, courseId) {
    return bookingsDb.findOne({
      userId,
      courseId,
      type: "COURSE",
      status: { $ne: "CANCELLED" },
    });
  },

  async findExistingSessionBooking(userId, sessionId) {
    return bookingsDb.findOne({
      userId,
      type: "SESSION",
      sessionIds: sessionId,
      status: { $ne: "CANCELLED" },
    });
  },

  async cancel(id) {
    await bookingsDb.update({ _id: id }, { $set: { status: "CANCELLED" } });
    return this.findById(id);
  },
};
