export const requireOrganiser = (req, res, next) => {
    if (!req.user) {
      return res.status(401).render("error", {
        title: "Login required",
        message: "You must be logged in to access this page.",
      });
    }
  
    if (req.user.role !== "organiser") {
      return res.status(403).render("error", {
        title: "Access denied",
        message: "This page is only available to organisers.",
      });
    }
  
    next();
  };