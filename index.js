// index.js
import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import mustacheExpress from "mustache-express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";

import courseRoutes from "./routes/courses.js";
import sessionRoutes from "./routes/sessions.js";
import bookingRoutes from "./routes/bookings.js";
import viewRoutes from "./routes/views.js";
import authRoutes from "./routes/auth.js";
import organiserRoutes from "./routes/organiser.js";
import { initDb } from "./models/_db.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

await initDb();

app.use((req, res, next) => {
  res.locals.year = new Date().getFullYear();
  next();
});

app.engine(
  "mustache",
  mustacheExpress(path.join(__dirname, "views", "partials"), ".mustache")
);
app.set("view engine", "mustache");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret-change-this",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
    },
  })
);

app.use("/static", express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  if (req.session?.user) {
    req.user = req.session.user;
    res.locals.user = {
      ...req.session.user,
      isOrganiser: req.session.user.role === "organiser",
    };
  } else {
    req.user = null;
    res.locals.user = null;
  }
  next();
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// Page routes
app.use("/", viewRoutes);
app.use("/auth", authRoutes);
app.use("/bookings", bookingRoutes);
app.use("/organiser", organiserRoutes);

// API routes
app.use("/api/courses", courseRoutes);
app.use("/api/sessions", sessionRoutes);

export const not_found = (req, res) => {
  res.status(404).render("error", {
    title: "404 Not Found",
    message: "The page you requested could not be found.",
  });
};

export const server_error = (err, req, res, next) => {
  console.error(err);
  res.status(500).render("error", {
    title: "Server Error",
    message: "Something went wrong on the server.",
  });
};

app.use(not_found);
app.use(server_error);

if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Yoga booking running on http://localhost:${PORT}`);
  });
}