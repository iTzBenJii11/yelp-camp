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

// Require middleware which stores the returnTo within the session
const { storeReturnTo } = require("../middleware");

////////////// REGISTER //////////////

// GET: Register User form
router.get("/register", (req, res) => {
  res.render("users/register");
});

// POST: Register User
router.post(
  "/register",
  wrapAsync(async (req, res, next) => {
    try {
      const { email, username, password } = req.body.user;
      console.log(
        `The email is ${email}, your username is ${username} and your password if ${password}`
      );

      // Create a user instance
      const user = new User({ email, username });

      // Registers / adds user to users collection
      const newUser = await User.register(user, password);

      // Logs te user in, requires a callback func
      req.login(newUser, (err) => {
        if (err) {
          next();
        }
        // Flash the user has registered
        req.flash("success", "Welcome to Yelp Camp");

        // Redirects user to campgrounds
        res.redirect("/campgrounds");
      });
    } catch (e) {
      // Checks to see if a username is already taken (11000 is duplicate username)
      if (e.code === 11000) {
        req.flash("success", "The username is already taken");
      } else {
        // Flash the error message to the user
        req.flash("success", e.message);
      }
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
  storeReturnTo,
  passport.authenticate("local", {
    failureMessage: true,
    failureRedirect: "/login", // Redirects to /login after failure
  }),
  (req, res) => {
    // Redirects to campground
    const redirectUrl = res.locals.returnTo || "/campgrounds";

    // Delete returnTo from the session after login
    delete req.session.returnTo;

    // Grabs username
    const { username } = req.body;
    // Flash the user with welcome message
    req.flash("success", `Welcome Back: ${username}`);
    res.redirect(redirectUrl);
  }
);

////////////// Logout //////////////

// GET: Logout Page
router.get("/logout", (req, res, next) => {
  res.render("users/logout");
});

// POST: Logout request
router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "Goodbye!");
    res.redirect("/campgrounds");
  });
});

module.exports = router;
