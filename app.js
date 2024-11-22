////////////// Requiring //////////////

// Require DOTENV
require("dotenv").config();

// Stores the database value
const dbUrl = process.env.DB_URL;
console.log(process.env.DB_URL);

// Core Modules
const express = require("express");
const path = require("path");

// External Middleware
const flash = require("connect-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const morgan = require("morgan");

// Template Engine
const ejsEngine = require("ejs-mate");

// Custom Modules
const { randomJoke } = require("./randomJoke");
const AppError = require("./errors/AppError");

// Routing Modules
const campgrounds = require("./routes/campgrounds");
const reviews = require("./routes/reviews");
const users = require("./routes/users");

////////////// Mongo Session Configuration //////////////
const MongoStore = require("connect-mongo");

// Create the session store
const store = MongoStore.create({
  mongoUrl: dbUrl, // Use `mongoUrl` for database connection
  touchAfter: 24 * 60 * 60, // Lazy session update (1 day in seconds)
});

// Handle errors
store.on("error", (e) => {
  console.log(e);
});

////////////// App Configuration //////////////

// Initialize Express
const app = express();

// EJS Setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.engine("ejs", ejsEngine);

// Static Assets
app.use(express.static(path.join(__dirname, "public")));

// Express Middleware
app.use(express.urlencoded({ extended: true }));

// Method Override
app.use(methodOverride("_method"));

// Logging Middleware (Morgan)
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);

// Requiring passport / local passport
const passport = require("passport");
const LocalStrategy = require("passport-local");

////////////// Session and Flash //////////////

// Session Configuration
const sessionConfig = {
  store, // Apply mongo session store to session config
  secret: "thisisnotagoodsecretkey",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 604800000, // Expires within a week (in milliseconds)
    maxAge: 604800000, // Max age of the cookie is a week (in milliseconds)
  },
};

// Use the session with the configuration
app.use(session(sessionConfig));

// Flash Messages
app.use(flash());

////////////// Passport //////////////

// User model
const User = require("./models/user");

//Initialise Passport
app.use(passport.initialize());
app.use(passport.session());

// Tells passport to use Local Strategy
passport.use(new LocalStrategy(User.authenticate()));

// How to serialize user
passport.serializeUser(User.serializeUser());

// How to deserialize user
passport.deserializeUser(User.deserializeUser());

////////////// Middleware //////////////

// Middleware to Pass Flash Messages to All Routes
app.use((req, res, next) => {
  res.locals.currentUser = req.user; // Pass current user to all templates
  res.locals.error = req.flash("error"); // Pass error flash messages
  res.locals.success = req.flash("success"); // Pass success flash messages
  next(); // Move to the next middleware/route handler
});

////////////// Database Implementation //////////////

// Mongoose / MongoDB
const mongoose = require("mongoose");

// Connect to MongoDB
mongoose
  .connect(dbUrl)
  .then(() => console.log(`You're connected to ${dbUrl}`)) // Maybe add condition to display as connected to local or cloud db
  .catch((e) => {
    console.error(e);
    console.log("AN ERROR HAS OCCURRED");
  });

////////////// Routing //////////////

// Home Page Route
app.get("/", (req, res) => {
  const pic = "/img/homepageimg.png";
  res.render("home", { pic: pic });
});

// Campgrounds Router
app.use("/campgrounds", campgrounds);

// Reviews Router
app.use("/campgrounds/:id/reviews", reviews);

// Users Router
app.use("/", users);

////////////// Error Handling //////////////

// Handle Invalid Routes
app.all("*", (req, res, next) => {
  next(new AppError("Page Not Found!", 404));
});

// Custom Error Handler with Random Joke
app.use(async (err, req, res, next) => {
  try {
    const { statusCode = 500, message = "Something went wrong", stack } = err;

    // Get a random joke
    const jokeData = await randomJoke(); // Uncomment this line to use the API
    const joke = jokeData.joke; // Extract the joke from the API response

    console.log(joke); // Test purpose
    res
      .status(statusCode)
      .render("error-page", { statusCode, message, joke, stack });
  } catch (e) {
    console.error(e.message);
    console.log("No dad joke available...");
  }
});

////////////// Start Express Server //////////////

// Start Server
app.listen(3030, () => {
  console.log("CONNECTING TO SERVER");
});
