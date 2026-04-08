//routes/auth.js
import { Router } from "express";
import bcrypt from "bcrypt";
import { UserModel } from "../models/userModel.js";

const router = Router();

router.get("/register", (req, res) => {
  res.render("register", {
    title: "Register"
  });
});

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).render("error", {
        title: "Registration failed",
        message: "All fields are required."
      });
    }

    if (password.length < 8) {
        return res.status(400).render("error", {
          title: "Registration failed",
          message: "Password must be at least 8 characters long."
        });
      }

    const existing = await UserModel.findByEmail(email);
    if (existing) {
      return res.status(400).render("error", {
        title: "Registration failed",
        message: "An account with that email already exists."
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await UserModel.create({
      name,
      email,
      passwordHash,
      role: "user"
    });

    req.session.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    res.redirect("/courses");
  } catch (err) {
    console.error(err);
    res.status(500).render("error", {
      title: "Registration failed",
      message: "Unable to create account."
    });
  }
});

router.get("/login", (req, res) => {
  res.render("login", {
    title: "Login"
  });
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findByEmail(email);
    if (!user || !user.passwordHash) {
      return res.status(400).render("error", {
        title: "Login failed",
        message: "Invalid email or password."
      });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(400).render("error", {
        title: "Login failed",
        message: "Invalid email or password."
      });
    }

    req.session.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    res.redirect("/courses");
  } catch (err) {
    console.error(err);
    res.status(500).render("error", {
      title: "Login failed",
      message: "Unable to log in."
    });
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

export default router;