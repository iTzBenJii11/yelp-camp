////////////// Requiring Modules //////////////

// Express
const express = require("express");

// Router Configuration
const router = express.Router({ mergeParams: true });

// User model
const User = require("../models/user");

// Helper Function for Error Handling
const wrapAsync = require("../errors/WarpAsync");

// Require Passport
const passport = require("passport");

////////////// REGISTER //////////////

// GET: Register User form
router.get("/register", (req, res) => {
  res.render("users/register");
});

// POST: Register User
router.post(
  "/register",
  wrapAsync(async (req, res) => {
    try {
      const { email, username, password } = req.body.user;
      console.log(
        `The email is ${email}, your username is ${username} and your password if ${password}`
      );

      // Create a user instance
      const user = new User({ email, username });

      // Registers / adds user to users collection
      const newUser = await User.register(user, password);

      // Testing
      console.log(newUser);

      // Flash the user has registered
      req.flash("success", "Welcome to Yelp Camp");

      // Redirects user to campgrounds
      res.redirect("/campgrounds");
    } catch (e) {
      // Error/Testing
      console.log(e.message);

      // Flash the error message to the user
      req.flash("success", e.message);

      // Redirect to the register page
      res.redirect("/register");
    }
  })
);

////////////// LOGIN //////////////

// GET: Login Page
router.get("/login", (req, res) => {
  res.render("users/login");
});

// POST: Login User
router.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  (req, res) => {
    req.flash("success", "welcome back");
    res.redirect("/campgrounds");
  }
);

module.exports = router;
