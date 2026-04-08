export const requireUser = (req, res, next) => {
    if (!req.user) {
      return res.status(401).render("error", {
        title: "Login required",
        message: "You must be logged in to make a booking.",
      });
    }
    next();
  };