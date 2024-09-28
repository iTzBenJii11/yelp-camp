////////////// Requiring //////////////

// Express
const express = require("express");
const app = express();

// Random Joke
const { randomJoke } = require("./randomJoke");

// EJS
app.set("view engine", "ejs");

// Path
const path = require("path");
app.set("views", path.join(__dirname, "/views"));

// EJS-MATE
const ejsEngine = require("ejs-mate");
app.engine("ejs", ejsEngine);

// Global app error
const AppError = require("./errors/AppError");

// Helper Function for error handling
const wrapAsync = require("./errors/WarpAsync");

////////////// MIDDLEWARE //////////////
// Allow the use for parsing
app.use(express.urlencoded({ extended: true }));

// Allow the use of method override
const methodOverride = require("method-override");
app.use(methodOverride("_method")); // Tells all routes to use the middleware

// Morgan Middleware (logs information about the incoming request)
const morgan = require("morgan");
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);

////////////// DATABASE IMPLEMENTATION //////////////

// Mongoose / MongoDB
const mongoose = require("mongoose");

// Import Schema
const Campground = require("./models/campground");

// Connect DB
mongoose
  .connect("mongodb://127.0.0.1:27017/yelp-camp")
  .then(() => console.log("Connected!"))
  .catch((e) => {
    console.error(e);
    console.log("AN ERROR HAS OCCURRED");
  });

////////////// SECRET PAGE //////////////
const secretPage = (req, res, next) => {
  const { password } = req.query;
  if (password === "431212") {
    next();
  } else {
    res.send("YOU DON'T HAVE ACCESS TO THIS PAGE");
  }
};

app.get("/secret", secretPage, (req, res) => {
  res.send("HELLO AND WELCOME TO THIS SECRET PAGE");
});

////////////// Routing CRUD //////////////

// GET: Home Page
app.get("/", (req, res) => {
  res.render("home");
});

////////////// DISPLAYS CAMPGROUNDS //////////////

// GET: Display all Campgrounds
app.get(
  "/campgrounds",
  wrapAsync(async (req, res, next) => {
    // Fetch all campgrounds from database
    const campgrounds = await Campground.find({});
    // Throw error if no campgrounds are found
    if (campgrounds.length === 0) {
      throw new AppError("No campgrounds found", 404);
    }
    // Render all campgrounds index page
    res.render("campgrounds/index", { campgrounds });
  })
);

////////////// CREATE CAMPGROUND AND ADD TO DATABASE //////////////

// GET: Create Campground
app.get("/campgrounds/create", (req, res) => {
  res.render("campgrounds/create");
});

// POST: Created Campground Added To DB
app.post(
  "/campgrounds",
  wrapAsync(async (req, res, next) => {
    const newCampground = new Campground(req.body);
    await newCampground.save();
    res.redirect(`/campgrounds/${newCampground._id}`);
  })
);

////////////// UPDATE EXISTING CAMPGROUND //////////////

app.get(
  "/campgrounds/:id/edit",
  wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const campgroundType = await Campground.findById(id);
    res.render("campgrounds/update", { campgroundType });
  })
);

app.put(
  "/campgrounds/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const campgroundEdit = await Campground.findByIdAndUpdate(id, req.body);
    res.redirect(`${campgroundEdit._id}`);
  })
);

////////////// DISPLAY CAMPGROUNDS BY ID //////////////

// GET: Display Campgrounds by ID
app.get(
  "/campgrounds/:id",
  wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const campgroundType = await Campground.findById(id);
    if (!campgroundType) {
      throw new AppError("Can't Locate Product!!!", 404);
    }
    res.render("campgrounds/view", { campgroundType });
  })
);

////////////// DELETE CAMPGROUND BY ID //////////////
app.delete(
  "/campgrounds/:id",
  wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
  })
);

////////////// ERROR HANDLING MIDDLEWARE //////////////

// Handles errors for pages/routes which are not valid
app.all("*", (req, res, next) => {
  next(new AppError("Page Not Found!", 404));
});

// Handles errors which we've not defined and response with a dad joke and error page.
app.use(async (err, req, res, next) => {
  try {
    // Des the statusError and Message from error and provides a default error code and message
    const { statusCode = 500, message = "Something went wrong" } = err;
    // Joke for error pages

    const jokeData = await randomJoke();
    const joke = jokeData.joke; // Extract the joke from the API response
    console.log(joke); // Test purpose

    res.status(statusCode).render("error-page", { statusCode, message, joke });
  } catch (e) {
    console.error(e);
    console.log("No dad joke available...");
  }
});

////////////// START EXPRESS SERVER //////////////

// Starting express
app.listen(3030, (req, res) => {
  console.log("CONNECTING TO SERVER");
});
