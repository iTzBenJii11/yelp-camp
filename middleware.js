// Login middleware which checks to see if the user is current logged in before accessing the route.
module.exports.isLoggedIn = (req, res, next) => {
  // Is the user Authenticated?
  if (!req.isAuthenticated()) {
    req.flash("success", "You must be logged in");
    return res.redirect("/login");
  }
  next();
};

// Test to see if req.user is working.
module.exports.isLoggedInTest = (req, res, next) => {
  // Gets the user obj
  const currentUserTest = req.user;
  console.log(currentUserTest);
  next();
};
