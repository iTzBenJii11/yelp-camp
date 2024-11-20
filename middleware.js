// Login middleware which checks to see if the user is current logged in before accessing the route.
module.exports.isLoggedIn = (req, res, next) => {
  // Is the user Authenticated?
  if (!req.isAuthenticated()) {
    // Returns uses to the original URL they were previously on before sign in
    req.session.returnTo = req.originalUrl;
    req.flash("success", "You must be logged in");
    return res.redirect("/login");
  }
  next();
};

// Middleware to store the returnTo within the session
module.exports.storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};
